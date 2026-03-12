/**
 * Driver Verification API service
 * Mirrors transporter-verification flow from mobile app
 */
import { apiGet, apiPost, apiPostForm, END_POINTS, BASE_URL } from '../config/api'

export interface Driver {
  id: string
  name: string
  unique_id: string
  mobile: string
  email?: string
  images?: string
  star_rating?: number
  driver_verification?: unknown
}

export interface VerificationDriver {
  driver_id: number
  driver_unique_id: string
  driver_name: string
  driver_mobile: string
  images?: string
  verification_status?: {
    final_status?: 'verified' | 'rejected' | 'pending' | 'in_progress'
    id_verification_status?: string
    address_verification_status?: string
    court_check_status?: string
    completed_at?: string
    notes?: string
  }
  documents?: { all_uploaded: boolean }
  overall_status?: string
  created_at?: string
}

export interface Payment {
  payment_id: number
  amount: string
  payment_type: string
  status: string
  method: string
  driver_count: string
  order_id: string
  transaction_id: string
  payment_date: string
}

export interface VerificationStatusResponse {
  success?: boolean
  data?: VerificationDriver[]
  payment?: {
    is_paid: boolean
    latest_payment?: Payment
    all_payments?: Payment[]
  }
}

/** Fetch transporters' drivers (unverified only) */
export async function fetchUnverifiedDrivers(): Promise<Driver[]> {
  const res = await apiGet<{ status?: boolean; drivers?: Driver[] }>(
    END_POINTS.TRANSPORTER_DRIVERS('')
  )
  if (res?.status && Array.isArray((res as { drivers?: Driver[] }).drivers)) {
    const drivers = (res as { drivers: Driver[] }).drivers
    return drivers.filter((d) => d.driver_verification === null)
  }
  return []
}

/** Fetch verification status (drivers + payment history) */
export async function fetchVerificationStatus(): Promise<VerificationStatusResponse> {
  const res = await apiGet<VerificationStatusResponse>(END_POINTS.DRIVERVERIFICATIONSTATUS)
  return res || { success: false, data: [], payment: null }
}

/** Create order for driver verification payment */
export async function createVerificationOrder(params: {
  driver_ids: string[]
  amount: number
}): Promise<{ order_id?: string; id?: string }> {
  const payload = {
    driver_ids: params.driver_ids,
    amount: params.amount,
    amount_paise: params.amount * 100,
    type: 'driver_verification',
  }
  let res: Record<string, unknown> | null = null
  try {
    res = (await apiPost<Record<string, unknown>>(
      END_POINTS.TRANSPORTER_VERIFICATION_CREATE_ORDER,
      payload
    )) as Record<string, unknown> | null
  } catch {
    res = (await apiPost<Record<string, unknown>>(END_POINTS.CREATE_ORDER, payload)) as Record<string, unknown> | null
  }
  const inner = res && typeof res === 'object' ? res : {}
  const data = inner?.data as { order_id?: string; id?: string } | undefined
  const orderId = String(inner?.order_id ?? data?.order_id ?? inner?.id ?? data?.id ?? '')
  return { order_id: orderId, id: orderId }
}

/** Bulk verification after payment */
export async function submitBulkVerification(params: {
  driver_ids: string[]
  payment_data: {
    razorpay_payment_id?: string
    razorpay_order_id?: string
    razorpay_signature?: string
  }
}): Promise<{ success?: boolean; message?: string }> {
  const res = await apiPost<{ success?: boolean; message?: string }>(
    END_POINTS.TRANSPORTER_BULK_VERIFICATION,
    params
  )
  return res || { success: false }
}

/** Get driver profile for document upload */
export async function fetchDriverProfile(driverId: string): Promise<Record<string, unknown>> {
  const res = await apiGet<{ status?: boolean; user?: Record<string, unknown> }>(
    END_POINTS.GET_DRIVERS_PROFILE(driverId)
  )
  if (res?.status && (res as { user?: Record<string, unknown> }).user) {
    return (res as { user: Record<string, unknown> }).user
  }
  return {}
}

/** Upload driver verification documents */
export async function uploadDriverDocuments(
  driverId: string,
  formData: FormData
): Promise<{ success?: boolean; message?: string }> {
  const res = await apiPostForm<{ success?: boolean; message?: string }>(
    END_POINTS.DRIVER_UPLOAD_DOCUMENTS_BY_TRANSPORTER(driverId),
    formData
  )
  return res || { success: false }
}

export function getDriverImageUrl(images?: string): string {
  if (images) return `${BASE_URL}public/${images}`
  return 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
}
