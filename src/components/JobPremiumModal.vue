<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Shield, Star, Crown, Briefcase } from 'lucide-vue-next'
import { apiGet, apiPost, END_POINTS, STATICS, getUser } from '../services/config/api'
import { cleanupRazorpayOverlay } from '../utils/razorpayCleanup'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const props = defineProps<{
  visible: boolean
  jobId: string | null
  driverCount: number
  user?: { id?: unknown; name?: string; mobile?: string; email?: string } | null
}>()

const emit = defineEmits(['close', 'success', 'skip'])

const loading = ref(false)
const plans = ref<{ id?: number; name?: string; amount?: number }[]>([])
const plansLoading = ref(false)
const selectedPlan = ref<{ id?: number; name?: string; amount?: number } | null>(null)
const showSkipConfirm = ref(false)

const fetchPlans = async () => {
  plansLoading.value = true
  try {
    const res = await apiGet<{ data?: unknown[]; plans?: unknown[] }>(END_POINTS.SUBSCRIPTION_PLANS('transporter'))
    let all: unknown[] = []
    if (Array.isArray(res)) all = res
    else if (Array.isArray((res as { data?: unknown[] })?.data)) all = (res as { data?: unknown[] }).data!
    else if (Array.isArray((res as { plans?: unknown[] })?.plans)) all = (res as { plans?: unknown[] }).plans!
    const jobPlans = (all as { name?: string; id?: number; amount?: number }[]).filter(
      p => p.name === 'premium_job' || p.name === 'super_premium_job'
    )
    jobPlans.sort((a, b) => (a.amount || 0) - (b.amount || 0))
    plans.value = jobPlans
  } catch {
    plans.value = []
  } finally {
    plansLoading.value = false
  }
}

const loadRazorpay = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.body.appendChild(script)
  })
}

const restoreViewport = () => {
  const meta = document.querySelector('meta[name="viewport"]')
  if (meta && (window as any).__savedViewportContent) {
    meta.setAttribute('content', (window as any).__savedViewportContent)
    delete (window as any).__savedViewportContent
  }
}

