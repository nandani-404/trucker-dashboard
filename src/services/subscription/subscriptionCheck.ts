/**
 * Web-compatible subscription check utilities.
 * Fetches PAYMENT_SUBSCRIPTION_DETAILS and provides helpers for gating features.
 */

import { apiGet } from '../config/api'
import { END_POINTS } from '../config/api'

export interface SubscriptionItem {
  end_at?: number
  amount?: number | string
  payment_type?: string
  plan_name?: string
  payment_status?: string
  subscription_id?: string
  payment_id?: string
  [key: string]: unknown
}

export interface SubscriptionDetailsResponse {
  status?: boolean
  data?: {
    showSubscriptionModel?: boolean
    [key: string]: unknown
  } | SubscriptionItem[] | SubscriptionItem
}

function isSubscriptionActive(item: SubscriptionItem | null | undefined): boolean {
  if (!item) return false
  if (!item.end_at) return false
  const endDate = new Date(item.end_at * 1000)
  return endDate > new Date()
}

function hasValidPayment(item: SubscriptionItem): boolean {
  const captured = item.payment_status === 'captured'
  const amt = item.amount ? parseFloat(String(item.amount)) : 0
  const floorAmt = Math.floor(amt)
  const isPremiumAmount = [499, 99, 100, 1].includes(floorAmt)
  return captured && isPremiumAmount && isSubscriptionActive(item)
}

function has499Payment(item: SubscriptionItem): boolean {
  const captured = item.payment_status === 'captured'
  const amt = item.amount ? parseFloat(String(item.amount)) : 0
  const floorAmt = Math.floor(amt)
  return captured && floorAmt >= 499 && isSubscriptionActive(item)
}

/**
 * Check if subscription is active (any valid payment)
 */
export function checkSubscriptionActive(details: SubscriptionItem | SubscriptionItem[] | null | undefined): boolean {
  if (!details) return false
  if (Array.isArray(details)) {
    return details.some((item) => {
      const captured = item.payment_status === 'captured'
      const hasId = !!(item.subscription_id || item.payment_id)
      return hasId && captured && isSubscriptionActive(item)
    })
  }
  const captured = details.payment_status === 'captured'
  const hasId = !!(details.subscription_id || details.payment_id)
  return hasId && captured && isSubscriptionActive(details)
}

/**
 * Check if user has premium (for View Applications - amounts 499, 99, 100, 1)
 */
export function hasPremiumSubscription(details: SubscriptionItem | SubscriptionItem[] | null | undefined): boolean {
  if (!details) return false
  if (Array.isArray(details)) {
    return details.some(hasValidPayment)
  }
  return hasValidPayment(details)
}

/**
 * Check if user has ₹499+ plan (required for transporters: RC Check, Challan Check, View Applications)
 */
export function hasTransporter499Subscription(details: SubscriptionItem | SubscriptionItem[] | null | undefined): boolean {
  if (!details) return false
  if (Array.isArray(details)) {
    return details.some(has499Payment)
  }
  return has499Payment(details)
}

/**
 * Fetch subscription details from API
 */
export async function fetchSubscriptionDetails(): Promise<{
  showSubscriptionModel: boolean
  subscriptionDetails: Record<string, unknown> | SubscriptionItem[] | null
  hasActive: boolean
  hasPremium: boolean
  hasTransporter499: boolean
}> {
  try {
    const res = await apiGet<SubscriptionDetailsResponse>(END_POINTS.PAYMENT_SUBSCRIPTION_DETAILS)
    if (!res?.status) {
      return { showSubscriptionModel: false, subscriptionDetails: null, hasActive: false, hasPremium: false, hasTransporter499: false }
    }

    let raw: unknown = res.data
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) {
      raw = (raw as { data?: unknown }).data
    }
    let subData: SubscriptionItem | SubscriptionItem[] | Record<string, unknown> | null = null
    let showSubscriptionModel = false
    let itemsToCheck: SubscriptionItem[] = []

    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw)) {
        subData = raw as SubscriptionItem[]
        itemsToCheck = raw as SubscriptionItem[]
        // When data is empty array, user has no subscription records → show modal
        if (raw.length === 0) {
          showSubscriptionModel = true
        }
      } else {
        const obj = raw as Record<string, unknown>
        showSubscriptionModel = !!(obj.showSubscriptionModel ?? obj.show_subscription_model)
        subData = raw as Record<string, unknown>
        if (Array.isArray(obj.subscriptions)) {
          itemsToCheck = obj.subscriptions as SubscriptionItem[]
        } else if (Array.isArray(obj.data)) {
          itemsToCheck = obj.data as SubscriptionItem[]
        } else if (obj.end_at !== undefined || obj.amount !== undefined) {
          itemsToCheck = [obj as SubscriptionItem]
        }
      }
    }

    const detailsToCheck = itemsToCheck.length > 0 ? itemsToCheck : (Array.isArray(subData) ? subData : subData ? [subData as SubscriptionItem] : null)
    const hasActive = checkSubscriptionActive(detailsToCheck)
    const hasPremium = hasPremiumSubscription(detailsToCheck)
    const hasTransporter499 = hasTransporter499Subscription(detailsToCheck)

    return {
      showSubscriptionModel,
      subscriptionDetails: subData,
      hasActive,
      hasPremium,
      hasTransporter499,
    }
  } catch {
    return { showSubscriptionModel: false, subscriptionDetails: null, hasActive: false, hasPremium: false, hasTransporter499: false }
  }
}

