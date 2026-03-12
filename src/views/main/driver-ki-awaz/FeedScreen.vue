<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Heart, MessageCircle, Share2, Play, Pause, Loader2 } from 'lucide-vue-next'
import {
  getFeed,
  likePost,
  sharePost,
  getAvatarUrl,
  getMediaUrl,
} from '../../../services/dka/dkaApi'

const emit = defineEmits<{ (e: 'openComments', postId: string): void }>()

export interface FeedPost {
  id: string
  type: 'VOICE' | 'TEXT' | 'VIDEO' | 'IMAGE'
  userName: string
  userAvatar: string
  userState: string
  categoryLabel: string
  supportCount: number
  commentCount: number
  shareCount: number
  isSupported: boolean
  createdAt: string
  content?: string
  mediaUrl?: string
  audioUrl?: string
  videoUrl?: string
}

const posts = ref<FeedPost[]>([])
const loading = ref(false)
const refreshing = ref(false)
const cursor = ref<string | undefined>()
const lastId = ref<string | undefined>()
const hasMore = ref(true)
const playingAudioId = ref<string | null>(null)
const audioRefs = ref<Record<string, HTMLAudioElement>>({})
const feedContainerRef = ref<HTMLElement | null>(null)

function getTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  return `${diffDays}d`
}

function formatCount(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)
}

function mapToFeedPost(item: Record<string, unknown>): FeedPost {
  const rawUrl = (item.media_url as string) || ''
  const mediaUrl = getMediaUrl(rawUrl) || (rawUrl.startsWith('http') ? rawUrl : '')
  const rawAvatar = (item.user_avatar as string) || (item.user as Record<string, string>)?.avatar || ''
  let type: FeedPost['type'] = 'TEXT'
  if (item.media_type === 'audio') type = 'VOICE'
  else if (item.media_type === 'image') type = 'IMAGE'
  else if (item.media_type === 'video') type = 'VIDEO'

  return {
    id: String(item.id),
    type,
    userName: (item.user_name as string) || (item.user as Record<string, string>)?.name || 'Unknown',
    userAvatar: getAvatarUrl(rawAvatar),
    userState: (item.user as Record<string, string>)?.state || '',
    categoryLabel: item.category ? `#${item.category}` : 'General',
    supportCount: (item.likes_count as number) || 0,
    commentCount: (item.comments_count as number) || 0,
    shareCount: (item.shares_count as number) || 0,
    isSupported: (item.is_liked as number) === 1,
    createdAt: (item.created_at as string) || '',
    content: item.caption as string,
    mediaUrl,
    audioUrl: mediaUrl,
    videoUrl: mediaUrl,
  }
}

