/**
 * Driver Ki Awaz API service for web
 * Uses DRIVER_KI_AWAZ_BASE and x-user-id header
 */
import {
  END_POINTS,
  DRIVER_KI_AWAZ_BASE,
  AWAZ_URL,
  getAuthToken,
  apiGet,
} from '../config/api'

export interface ReelItem {
  id: string
  userName: string
  userAvatar: string
  userState: string
  category: string
  categoryLabel: string
  hashtags: string[]
  supportCount: number
  commentCount: number
  shareCount: number
  isSupported: boolean
  videoUrl: string
  description: string
  createdAt?: string
}

export interface FeedPostItem {
  id: string
  type: 'VOICE' | 'TEXT' | 'VIDEO' | 'IMAGE'
  userName: string
  userAvatar: string
  userState: string
  userId: string
  category: string
  categoryLabel: string
  hashtags: string[]
  supportCount: number
  commentCount: number
  shareCount: number
  isSupported: boolean
  createdAt: string
  content?: string
  audioDuration?: number
  videoUrl?: string
  audioUrl?: string
  mediaUrl?: string
}

export interface CommentItem {
  id: string | number
  comment: string
  user_id: string | number
  created_at: string
  name?: string
  images?: string
  user?: { name: string; avatar: string }
}

async function getUserId(): Promise<string> {
  try {
    const res = await apiGet<{
      status?: boolean
      user?: { id?: number }
      profile_of?: number
      data?: { id?: number }
    }>(END_POINTS.GET_PROFILE)
    if (res?.user?.id) return String(res.user.id)
    if (res?.profile_of) return String(res.profile_of)
    if ((res as { data?: { id?: number } })?.data?.id) return String((res as { data: { id: number } }).data.id)
  } catch (e) {
    console.error('[DKA] getUserId error', e)
  }
  return ''
}

function getDkaHeaders(userId: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-user-id': userId,
  }
  const token = getAuthToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

/** Use proxy path in dev (Vite proxy), direct URL in production (Apache) */
function getDkaUrl(fullUrl: string): string {
  const isDev = import.meta.env.DEV
  const base = 'https://driverkiawaz.truckmitr.com'

  // In development, rewrite to /api/dka/* so Vite proxy handles CORS
  if (isDev && fullUrl.startsWith(base)) {
    const path = fullUrl.slice(base.length).replace(/^\//, '')
    return `/api/dka/${path.replace(/^api\//, '')}`
  }

  // In production (Apache), use the direct URL — no proxy available
  return fullUrl
}

/** DKA fetch - uses full URL (or proxy in dev) */
async function dkaFetch<T>(
  url: string,
  options: { method?: string; body?: FormData | string; headers?: Record<string, string> } = {}
): Promise<T> {
  const userId = await getUserId()
  const headers: Record<string, string> = { ...getDkaHeaders(userId), ...options.headers }

  const isFormData = options.body instanceof FormData
  if (!isFormData && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json'
  } else if (isFormData) {
    delete headers['Content-Type'] // Let browser set multipart boundary
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body as BodyInit | undefined,
    credentials: 'omit',
  })

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`DKA request failed: ${res.status}`)
  }

  if (!res.ok) {
    throw new Error((data as { message?: string })?.message || `DKA request failed: ${res.status}`)
  }
  return data as T
}

/** Get user dashboard (my posts) */
export async function getUserDashboard(userId: string): Promise<{ posts?: unknown[]; comments?: unknown[] }> {
  const res = await dkaFetch<Record<string, unknown>>(getDkaUrl(END_POINTS.DKA_USER_DASHBOARD(userId)))
  const data = (res as { data?: Record<string, unknown> })?.data || res
  const raw = data as { posts?: unknown[]; data?: unknown[] }
  const posts = raw?.posts || (Array.isArray(raw?.data) ? raw.data : [])
  const comments = (raw as { comments?: unknown[] })?.comments || []
  return { posts, comments }
}

