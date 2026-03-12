<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, Video, Image, Type, Loader2, Grid3X3, MessageCircle } from 'lucide-vue-next'
import {
  uploadPost,
  getUserDashboard,
  deletePost,
} from '../../../services/dka/dkaApi'
import { apiGet } from '../../../services/config/api'
import { END_POINTS } from '../../../services/config/api'
import { DRIVER_KI_AWAZ_BASE } from '../../../services/config/api'

const emit = defineEmits(['close', 'posted'])

type PostType = 'VIDEO' | 'TEXT' | 'IMAGE'
type CategoryType = 'DRIVER_LIFE' | 'GOVT_DEMAND' | 'ROAD_ISSUES' | 'RTO_CHALLAN' | 'WELFARE_RIGHTS'
type TabType = 'create' | 'myPosts' | 'myComments'

const CATEGORIES = [
  { id: 'DRIVER_LIFE' as CategoryType, label: '🚛 Driver Life', color: '#3B82F6' },
  { id: 'GOVT_DEMAND' as CategoryType, label: '🏛️ Govt Demand', color: '#8B5CF6' },
  { id: 'ROAD_ISSUES' as CategoryType, label: '🛣️ Road Issues', color: '#F59E0B' },
  { id: 'RTO_CHALLAN' as CategoryType, label: '📋 RTO Issues', color: '#EF4444' },
  { id: 'WELFARE_RIGHTS' as CategoryType, label: '⚖️ Welfare Rights', color: '#10B981' },
]

interface PostData {
  id: string
  mediaType: string
  caption: string
  mediaUrl: string
  likesCount: number
  commentsCount: number
  createdAt: string
  status: number
}

const activeTab = ref<TabType>('create')
const selectedType = ref<PostType | null>(null)
const selectedCategory = ref<CategoryType | null>(null)
const textContent = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const isSubmitting = ref(false)
const toast = ref('')

const posts = ref<PostData[]>([])
const myComments = ref<unknown[]>([])
const loading = ref(false)
const userId = ref('')
const viewingPost = ref<PostData | null>(null)

async function loadUserId() {
  try {
    const res = await apiGet<{ user?: { id?: number }; profile_of?: number; data?: { id?: number } }>(END_POINTS.GET_PROFILE)
    if (res?.user?.id) userId.value = String(res.user.id)
    else if (res?.profile_of) userId.value = String(res.profile_of)
    else if ((res as { data?: { id?: number } })?.data?.id) userId.value = String((res as { data: { id: number } }).data.id)
  } catch {}
}

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.type.startsWith('video/')) selectedType.value = 'VIDEO'
  else if (file.type.startsWith('image/')) selectedType.value = 'IMAGE'
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  input.value = ''
}

