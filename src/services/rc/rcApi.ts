/**
 * RC Check API service
 * Mirrors rc-check-info mobile flow
 */
import { apiGet, apiPost, END_POINTS } from '../config/api'

export interface RcHistoryItem {
  id: number
  registration_number: string
  user_name: string
  vehicle_make_model: string
  status: string
  created_at: string
  result?: Record<string, unknown>
}

/** Verify vehicle RC via API */
export async function verifyRc(vehicleNo: string): Promise<Record<string, unknown>> {
  const res = await apiPost<Record<string, unknown>>(END_POINTS.RC_VERIFY, {
    vehicle_no: vehicleNo.toUpperCase().trim(),
  })
  return res || {}
}

/** Fetch RC check history */
export async function fetchRcHistory(): Promise<RcHistoryItem[]> {
  const res = await apiGet<{ status?: boolean; data?: RcHistoryItem[] }>(END_POINTS.RC_HISTORY)
  if (res?.status && Array.isArray((res as { data?: RcHistoryItem[] }).data)) {
    return (res as { data: RcHistoryItem[] }).data
  }
  return []
}
