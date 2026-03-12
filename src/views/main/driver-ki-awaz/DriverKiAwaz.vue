<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  ArrowLeft, Heart, MessageCircle, Share2, Volume2, VolumeX,
  Loader2, Send, PlusCircle, Video, List
} from 'lucide-vue-next'
import CreatePost from './CreatePost.vue'
import FeedScreen from './FeedScreen.vue'
import {
  getFeed,
  likePost,
  getComments,
  commentPost,
  sharePost,
  getVideoUrl,
  getAvatarUrl,
  type ReelItem,
  type CommentItem,
} from '../../../services/dka/dkaApi'

const emit = defineEmits(['back', 'navigate'])

const reels = ref<ReelItem[]>([])
const loading = ref(false)
const cursor = ref<string | undefined>()
const lastId = ref<string | undefined>()
const hasMore = ref(true)
const activeIndex = ref(0)
const isMuted = ref(true)
const showComments = ref(false)
const activeReelId = ref<string | null>(null)
const comments = ref<CommentItem[]>([])
const commentsLoading = ref(false)
const newComment = ref('')
const submittingComment = ref(false)
const hearts = ref<{ id: number }[]>([])
const lastTapTime = ref(0)
const showCreatePost = ref(false)
const toastMsg = ref('')
const tabMode = ref<'reels' | 'feed'>('reels')
const feedScreenRef = ref<InstanceType<typeof FeedScreen> | null>(null)

function showToast(msg: string) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

function mapFeedItem(item: Record<string, unknown>): ReelItem {
  const videoUrl = getVideoUrl(item as { video_file?: string; media_url?: string })
  const rawAvatar = (item.user_avatar as string) || (item.user as Record<string, string>)?.avatar || ''
  return {
    id: String(item.id),
    userName: (item.user_name as string) || (item.user as Record<string, string>)?.name || `Driver ${item.user_id || ''}`,
    userAvatar: getAvatarUrl(rawAvatar),
    userState: (item.user as Record<string, string>)?.state || '',
    category: (item.media_type as string) || 'VIDEO',
    categoryLabel: item.category ? `#${item.category}` : '🎬 Video',
    hashtags: [],
    supportCount: (item.likes_count as number) || 0,
    commentCount: (item.comments_count as number) || 0,
    shareCount: (item.shares_count as number) || 0,
    isSupported: (item.is_liked as number) === 1,
    videoUrl,
    description: (item.caption as string) || '',
    createdAt: item.created_at as string,
  }
}