async function fetchFeed(refresh = false) {
  if (loading.value || (!hasMore.value && !refresh)) return
  loading.value = true
  if (refresh) refreshing.value = true
  try {
    const res = await getFeed(refresh ? undefined : cursor.value, refresh ? undefined : lastId.value)
    const raw = (res as { data?: unknown[] })?.data ?? (Array.isArray(res) ? res : [])
    const feedItems = raw.map((x: Record<string, unknown>) => mapToFeedPost(x))

    if (feedItems.length > 0) {
      if (refresh) posts.value = feedItems
      else posts.value = [...posts.value, ...feedItems]
      if (res.nextCursor) {
        cursor.value = res.nextCursor
        lastId.value = res.nextId?.toString()
        hasMore.value = res.hasMore !== false
      } else {
        const last = feedItems[feedItems.length - 1]
        if (last) {
          cursor.value = last.createdAt
          lastId.value = last.id
        }
      }
    } else {
      if (refresh) posts.value = []
      hasMore.value = false
    }
  } catch (e) {
    console.error('Feed fetch error', e)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function toggleLike(post: FeedPost) {
  post.isSupported = !post.isSupported
  post.supportCount += post.isSupported ? 1 : -1
  try {
    await likePost(post.id)
  } catch {
    post.isSupported = !post.isSupported
    post.supportCount += post.isSupported ? 1 : -1
  }
}

function toggleAudioPlay(post: FeedPost) {
  const el = audioRefs.value[post.id]
  if (!el) return
  if (playingAudioId.value === post.id) {
    el.pause()
    playingAudioId.value = null
  } else {
    Object.values(audioRefs.value).forEach((a) => a?.pause())
    playingAudioId.value = post.id
    el.play().catch(() => {})
  }
}

function onAudioEnd(postId: string) {
  if (playingAudioId.value === postId) playingAudioId.value = null
}

async function handleShare(post: FeedPost) {
  try {
    await sharePost(post.id)
    post.shareCount++
    if (navigator.share) {
      await navigator.share({
        title: 'Driver Ki Awaz',
        text: post.content || `${post.userName} on Driver Ki Awaz`,
        url: 'https://play.google.com/store/apps/details?id=com.truckmitr',
      })
    } else {
      await navigator.clipboard.writeText('https://play.google.com/store/apps/details?id=com.truckmitr')
    }
  } catch {}
}

function setAudioRef(postId: string, el: HTMLAudioElement | null) {
  if (el) audioRefs.value[postId] = el
}

function onFeedScroll(e: Event) {
  const el = e.target as HTMLElement
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 200
  if (nearBottom && !loading.value && hasMore.value) fetchFeed()
}

function updateCommentCount(postId: string) {
  const post = posts.value.find((p) => p.id === postId)
  if (post) post.commentCount++
}

onMounted(() => fetchFeed(true))
defineExpose({ fetchFeed, updateCommentCount })
</script>

<template>
  <div ref="feedContainerRef" class="feed-screen" @scroll="onFeedScroll">
    <div v-if="refreshing" class="feed-refresh">
      <Loader2 :size="20" class="spin" />
      <span>Refreshing...</span>
    </div>

    <div v-if="loading && posts.length === 0" class="feed-loading">
      <Loader2 :size="40" class="spin" />
      <p>Loading feed...</p>
    </div>

    <div v-else-if="posts.length === 0" class="feed-empty">
      <MessageCircle :size="48" />
      <p>No posts yet</p>
      <span>Be the first to share!</span>
    </div>

    <div v-else class="feed-list">
      <article
        v-for="post in posts"
        :key="post.id"
        class="feed-card"
      >
        <div class="feed-header">
          <img :src="post.userAvatar" :alt="post.userName" class="feed-avatar" />
          <div class="feed-user-info">
            <strong>{{ post.userName }}</strong>
            <span class="feed-meta"> · {{ getTimeAgo(post.createdAt) }}</span>
            <span class="feed-state">{{ post.userState }}</span>
          </div>
        </div>

        <div class="feed-category">
          <span class="feed-category-badge">{{ post.categoryLabel }}</span>
        </div>

        <!-- Content -->
        <div v-if="post.type === 'VOICE'" class="feed-voice">
          <button class="feed-play-btn" @click="toggleAudioPlay(post)">
            <Pause v-if="playingAudioId === post.id" :size="20" />
            <Play v-else :size="20" />
          </button>
          <div class="feed-voice-bar">
            <div class="feed-voice-progress" />
          </div>
          <audio
            v-if="post.audioUrl"
            :ref="(el) => setAudioRef(post.id, el as HTMLAudioElement)"
            :src="post.audioUrl"
            @ended="onAudioEnd(post.id)"
          />
        </div>

        <div v-else-if="post.type === 'IMAGE'" class="feed-image-wrap">
          <p v-if="post.content" class="feed-content">{{ post.content }}</p>
          <img v-if="post.mediaUrl" :src="post.mediaUrl" alt="" class="feed-image" />
        </div>

        <div v-else-if="post.type === 'VIDEO'" class="feed-video-wrap">
          <p v-if="post.content" class="feed-content">{{ post.content }}</p>
          <video
            v-if="post.videoUrl"
            :src="post.videoUrl"
            class="feed-video"
            controls
          />
        </div>

        <p v-else class="feed-content">{{ post.content || '—' }}</p>

        <!-- Actions -->
        <div class="feed-actions">
          <button class="feed-action" @click="toggleLike(post)">
            <Heart :size="20" :fill="post.isSupported ? '#ef4444' : 'none'" :color="post.isSupported ? '#ef4444' : '#64748b'" />
            <span>{{ formatCount(post.supportCount) }}</span>
          </button>
          <button class="feed-action" @click="emit('openComments', post.id)">
            <MessageCircle :size="20" />
            <span>{{ formatCount(post.commentCount) }}</span>
          </button>
          <button class="feed-action" @click="handleShare(post)">
            <Share2 :size="20" />
            <span>{{ formatCount(post.shareCount) }}</span>
          </button>
        </div>
      </article>

      <div v-if="loading && posts.length > 0" class="feed-load-more">
        <Loader2 :size="24" class="spin" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-screen {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  padding: 1rem 0;
}

.feed-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  color: #64748b;
  font-size: 14px;
}

.feed-loading, .feed-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.feed-empty p { font-weight: 600; color: #1e293b; margin: 12px 0 4px; }
.feed-empty span { font-size: 14px; }

.feed-list { padding: 0 1rem 2rem; }

.feed-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.feed-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.feed-avatar {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  object-fit: cover;
  background: #e2e8f0;
}

.feed-user-info { flex: 1; }
.feed-user-info strong { font-size: 15px; color: #1e293b; }
.feed-meta { font-size: 14px; color: #94a3b8; }
.feed-state { display: block; font-size: 12px; color: #64748b; margin-top: 2px; }

.feed-category { margin-bottom: 10px; }
.feed-category-badge {
  display: inline-block;
  background: #eff6ff;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
}

.feed-content {
  font-size: 15px;
  color: #1e293b;
  line-height: 1.5;
  margin: 0 0 12px;
}

.feed-voice {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}

.feed-play-btn {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background: #3b82f6;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-voice-bar {
  flex: 1;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.feed-voice-progress {
  width: 30%;
  height: 100%;
  background: #3b82f6;
}

.feed-image-wrap, .feed-video-wrap { margin-bottom: 12px; }
.feed-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 8px;
}

.feed-video {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  margin-top: 8px;
  background: #000;
}

.feed-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.feed-action {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.feed-load-more {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
