/**
 * Challan Check API service
 * Mirrors challan-check-info mobile flow
 */
import { apiGet, apiPost, END_POINTS } from '../config/api'

export interface ChallanItem {
  challan_number?: string
  offense_details?: string
  offence_details?: string
  challan_place?: string
  challan_date_time?: string
  state?: string
  accused_name?: string
  amount?: string | number
  challan_status?: string
  [key: string]: unknown
}

export interface ChallanHistoryItem {
  id: number
  number?: string
  challan_number?: string
  offense_details?: string
  offence_details?: string
  challan_place?: string
  challan_date_time?: string
  state?: string
  accused_name?: string
  amount?: string | number
  challan_status?: string
  [key: string]: unknown
}

const CONSENT_TEXT = 'I give my consent to challan-details api to check my challan details'

/** Verify vehicle challan via API */
export async function verifyChallan(vehicleNo: string): Promise<ChallanItem[]> {
  const res = await apiPost<{ status?: number; result?: ChallanItem[]; message?: string }>(
    END_POINTS.CHALLAN_VERIFY,
    {
      vehicle_no: vehicleNo.toUpperCase().trim(),
      consent: 'Y',
      consent_text: CONSENT_TEXT,
    }
  )
  if (res?.status === 1) {
    return Array.isArray(res.result) ? res.result : []
  }
  const msg = res?.message || 'Challan verification failed'
  throw new Error(msg)
}

/** Fetch challan check history */
export async function fetchChallanHistory(): Promise<ChallanHistoryItem[]> {
  const res = await apiGet<{ status?: number; result?: ChallanHistoryItem[] }>(END_POINTS.CHALLAN_HISTORY)
  if (res?.status === 1 && Array.isArray(res.result)) {
    return res.result
  }
  return []
}