async function fetchFeed(refresh = false) {
  if (loading.value || (!hasMore.value && !refresh)) return
  loading.value = true
  try {
    const res = await getFeed(refresh ? undefined : cursor.value, refresh ? undefined : lastId.value)
    const raw = res.data || (Array.isArray(res) ? res : [])
    const videos = raw
      .filter((x: Record<string, unknown>) => x.media_type === 'video')
      .map(mapFeedItem)

    if (videos.length > 0) {
      if (refresh) {
        reels.value = videos
      } else {
        reels.value = [...reels.value, ...videos]
      }
      if (res.nextCursor) {
        cursor.value = res.nextCursor
        lastId.value = res.nextId?.toString()
        hasMore.value = res.hasMore !== false
      } else {
        const last = videos[videos.length - 1]
        if (last) {
          cursor.value = last.createdAt
          lastId.value = last.id
        }
      }
    } else {
      if (refresh) reels.value = []
      hasMore.value = false
    }
  } catch (e) {
    console.error('DKA fetch error', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  if (!loading.value && hasMore.value) fetchFeed()
}

function formatCount(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)
}

async function toggleLike(reel: ReelItem) {
  const prev = reel.isSupported
  reel.isSupported = !reel.isSupported
  reel.supportCount += reel.isSupported ? 1 : -1
  try {
    await likePost(reel.id)
    showToast(reel.isSupported ? 'Liked' : 'Unliked')
  } catch (e) {
    reel.isSupported = prev
    reel.supportCount += prev ? 1 : -1
    showToast('Failed to update like')
  }
}

function handleReelTap(reel: ReelItem) {
  const now = Date.now()
  if (now - lastTapTime.value < 300) {
    if (!reel.isSupported) toggleLike(reel)
    hearts.value = [...hearts.value, { id: Date.now() }]
    setTimeout(() => {
      hearts.value = hearts.value.slice(0, -1)
    }, 800)
    lastTapTime.value = 0
  } else {
    lastTapTime.value = now
    setTimeout(() => {
      if (lastTapTime.value === now) isMuted.value = !isMuted.value
    }, 300)
  }
}

async function openComments(id: string) {
  activeReelId.value = id
  showComments.value = true
  commentsLoading.value = true
  try {
    comments.value = await getComments(id)
  } catch {
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

async function sendComment() {
  if (!activeReelId.value || !newComment.value.trim()) return
  submittingComment.value = true
  try {
    await commentPost(activeReelId.value, newComment.value.trim())
    newComment.value = ''
    comments.value = await getComments(activeReelId.value)
    showToast('Comment posted')
    const reel = reels.value.find(r => r.id === activeReelId.value)
    if (reel) reel.commentCount++
    feedScreenRef.value?.updateCommentCount?.(activeReelId.value)
  } catch (e) {
    showToast('Failed to post comment')
  } finally {
    submittingComment.value = false
  }
}

async function handleShare(reel: ReelItem) {
  try {
    await sharePost(reel.id)
    reel.shareCount++
    if (navigator.share) {
      await navigator.share({
        title: 'Driver Ki Awaz',
        text: reel.description || 'Check out this reel on TruckMitr',
        url: 'https://play.google.com/store/apps/details?id=com.truckmitr',
      })
      showToast('Shared!')
    } else {
      await navigator.clipboard.writeText('https://play.google.com/store/apps/details?id=com.truckmitr')
      showToast('Link copied to clipboard')
    }
  } catch (e) {
    showToast('Share failed')
  }
}

const reelHeight = ref(560)

function updateReelHeight() {
  const el = reelsContainer.value
  if (el?.clientHeight) reelHeight.value = el.clientHeight
  else if (el) requestAnimationFrame(() => { if (el.clientHeight) reelHeight.value = el.clientHeight })
}

function onReelScroll(e: Event) {
  const el = e.target as HTMLElement
  const scrollTop = el.scrollTop
  const h = reelHeight.value
  const idx = Math.round(scrollTop / h)
  if (idx >= 0 && idx < reels.value.length) activeIndex.value = idx
  const nearBottom = scrollTop + el.clientHeight >= el.scrollHeight - h * 0.5
  if (nearBottom) loadMore()
}

const reelsContainer = ref<HTMLElement | null>(null)

function playActiveVideo() {
  const el = reelsContainer.value
  if (!el) return
  const videos = el.querySelectorAll('video')
  videos.forEach((v, i) => {
    if (i === activeIndex.value) v.play().catch(() => {})
    else v.pause()
  })
}

watch(activeIndex, () => nextTick(playActiveVideo))
watch(reels, () => nextTick(playActiveVideo), { deep: true })

let resizeObs: ResizeObserver | null = null

onMounted(() => {
  fetchFeed(true)
  nextTick(() => {
    updateReelHeight()
    playActiveVideo()
    resizeObs = new ResizeObserver(updateReelHeight)
    if (reelsContainer.value) resizeObs.observe(reelsContainer.value)
  })
})

onUnmounted(() => {
  resizeObs?.disconnect()
})
</script>

<template>
  <div class="dka-view">
    <!-- Create Post overlay -->
    <CreatePost
      v-if="showCreatePost"
      @close="showCreatePost = false"
      @posted="fetchFeed(true)"
    />

    <!-- Overlay Header -->
    <header class="dka-header">
      <button class="dka-header-btn" @click="emit('back')">
        <ArrowLeft :size="24" />
      </button>
      <div class="dka-tabs">
        <button
          class="dka-tab"
          :class="{ active: tabMode === 'reels' }"
          @click="tabMode = 'reels'"
        >
          <Video :size="18" />
          <span>Reels</span>
        </button>
        <button
          class="dka-tab"
          :class="{ active: tabMode === 'feed' }"
          @click="tabMode = 'feed'"
        >
          <List :size="18" />
          <span>Feed</span>
        </button>
      </div>
      <button class="dka-header-btn" @click="showCreatePost = true" title="Create Post">
        <PlusCircle :size="24" />
      </button>
    </header>

    <!-- Reels / Feed content -->
    <div class="dka-phone-wrap">
      <FeedScreen
        v-if="tabMode === 'feed'"
        ref="feedScreenRef"
        @open-comments="openComments"
      />
      <div
        v-show="tabMode === 'reels'"
        ref="reelsContainer"
        class="dka-reels-wrap"
        @scroll="onReelScroll"
      >
        <div class="dka-reels-inner">
          <div
            v-for="(reel, idx) in reels"
            :key="reel.id"
            class="dka-reel-item"
            :style="{ height: reelHeight + 'px' }"
          >
          <div class="dka-reel-video-wrap" @click="handleReelTap(reel)">
            <video
              v-if="reel.videoUrl"
              :src="reel.videoUrl"
              class="dka-video"
              loop
              :muted="isMuted"
              playsinline
            />
            <div v-if="loading && idx === reels.length - 1" class="dka-loading">
              <Loader2 :size="32" class="spin" />
            </div>
            <div class="dka-gradient" />
            <div v-for="h in hearts" :key="h.id" class="dka-heart">❤️</div>
          </div>

          <!-- Right Actions (z-index above video for click) -->
          <div class="dka-actions" style="z-index: 10; pointer-events: auto;">
            <div class="dka-action-avatar">
              <img :src="reel.userAvatar" :alt="reel.userName" />
            </div>
            <button class="dka-action-btn" @click.stop="toggleLike(reel)">
              <Heart :size="28" :fill="reel.isSupported ? '#ef4444' : 'none'" :color="reel.isSupported ? '#ef4444' : '#fff'" />
              <span>{{ formatCount(reel.supportCount) }}</span>
            </button>
            <button class="dka-action-btn" @click.stop="openComments(reel.id)">
              <MessageCircle :size="26" />
              <span>{{ formatCount(reel.commentCount) }}</span>
            </button>
            <button class="dka-action-btn" @click.stop="handleShare(reel)">
              <Share2 :size="26" />
              <span>{{ formatCount(reel.shareCount) }}</span>
            </button>
            <button class="dka-action-btn" @click.stop="isMuted = !isMuted">
              <VolumeX v-if="isMuted" :size="24" />
              <Volume2 v-else :size="24" />
            </button>
          </div>

          <!-- Bottom Info -->
          <div class="dka-bottom-info">
            <div class="dka-user-info">
              <span class="dka-username">@{{ reel.userName }}</span>
              <span class="dka-userstate">{{ reel.userState }}</span>
            </div>
            <p class="dka-desc">{{ reel.description }}</p>
            <div class="dka-category">{{ reel.categoryLabel }}</div>
          </div>
        </div>

        <div v-if="reels.length === 0 && !loading" class="dka-empty">
          <p>No reels yet</p>
        </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="dka-toast">{{ toastMsg }}</div>

    <!-- Comments Modal -->
    <Teleport to="body">
      <div v-if="showComments" class="dka-modal-overlay" @click.self="showComments = false">
        <div class="dka-comments-modal">
          <div class="dka-comments-header">
            <h3>Comments</h3>
            <button @click="showComments = false">&times;</button>
          </div>
          <div v-if="commentsLoading" class="dka-comments-loading"><Loader2 :size="32" class="spin" /></div>
          <div v-else class="dka-comments-list">
            <div v-for="c in comments" :key="c.id" class="dka-comment-item">
              <img :src="getAvatarUrl(c.images)" :alt="c.name" class="dka-comment-avatar" />
              <div>
                <strong>{{ c.name || c.user?.name || `User ${c.user_id}` }}</strong>
                <p>{{ c.comment }}</p>
              </div>
            </div>
            <div v-if="comments.length === 0" class="dka-comments-empty">No comments yet</div>
          </div>
          <div class="dka-comment-input">
            <input v-model="newComment" placeholder="Add a comment..." @keydown.enter.prevent="sendComment" />
            <button :disabled="!newComment.trim() || submittingComment" @click="sendComment">
              <Send v-if="!submittingComment" :size="20" />
              <Loader2 v-else :size="20" class="spin" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dka-view {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Instagram-style phone frame */
.dka-phone-wrap {
  flex: 1;
  width: 100%;
  max-width: 420px;
  min-height: 0;
  margin: 0 auto;
  background: #000;
  box-shadow: 0 0 0 2px #333, 0 20px 60px rgba(0,0,0,0.5);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.dka-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  z-index: 50;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
}

.dka-header-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.dka-header-btn:hover {
  background: rgba(255,255,255,0.3);
}

.dka-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.15);
  padding: 4px;
  border-radius: 12px;
}

.dka-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.dka-tab:hover {
  color: #fff;
}

.dka-tab.active {
  background: rgba(255,255,255,0.25);
  color: #fff;
}

.dka-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
}


.dka-reels-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.dka-reels-wrap::-webkit-scrollbar {
  display: none;
}

.dka-reel-item {
  position: relative;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.dka-reel-video-wrap {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.dka-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dka-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  pointer-events: none;
}

.dka-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 80px;
  animation: heartPop 0.8s ease-out forwards;
  pointer-events: none;
}

@keyframes heartPop {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  100% { transform: translate(-50%, -70%) scale(1); opacity: 0; }
}

.dka-loading {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.dka-actions {
  position: absolute;
  right: 12px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.dka-action-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid #fff;
}

.dka-action-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dka-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 4px;
  transition: transform 0.15s;
}
.dka-action-btn:hover {
  transform: scale(1.1);
}
.dka-action-btn:active {
  transform: scale(0.95);
}

.dka-action-btn span { font-size: 11px; }

.dka-bottom-info {
  position: absolute;
  bottom: 24px;
  left: 16px;
  right: 80px;
  z-index: 5;
  pointer-events: none;
}

.dka-user-info { margin-bottom: 8px; }
.dka-username { color: #fff; font-weight: 700; font-size: 16px; margin-right: 8px; }
.dka-userstate { color: rgba(255,255,255,0.8); font-size: 13px; }
.dka-desc { color: #fff; font-size: 14px; line-height: 1.4; margin: 0 0 8px; }
.dka-category {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.dka-empty {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.7);
}

.dka-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30,41,59,0.95);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  z-index: 3000;
  animation: toastIn 0.3s ease;
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.dka-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}

.dka-comments-modal {
  background: #1c1c1e;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.dka-comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #2d2d2d;
}

.dka-comments-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #fff; }
.dka-comments-header button {
  width: 36px;
  height: 36px;
  border: none;
  background: #2c2c2e;
  border-radius: 50%;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.dka-comments-loading {
  padding: 48px;
  text-align: center;
  color: #fff;
}

.dka-comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.dka-comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.dka-comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  object-fit: cover;
  flex-shrink: 0;
}

.dka-comment-item strong { color: #fff; font-size: 13px; }
.dka-comment-item p { margin: 4px 0 0; color: #e2e8f0; font-size: 14px; }
.dka-comments-empty { text-align: center; color: #64748b; padding: 24px; }

.dka-comment-input {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #2d2d2d;
}

.dka-comment-input input {
  flex: 1;
  background: #2c2c2e;
  border: none;
  border-radius: 20px;
  padding: 10px 16px;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.dka-comment-input button {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: none;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dka-comment-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
