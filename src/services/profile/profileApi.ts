/**
 * Profile API - GET_PROFILE, PAYMENT_SUBSCRIPTION_DETAILS, INVOICE_DOWNLOAD
 * Profile Edit - EDIT_PROFILE, GETSTATES, VEHICLE_TYPES
 * Mirrors profile-edit-new/index.tsx API usage
 */
import { apiGet, apiPostForm } from '../config/api'
import { END_POINTS } from '../config/api'

export interface ProfileData {
  id?: number | string
  unique_id?: string
  name?: string
  name_eng?: string
  mobile?: string
  email?: string
  role?: string
  images?: string
  state?: string
  states?: string
  state_name?: string
  city?: string
  Type_of_License?: string
  Transport_Name?: string
  transport_name?: string
  profile_completion?: number
  profile_completion_percentage?: number
  rank?: string
  star_rating?: number
  dashboard?: Record<string, unknown>
  [key: string]: unknown
}

export interface SubscriptionItem {
  id?: string | number
  payment_id?: string | number
  amount?: number | string
  payment_type?: string
  plan_name?: string
  payment_status?: string
  subscription_id?: string
  start_at?: number
  end_at?: number
  payment_details?: { amount?: number; membership_amount?: number }
  [key: string]: unknown
}

/** Get profile - same as app's GET_PROFILE. Handles res.user, res.data, res.data.data. */
export async function getProfile(): Promise<ProfileData | null> {
  const full = await getProfileFull()
  return full?.user ?? null
}

/** Get full profile response (user, profile_completion, rank, star_rating, dashboard_status, etc.) */
export async function getProfileFull(): Promise<{
  user: ProfileData | null
  profile_completion?: string | number
  rank?: string
  star_rating?: number
  dashboard_status?: Record<string, unknown>
  [key: string]: unknown
} | null> {
  const res = await apiGet<Record<string, unknown>>(END_POINTS.GET_PROFILE)
  if (!res?.status) return null
  const r = res as Record<string, unknown>
  let user: ProfileData | null = null
  if (r.user && typeof r.user === 'object') {
    user = r.user as ProfileData
  } else {
    const raw = r.data
    if (raw && typeof raw === 'object') {
      user = 'data' in raw ? ((raw as { data?: ProfileData }).data as ProfileData) ?? (raw as ProfileData) : (raw as ProfileData)
    }
  }
  return {
    user,
    profile_completion: r.profile_completion as string | number | undefined,
    rank: r.rank as string | undefined,
    star_rating: r.star_rating as number | undefined,
    dashboard_status: r.dashboard_status as Record<string, unknown> | undefined,
    ...r,
  }
}

/** Get subscription details - same as app's PAYMENT_SUBSCRIPTION_DETAILS */
export async function getSubscriptionDetails(): Promise<SubscriptionItem | null> {
  const res = await apiGet<{ status?: boolean; data?: SubscriptionItem | SubscriptionItem[] | { data?: SubscriptionItem[] } }>(
    END_POINTS.PAYMENT_SUBSCRIPTION_DETAILS
  )
  if (!res?.status) return null
  let raw: unknown = (res as { data?: unknown }).data
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) {
    raw = (raw as { data?: unknown }).data
  }
  if (!raw) return null
  const arr = Array.isArray(raw) ? raw : [raw as SubscriptionItem]
  const active = arr.find(
    (x) =>
      x.payment_status === 'captured' &&
      x.end_at &&
      new Date(x.end_at * 1000) > new Date()
  )
  return active ?? arr[0] ?? null
}

/** Get invoice download URL - same as app's INVOICE_DOWNLOAD */
export async function getInvoiceUrl(paymentId: string | number): Promise<string | null> {
  const res = await apiGet<{ status?: boolean; invoice_url?: string; message?: string }>(
    END_POINTS.INVOICE_DOWNLOAD(paymentId)
  )
  if (res?.status && (res as { invoice_url?: string }).invoice_url) {
    return (res as { invoice_url: string }).invoice_url
  }
  return null
}

/** Get states - for address dropdown */
export async function getStates(): Promise<{ id: string; name: string }[]> {
  const res = await apiGet<{ status?: boolean; data?: { id: string; name: string }[] }>(END_POINTS.GETSTATES)
  if (!res?.status) return []
  const data = (res as { data?: { id: string; name: string }[] }).data
  return Array.isArray(data) ? data : []
}

/** Get vehicle types - for transporter vehicle selection */
export async function getVehicleTypes(): Promise<{ id: string | number; name?: string; label?: string }[]> {
  const res = await apiGet<{ status?: boolean; data?: { id: string | number; name?: string; label?: string }[] }>(
    END_POINTS.VEHICLE_TYPES
  )
  if (!res?.status) return []
  const data = (res as { data?: { id: string | number; name?: string; label?: string }[] }).data
  return Array.isArray(data) ? data : []
}

/** Update profile - same as app's EDIT_PROFILE (FormData) */
export async function updateProfile(formData: FormData): Promise<{ status?: boolean; message?: string }> {
  const res = await apiPostForm<{ status?: boolean; message?: string }>(END_POINTS.EDIT_PROFILE, formData)
  return res as { status?: boolean; message?: string }
}