/** Get user feed (for profile) */
export async function getUserFeed(
  userId: string,
  cursor?: string,
  lastId?: string
): Promise<{ data?: unknown[]; nextCursor?: string; nextId?: string; hasMore?: boolean }> {
  let url = getDkaUrl(END_POINTS.DKA_USER_FEED(userId))
  if (cursor && lastId) url += `?cursor=${cursor}&id=${lastId}`
  return dkaFetch<{ data?: unknown[]; nextCursor?: string; nextId?: string; hasMore?: boolean }>(url)
}

/** Get feed (reels + posts) */
export async function getFeed(cursor?: string, lastId?: string): Promise<{
  data?: unknown[]
  nextCursor?: string
  nextId?: string
  hasMore?: boolean
}> {
  let url = getDkaUrl(END_POINTS.DKA_FEED)
  if (cursor && lastId) url += `?cursor=${cursor}&id=${lastId}`
  const res = await dkaFetch<{ data?: unknown[]; nextCursor?: string; nextId?: string; hasMore?: boolean }>(url)
  return res
}

/** Like post */
export async function likePost(id: string): Promise<void> {
  await dkaFetch(getDkaUrl(END_POINTS.DKA_LIKE(id)), {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

/** Comment on post */
export async function commentPost(id: string, comment: string): Promise<void> {
  await dkaFetch(getDkaUrl(END_POINTS.DKA_COMMENT(id)), {
    method: 'POST',
    body: JSON.stringify({ comment }),
  })
}

/** Get comments */
export async function getComments(id: string): Promise<CommentItem[]> {
  const res = await dkaFetch<CommentItem[] | { data?: CommentItem[] }>(getDkaUrl(END_POINTS.DKA_GET_COMMENTS(id)))
  if (Array.isArray(res)) return res
  const data = (res as { data?: CommentItem[] })?.data
  return Array.isArray(data) ? data : []
}

/** Share post */
export async function sharePost(id: string): Promise<void> {
  await dkaFetch(getDkaUrl(END_POINTS.DKA_SHARE(id)), {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

/** Upload post (FormData: caption, media_type, file, etc.) */
export async function uploadPost(formData: FormData): Promise<{ data?: unknown }> {
  const res = await dkaFetch<{ data?: unknown }>(getDkaUrl(END_POINTS.DKA_POST), {
    method: 'POST',
    body: formData,
    headers: {}, // FormData - don't set Content-Type
  })
  return res
}

/** Edit post */
export async function editPost(id: string, caption: string): Promise<void> {
  await dkaFetch(getDkaUrl(END_POINTS.DKA_EDIT_POST(id)), {
    method: 'PUT',
    body: JSON.stringify({ caption }),
  })
}

/** Delete post */
export async function deletePost(id: string): Promise<void> {
  await dkaFetch(getDkaUrl(END_POINTS.DKA_DELETE_POST(id)), { method: 'DELETE' })
}

/** Build video URL (uses proxy for stream to avoid CORS) */
export function getVideoUrl(item: { video_file?: string; media_url?: string }): string {
  if (item.video_file) {
    return getDkaUrl(`${END_POINTS.DKA_STREAM}/${item.video_file}`)
  }
  const raw = item.media_url || ''
  if (raw.startsWith('http')) return raw
  const clean = raw.startsWith('/') ? raw.slice(1) : raw
  if (clean && clean.startsWith('api/')) {
    return getDkaUrl(`${DRIVER_KI_AWAZ_BASE}${clean}`)
  }
  return clean ? `${DRIVER_KI_AWAZ_BASE}${clean}` : ''
}

/** Build media URL (audio, image, video) */
export function getMediaUrl(raw?: string): string {
  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  const clean = raw.startsWith('/') ? raw.slice(1) : raw
  if (clean && clean.startsWith('api/')) {
    return getDkaUrl(`${DRIVER_KI_AWAZ_BASE}${clean}`)
  }
  return clean ? `${DRIVER_KI_AWAZ_BASE}${clean}` : ''
}

/** Build avatar URL */
export function getAvatarUrl(raw?: string): string {
  if (!raw) return 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
  if (raw.startsWith('http')) return raw
  const clean = raw.startsWith('/') ? raw.slice(1) : raw
  return `${AWAZ_URL}public/${clean}`
}