function removeMedia() {
  selectedFile.value = null
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

async function handleSubmit() {
  if (!selectedType.value || !selectedCategory.value) {
    showToast('Select type and category')
    return
  }
  if (selectedType.value === 'TEXT' && !textContent.value.trim()) {
    showToast('Enter caption for text post')
    return
  }
  if ((selectedType.value === 'VIDEO' || selectedType.value === 'IMAGE') && !selectedFile.value) {
    showToast('Select a file')
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('media_type', selectedType.value.toLowerCase())
    formData.append('caption', textContent.value || (selectedType.value === 'TEXT' ? '' : 'Post'))
    formData.append('category', selectedCategory.value.toLowerCase())

    if (selectedFile.value) {
      formData.append('media', selectedFile.value)
    }

    await uploadPost(formData)
    showToast('Post submitted for review')
    selectedType.value = null
    selectedCategory.value = null
    textContent.value = ''
    removeMedia()
    if (userId.value) fetchPosts()
    emit('posted')
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Upload failed')
  } finally {
    isSubmitting.value = false
  }
}

async function fetchPosts() {
  if (!userId.value) return
  loading.value = true
  try {
    const res = await getUserDashboard(userId.value)
    posts.value = (res.posts || []).map((p: Record<string, unknown>) => ({
      id: String(p.id),
      mediaType: (p.media_type || 'text') as string,
      caption: (p.caption || '') as string,
      mediaUrl: getMediaUrl(p.media_url),
      likesCount: (p.likes_count as number) || 0,
      commentsCount: (p.comments_count as number) || 0,
      createdAt: (p.created_at || '') as string,
      status: (p.status as number) ?? 1,
    }))
    myComments.value = res.comments || []
  } catch {
    posts.value = []
  } finally {
    loading.value = false
  }
}

function getMediaUrl(raw?: string) {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  const clean = raw.startsWith('/') ? raw.slice(1) : raw
  return `${DRIVER_KI_AWAZ_BASE}${clean}`
}

function openPost(p: PostData) {
  viewingPost.value = p
}

function closePost() {
  viewingPost.value = null
}

async function handleDelete(p: PostData) {
  if (!confirm('Delete this post?')) return
  try {
    await deletePost(p.id)
    showToast('Post deleted')
    posts.value = posts.value.filter(x => x.id !== p.id)
    viewingPost.value = null
  } catch {
    showToast('Delete failed')
  }
}

onMounted(() => {
  loadUserId().then(() => {
    if (userId.value) fetchPosts()
  })
})
</script>

<template>
  <div class="create-post-view">
    <header class="create-header">
      <button class="create-close" @click="emit('close')">
        <X :size="24" />
      </button>
      <h2>{{ activeTab === 'create' ? 'New Post' : 'My Posts' }}</h2>
      <button class="create-share" :disabled="!selectedType || !selectedCategory || isSubmitting" @click="handleSubmit">
        {{ isSubmitting ? 'Posting...' : 'Share' }}
      </button>
    </header>

    <div class="create-tabs">
      <button :class="{ active: activeTab === 'create' }" @click="activeTab = 'create'">
        <Video :size="20" /> Create
      </button>
      <button :class="{ active: activeTab === 'myPosts' }" @click="activeTab = 'myPosts'; fetchPosts()">
        <Grid3X3 :size="20" /> My Posts
      </button>
      <button :class="{ active: activeTab === 'myComments' }" @click="activeTab = 'myComments'; fetchPosts()">
        <MessageCircle :size="20" /> Comments
      </button>
    </div>

    <!-- Create Tab -->
    <div v-if="activeTab === 'create'" class="create-content">
      <div v-if="previewUrl" class="media-preview">
        <img v-if="selectedType === 'IMAGE'" :src="previewUrl" alt="Preview" />
        <video v-else-if="selectedType === 'VIDEO'" :src="previewUrl" muted />
        <button class="remove-media" @click="removeMedia">×</button>
      </div>

      <div class="caption-row">
        <textarea v-model="textContent" placeholder="Write a caption..." rows="3" />
      </div>

      <p class="section-label">Post Type</p>
      <div class="type-row">
        <button :class="{ active: selectedType === 'VIDEO' }" @click="selectedType = 'VIDEO'">
          <Video :size="22" /> Video
        </button>
        <button :class="{ active: selectedType === 'IMAGE' }" @click="selectedType = 'IMAGE'">
          <Image :size="22" /> Image
        </button>
        <button :class="{ active: selectedType === 'TEXT' }" @click="selectedType = 'TEXT'">
          <Type :size="22" /> Text
        </button>
      </div>

      <div v-if="selectedType === 'VIDEO' || selectedType === 'IMAGE'" class="file-input-wrap">
        <label class="file-label">
          <input type="file" :accept="selectedType === 'VIDEO' ? 'video/*' : 'image/*'" @change="onFileChange" />
          Choose {{ selectedType === 'VIDEO' ? 'Video' : 'Image' }}
        </label>
      </div>

      <p class="section-label">Category</p>
      <div class="category-row">
        <button
          v-for="c in CATEGORIES"
          :key="c.id"
          :class="{ active: selectedCategory === c.id }"
          :style="selectedCategory === c.id ? { backgroundColor: c.color } : {}"
          @click="selectedCategory = c.id"
        >
          {{ c.label }}
        </button>
      </div>

      <p class="info-text">Posts are reviewed before approval.</p>
    </div>

    <!-- My Posts Tab -->
    <div v-else-if="activeTab === 'myPosts'" class="my-posts-content">
      <div v-if="loading && posts.length === 0" class="loading-wrap"><Loader2 :size="32" class="spin" /></div>
      <div v-else-if="posts.length === 0" class="empty-wrap">No posts yet. Create one!</div>
      <div v-else class="posts-grid">
        <div
          v-for="p in posts"
          :key="p.id"
          class="post-cell"
          @click="openPost(p)"
        >
          <img v-if="p.mediaType === 'image'" :src="p.mediaUrl" alt="" />
          <video v-else-if="p.mediaType === 'video'" :src="p.mediaUrl" muted />
          <div v-else class="text-cell">{{ p.caption }}</div>
          <div v-if="p.status === 0" class="pending-badge">Pending</div>
          <div class="stats-row">
            <span>❤ {{ p.likesCount }}</span>
            <span>💬 {{ p.commentsCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- My Comments Tab -->
    <div v-else class="my-comments-content">
      <div v-if="loading && myComments.length === 0" class="loading-wrap"><Loader2 :size="32" class="spin" /></div>
      <div v-else-if="myComments.length === 0" class="empty-wrap">No comments yet</div>
      <div v-else class="comments-list">
        <div v-for="(c, i) in myComments" :key="i" class="comment-card">
          <p>{{ (c as { comment?: string }).comment }}</p>
          <span class="comment-date">{{ new Date((c as { createdAt?: string }).createdAt || '').toLocaleDateString() }}</span>
        </div>
      </div>
    </div>

    <!-- View Post Modal -->
    <Teleport to="body">
      <div v-if="viewingPost" class="view-modal" @click.self="closePost">
        <div class="view-modal-inner">
          <button class="view-close" @click="closePost">×</button>
          <div v-if="viewingPost.mediaType === 'video'" class="view-media">
            <video :src="viewingPost.mediaUrl" controls autoplay />
          </div>
          <img v-else-if="viewingPost.mediaType === 'image'" :src="viewingPost.mediaUrl" alt="" class="view-img" />
          <div v-else class="view-text">{{ viewingPost.caption }}</div>
          <p class="view-caption">{{ viewingPost.caption }}</p>
          <div class="view-actions">
            <button @click="handleDelete(viewingPost)" class="danger">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.create-post-view {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 150;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.create-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #2d2d2d;
}

.create-close, .create-share { background: none; border: none; color: #fff; cursor: pointer; font-size: 16px; }
.create-share:disabled { opacity: 0.5; cursor: not-allowed; }
.create-header h2 { margin: 0; font-size: 18px; font-weight: 700; }

.create-tabs {
  display: flex;
  border-bottom: 1px solid #2d2d2d;
}

.create-tabs button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.create-tabs button.active { color: #fff; border-bottom: 2px solid #3b82f6; }

.create-content { padding: 20px; overflow-y: auto; flex: 1; }
.media-preview { position: relative; width: 100%; height: 200px; border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
.media-preview img, .media-preview video { width: 100%; height: 100%; object-fit: cover; }
.remove-media { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; border: none; cursor: pointer; font-size: 20px; }
.caption-row { margin-bottom: 24px; }
.caption-row textarea { width: 100%; background: #2c2c2e; border: none; border-radius: 12px; padding: 12px; color: #fff; font-size: 16px; resize: none; }
.section-label { font-size: 12px; color: #9ca3af; font-weight: 600; text-transform: uppercase; margin: 0 0 12px; }
.type-row, .category-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
.type-row button, .category-row button { padding: 12px 16px; border-radius: 12px; border: 1px solid #374151; background: #1f2937; color: #9ca3af; cursor: pointer; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.type-row button.active, .category-row button.active { border-color: #3b82f6; color: #fff; }
.file-input-wrap input { display: none; }
.file-label { display: inline-block; padding: 12px 20px; background: #3b82f6; color: #fff; border-radius: 12px; cursor: pointer; font-weight: 600; }
.info-text { font-size: 13px; color: #6b7280; margin-top: 16px; }

.my-posts-content, .my-comments-content { flex: 1; overflow-y: auto; padding: 16px; }
.loading-wrap, .empty-wrap { display: flex; justify-content: center; align-items: center; min-height: 200px; color: #6b7280; }
.posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.post-cell { aspect-ratio: 1; position: relative; border-radius: 8px; overflow: hidden; cursor: pointer; }
.post-cell img, .post-cell video { width: 100%; height: 100%; object-fit: cover; }
.text-cell { width: 100%; height: 100%; background: #1f2937; color: #9ca3af; font-size: 12px; padding: 8px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; }
.pending-badge { position: absolute; top: 8px; right: 8px; background: #f59e0b; color: #000; font-size: 10px; padding: 4px 8px; border-radius: 4px; }
.stats-row { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); padding: 4px 8px; font-size: 11px; color: #fff; }
.comments-list { display: flex; flex-direction: column; gap: 12px; }
.comment-card { background: #1c1c1e; padding: 16px; border-radius: 12px; }
.comment-card p { margin: 0 0 8px; color: #e2e8f0; }
.comment-date { font-size: 12px; color: #6b7280; }

.view-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center; }
.view-modal-inner { max-width: 90%; max-height: 90%; position: relative; }
.view-close { position: absolute; top: -40px; right: 0; background: none; border: none; color: #fff; font-size: 32px; cursor: pointer; }
.view-options { position: absolute; top: -40px; right: 50px; background: none; border: none; color: #fff; cursor: pointer; }
.view-media video, .view-img { max-width: 100%; max-height: 70vh; }
.view-text { padding: 24px; background: #1c1c1e; border-radius: 12px; color: #fff; font-size: 18px; max-width: 400px; }
.view-caption { color: #9ca3af; margin-top: 12px; }
.view-actions { margin-top: 16px; display: flex; gap: 12px; }
.view-actions button { padding: 10px 20px; border-radius: 10px; border: none; background: #3b82f6; color: #fff; cursor: pointer; }
.view-actions button.danger { background: #ef4444; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 12px 24px; border-radius: 12px; z-index: 3000; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