const handlePay = async (plan: { id?: number; name?: string; amount?: number }) => {
  if (!props.jobId || loading.value) return
  loading.value = true
  selectedPlan.value = plan
  try {
    let profileMobile = ''
    try {
      const profileRes = await apiGet<{ status?: boolean; data?: { mobile?: string } }>(END_POINTS.GET_PROFILE)
      if (profileRes?.status && (profileRes as { data?: { mobile?: string } }).data) {
        profileMobile = String((profileRes as { data: { mobile?: string } }).data?.mobile ?? '').replace(/\D/g, '')
      }
    } catch { /* fallback to user */ }
    
    const orderPayload = {
      plan_id: plan.id,
      plan_name: plan.name,
      number_of_drivers: props.driverCount,
      job_id: props.jobId,
    }
    
    const orderRes = await apiPost<{ order_id?: string; id?: string; data?: { order_id?: string; id?: string }; success?: boolean; status?: boolean }>(
      END_POINTS.SUBSCRIPTION_ORDER,
      orderPayload
    )
    
    const orderId = (orderRes as { order_id?: string })?.order_id
      ?? (orderRes as { id?: string })?.id
      ?? (orderRes as { data?: { order_id?: string; id?: string } })?.data?.order_id
      ?? (orderRes as { data?: { order_id?: string; id?: string } })?.data?.id
    if (!orderId) throw new Error('Order ID not found')

    const u = getUser() as { mobile?: string; name?: string; email?: string } | null
    const rawMobile = profileMobile || String(props.user?.mobile ?? u?.mobile ?? '').replace(/\D/g, '')
    const digits = rawMobile.length >= 10 ? rawMobile.slice(-10) : rawMobile
    const contact = digits.length === 10 ? `+91${digits}` : ''

    await loadRazorpay()
    if (!window.Razorpay) throw new Error('Razorpay failed to load')

    const options = {
      key: STATICS.RAYZORPAY_KEY_ID,
      amount: (plan.amount || 0) * 100 * props.driverCount,
      currency: 'INR',
      name: 'TruckMitr',
      description: plan.name === 'super_premium_job' ? 'Super Premium Job Listing' : 'Premium Job Listing',
      order_id: orderId,
      image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
      prefill: {
        name: props.user?.name ?? u?.name ?? '',
        email: props.user?.email ?? u?.email ?? 'user@truckmitr.com',
        contact,
      },
      readonly: { contact: !!contact, name: true, email: true },
      notes: {
        user_id: String(props.user?.id ?? ''),
        plan_id: String(plan.id ?? ''),
        job_id: props.jobId,
      },
      theme: { color: '#246BFD' },
      modal: {
        confirm_close: true,
        escape: true,
        ondismiss: () => {
          cleanupRazorpayOverlay()
          restoreViewport()
          loading.value = false
        },
      },
      // Keep your custom config for sequence/preferences, but note it won't force a wider UI.
      config: {
        display: {
          hide: [{ method: 'contact' }],
          sequence: ['payment_methods'],
          preferences: { show_default_blocks: true },
          block: {
            'payment-methods': {
              prefill_new_card: true,
            },
          },
        },
      },
      handler: () => {
        cleanupRazorpayOverlay()
        restoreViewport()
        loading.value = false
        emit('success')
        emit('close')
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (e) {
    console.error('Job premium payment error:', e)
    loading.value = false
  }
}

const confirmSkip = () => {
  showSkipConfirm.value = false
  emit('skip')
  emit('close')
}

watch(() => props.visible, (v) => {
  if (v) {
    fetchPlans()
    showSkipConfirm.value = false
  } else {
    // When modal closes, cleanup any leftover Razorpay elements blocking the page
    cleanupRazorpayOverlay()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="overlay" @click.self="emit('close')">
        <div class="modal">
          <button class="close-btn" @click="emit('close')" aria-label="Close">
            <X :size="20" />
          </button>

          <div class="header">
            <div class="header-icon">
              <Briefcase :size="22" />
            </div>
            <h2 class="title">Choose Your Hiring Plan</h2>
            <div class="driver-badge">
              <span>{{ driverCount }} driver{{ driverCount > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <div class="plans">
            <div v-if="plansLoading" class="loading">Loading plans...</div>
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="plan-card"
              :class="{ premium: plan.name === 'super_premium_job' }"
            >
              <div v-if="plan.name === 'super_premium_job'" class="badge">URGENT HIRING</div>
              <div class="plan-header">
                <div class="plan-icon" :class="{ premium: plan.name === 'super_premium_job' }">
                  <Crown v-if="plan.name === 'super_premium_job'" :size="24" />
                  <Star v-else :size="24" />
                </div>
                <div class="plan-info">
                  <div class="plan-name">
                    {{ plan.name === 'super_premium_job' ? 'Super Premium Job' : 'Premium Job' }}
                  </div>
                  <div class="plan-price">₹{{ plan.amount?.toLocaleString() }} / per hiring</div>
                </div>
              </div>
              <div class="guarantee">
                <Shield :size="16" />
                <span>Driver hired within {{ plan.name === 'super_premium_job' ? '4' : '7' }} days — or money back</span>
              </div>
              <div class="total-row">
                <span>{{ driverCount }} × ₹{{ plan.amount?.toLocaleString() }} = ₹{{ ((plan.amount || 0) * driverCount).toLocaleString() }}</span>
                <button
                  class="pay-btn"
                  :class="{ premium: plan.name === 'super_premium_job' }"
                  :disabled="loading"
                  @click="handlePay(plan)"
                >
                  {{ loading && selectedPlan?.id === plan.id ? 'Opening...' : 'Pay Now' }}
                </button>
              </div>
            </div>
          </div>

          <button class="skip-btn" @click="showSkipConfirm = true" :disabled="loading">
            Skip, post as standard job
          </button>
        </div>

        <div v-if="showSkipConfirm" class="confirm-overlay" @click.self="showSkipConfirm = false">
          <div class="confirm-dialog">
            <h3>Post as Standard Job?</h3>
            <p>No dedicated Job Manager will be assigned. You will manage shortlisting and hiring on your own.</p>
            <div class="confirm-btns">
              <button class="btn-cancel" @click="showSkipConfirm = false">Go Back</button>
              <button class="btn-confirm" @click="confirmSkip">Post Job</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999; /* Above Razorpay (99999) so modal stays clickable after payment close */
  padding: 24px;
  pointer-events: auto;
}
.modal {
  background: #fff;
  border-radius: 16px;
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f3f4f6;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}
.header-icon {
  width: 44px;
  height: 44px;
  background: #E8F0FE;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #246BFD;
}
.title { font-size: 18px; font-weight: 700; margin: 0; }
.driver-badge {
  background: #EFF6FF;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #246BFD;
}
.plans { display: flex; flex-direction: column; gap: 16px; }
.loading { text-align: center; padding: 24px; color: #6b7280; }
.plan-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  position: relative;
}
.plan-card.premium { border-color: #F59E0B; background: #FFFCF5; }
.badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #F59E0B;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}
.plan-header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.plan-icon {
  width: 48px;
  height: 48px;
  background: #E8F0FE;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #246BFD;
}
.plan-icon.premium { background: #FFF5E6; color: #F59E0B; }
.plan-name { font-size: 16px; font-weight: 700; }
.plan-price { font-size: 13px; color: #6b7280; }
.guarantee {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #059669;
  margin-bottom: 16px;
}
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.pay-btn {
  background: #246BFD;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.pay-btn.premium { background: #F59E0B; }
.skip-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}
.confirm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.confirm-dialog {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
}
.confirm-dialog h3 { margin: 0 0 12px 0; font-size: 18px; }
.confirm-dialog p { margin: 0 0 20px 0; font-size: 14px; color: #6b7280; }
.confirm-btns { display: flex; gap: 12px; }
.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel { background: #f3f4f6; border: 1px solid #e5e7eb; }
.btn-confirm { background: #246BFD; color: #fff; border: none; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>