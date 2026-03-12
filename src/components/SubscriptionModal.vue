<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Check, Shield, Star } from 'lucide-vue-next'
import { apiGet, apiPost } from '../services/config/api'
import { END_POINTS, STATICS } from '../services/config/api'
import { cleanupRazorpayOverlay } from '../utils/razorpayCleanup'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const props = defineProps<{
  visible: boolean
  user?: { id?: unknown; name?: string; mobile?: string; email?: string } | null
}>()

const emit = defineEmits(['close', 'success'])

const consentChecked = ref(false)
const consentModalVisible = ref(false)
const loading = ref(false)
const plans = ref<{ id?: number; name?: string; amount?: number; tier?: string }[]>([])
const plansLoading = ref(false)

const benefits = [
  { title: 'Verified Drivers', desc: 'Driving License, ID & Face verification. Court & address checks.' },
  { title: 'Smart Driver Hiring', desc: 'View detailed profiles. Shortlist and hire faster. No brokers.' },
  { title: 'In-App Call & Video Interview', desc: 'Call or video interview drivers securely. Decide instantly.' },
  { title: 'Full Platform Access', desc: 'Post jobs. Contact and manage drivers. Large verified pool.' },
]

const fetchPlans = async () => {
  plansLoading.value = true
  try {
    const res = await apiGet<{ success?: boolean; status?: boolean; data?: { id?: number; name?: string; amount?: number; tier?: string }[] }>(
      END_POINTS.PAYMENT_SUBSCRIPTION_UPDATE('transporter')
    )
    const ok = res?.success || res?.status
    const data = res?.data
    if (ok && Array.isArray(data)) {
      plans.value = data
    } else {
      plans.value = [{ id: 1, name: 'Transporter Pro', amount: 499, tier: 'Standard' }]
    }
  } catch {
    plans.value = [{ id: 1, name: 'Transporter Pro', amount: 499, tier: 'Standard' }]
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

// Force desktop/webview layout: temporarily set viewport to desktop width before Razorpay opens
const FORCE_VIEWPORT_WIDTH = '1280'
let savedViewportContent: string | null = null

const forceWebViewLayout = () => {
  const meta = document.querySelector('meta[name="viewport"]')
  if (meta) {
    savedViewportContent = meta.getAttribute('content')
    meta.setAttribute('content', `width=${FORCE_VIEWPORT_WIDTH}, initial-scale=1, maximum-scale=1, user-scalable=no`)
  }
}

const restoreViewport = () => {
  const meta = document.querySelector('meta[name="viewport"]')
  if (meta && savedViewportContent) {
    meta.setAttribute('content', savedViewportContent)
    savedViewportContent = null
  }
}

const handleSubscribe = async () => {
  if (!consentChecked.value || loading.value) return
  const plan = plans.value.find((p) => p.amount === 499) || plans.value[0]
  if (!plan) return

  loading.value = true
  try {
    let profileMobile = '', profileName = '', profileEmail = ''
    try {
      const profileRes = await apiGet<{ status?: boolean; data?: Record<string, unknown> }>(END_POINTS.GET_PROFILE)
      if (profileRes?.status && profileRes?.data) {
        const p = profileRes.data
        profileMobile = String(p?.mobile ?? p?.mobile_number ?? '').replace(/\D/g, '')
        profileName = String(p?.name ?? p?.name_eng ?? '')
        profileEmail = String(p?.email ?? '')
      }
    } catch { /* fallback */ }

    const userMobile = profileMobile || String(props.user?.mobile ?? '').replace(/\D/g, '')
    const digits = userMobile.length >= 10 ? userMobile.slice(-10) : userMobile
    const contact = digits.length === 10 ? `+91${digits}` : ''

    const res = await apiPost<{ id?: string; order_id?: string; data?: { id?: string; order_id?: string } }>(
      END_POINTS.SUBSCRIPTION_ORDER,
      { plan_name: 'Standard' }
    )
    const inner = res && typeof res === 'object' ? (res as Record<string, unknown>) : {}
    const orderId = String(inner?.id || inner?.order_id || '')
    if (!orderId || orderId === 'undefined') throw new Error('Failed to create order')

    await loadRazorpay()
    if (!window.Razorpay) throw new Error('Razorpay failed to load')

    // Force desktop/webview layout before opening
    forceWebViewLayout()

    const userName = profileName || props.user?.name || ''
    const userEmail = profileEmail || props.user?.email || 'user@truckmitr.com'

    const options = {
      key: STATICS.RAYZORPAY_KEY_ID,
      amount: (plan.amount || 499) * 100,
      currency: 'INR',
      name: 'TruckMitr',
      description: plan.name || 'Transporter Pro Subscription',
      order_id: orderId,
      image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
      prefill: { name: userName, email: userEmail, contact },
      readonly: { contact: !!contact, name: !!userName, email: !!userEmail },
      modal: {
        confirm_close: true, // Allow user to close with confirmation dialog
        escape: true,
        animation: true,
        ondismiss: () => {
          cleanupRazorpayOverlay()
          restoreViewport()
          loading.value = false
        },
      },
      notes: {
        user_id: String(props.user?.id || ''),
        plan_id: String(plan.id || 1),
      },
      theme: { color: '#1a3a5c' },
      // Force webview (embedded) mode — desktop-friendly layout
      config: {
        display: {
          hide: [{ method: 'contact' }],
          sequence: ['payment_methods'],
          preferences: { show_default_blocks: true },
          block: {
            'payment-methods': { prefill_new_card: true },
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
    console.error('Subscription error:', e)
    restoreViewport()
    loading.value = false
  }
}

watch(() => props.visible, (v) => {
  if (v) { fetchPlans(); consentChecked.value = false; loading.value = false }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="overlay" @click.self="emit('close')">
        <div class="modal">

          <!-- Close -->
          <button class="close-btn" @click="emit('close')" aria-label="Close">
            <X :size="18" />
          </button>

          <!-- LEFT PANEL -->
          <div class="panel-left">
            <div class="left-top">
              <div class="brand-mark">
                <span class="brand-icon">🚛</span>
              </div>
              <div class="plan-badge">TRANSPORTER PRO</div>
              <h1 class="headline">Hire Drivers<br/>Without Worry</h1>
              <p class="subheadline">
                One subscription. Verified drivers.<br/>Complete peace of mind.
              </p>
            </div>

            <div class="divider-ornament">
              <span class="line"></span>
              <Star :size="12" class="star" />
              <span class="line"></span>
            </div>

            <ul class="benefits-list">
              <li v-for="(b, i) in benefits" :key="i" class="benefit-item">
                <span class="benefit-check"><Check :size="13" /></span>
                <div>
                  <div class="benefit-title">{{ b.title }}</div>
                  <div class="benefit-desc">{{ b.desc }}</div>
                </div>
              </li>
            </ul>

            <div class="trust-strip">
              <Shield :size="14" class="shield-icon" />
              <span>Built for Transporters Who Value Safety</span>
            </div>
          </div>

          <!-- RIGHT PANEL -->
          <div class="panel-right">
            <div class="price-block">
              <div class="price-label">Quarterly Plan</div>
              <div class="price-amount">₹499</div>
              <div class="price-period">billed every 3 months</div>
            </div>

            <div class="rule"></div>

            <div class="perks">
              <div class="perk-row"><Check :size="13" class="perk-icon" /> Verified driver profiles</div>
              <div class="perk-row"><Check :size="13" class="perk-icon" /> Secure in-app calling</div>
              <div class="perk-row"><Check :size="13" class="perk-icon" /> Unlimited job postings</div>
              <div class="perk-row"><Check :size="13" class="perk-icon" /> Background check access</div>
            </div>

            <div class="rule"></div>

            <label class="consent-label">
              <input v-model="consentChecked" type="checkbox" class="consent-cb" />
              <span class="consent-text">
                I agree to the
                <a href="#" class="consent-link" @click.prevent="consentModalVisible = true">subscription terms</a>
                and authorize recurring payments
              </span>
            </label>

            <button
              class="subscribe-btn"
              :disabled="!consentChecked || loading"
              @click="handleSubscribe"
            >
              <span v-if="loading" class="btn-inner">
                <span class="spinner"></span> Opening payment…
              </span>
              <span v-else class="btn-inner">
                Subscribe Now &nbsp;→
              </span>
            </button>

            <div class="secure-note">
              <Shield :size="13" />
              <span>Secured by Razorpay · 256-bit SSL</span>
            </div>
          </div>
        </div>

        <!-- Consent modal -->
        <Transition name="fade">
          <div v-if="consentModalVisible" class="consent-overlay" @click.self="consentModalVisible = false">
            <div class="consent-modal">
              <h3>Subscription Terms</h3>
              <p>By subscribing, you agree to our terms of service and authorize TruckMitr to process quarterly payments via Razorpay. You may cancel anytime from your account settings.</p>
              <button class="consent-ok-btn" @click="consentModalVisible = false">I Understand</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── VARIABLES ── */
* {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ── OVERLAY ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* ── MODAL ── */
.modal {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 820px;
  max-height: 92vh;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
}

@media (min-width: 680px) {
  .modal {
    flex-direction: row;
    max-height: 86vh;
  }
}

/* ── CLOSE ── */
.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 20;
  background: rgba(255,255,255,0.95);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #374151;
  transition: background 0.15s;
}
.close-btn:hover { background: #f3f4f6; }

/* ── LEFT PANEL ── */
.panel-left {
  background: #1e40af;
  color: #fff;
  padding: 36px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

@media (min-width: 680px) {
  .panel-left {
    width: 52%;
    flex-shrink: 0;
  }
}

.left-top {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 4px;
}

.plan-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2.5px;
  color: rgba(255,255,255,0.75);
  text-transform: uppercase;
}

.headline {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
  margin: 0;
}

.subheadline {
  font-size: 14px;
  font-weight: 400;
  color: rgba(255,255,255,0.7);
  line-height: 1.55;
  margin: 0;
}

.divider-ornament {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.25;
}
.line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.5);
}
.star { color: #fff; }

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.benefit-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.benefit-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  margin-top: 1px;
}

.benefit-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.benefit-desc {
  font-size: 12.5px;
  font-weight: 400;
  color: rgba(255,255,255,0.62);
  line-height: 1.5;
}

.trust-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  padding-top: 2px;
}
.shield-icon { color: rgba(255,255,255,0.7); flex-shrink: 0; }

/* ── RIGHT PANEL ── */
.panel-right {
  background: #f9fafb;
  padding: 36px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  flex: 1;
}

.price-block {
  text-align: center;
  padding-bottom: 4px;
}

.price-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 6px;
}

.price-amount {
  font-size: 46px;
  font-weight: 700;
  color: #1e40af;
  line-height: 1;
}

.price-period {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 6px;
}

.rule {
  height: 1px;
  background: #e5e7eb;
}

.perks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.perk-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #374151;
}

.perk-icon { color: #1e40af; flex-shrink: 0; }

.consent-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.consent-cb {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: #1e40af;
  flex-shrink: 0;
  cursor: pointer;
}

.consent-text {
  font-size: 12.5px;
  color: #6b7280;
  line-height: 1.55;
}

.consent-link {
  color: #1e40af;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.consent-link:hover { color: #1d4ed8; }

/* ── SUBSCRIBE BUTTON ── */
.subscribe-btn {
  width: 100%;
  padding: 13px 24px;
  background: #1e40af;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(30,64,175,0.3);
}

.subscribe-btn:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 4px 16px rgba(30,64,175,0.4);
}

.subscribe-btn:disabled {
  background: #93c5fd;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.secure-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

/* ── CONSENT MODAL ── */
.consent-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.consent-modal {
  background: #fff;
  border-radius: 10px;
  padding: 28px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 40px rgba(0,0,0,0.18);
  border: 1px solid #e5e7eb;
}

.consent-modal h3 {
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 10px;
}

.consent-modal p {
  font-size: 13.5px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 22px;
}

.consent-ok-btn {
  width: 100%;
  padding: 11px;
  background: #1e40af;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.consent-ok-btn:hover { background: #1d4ed8; }

/* ── TRANSITIONS ── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.22s ease, transform 0.22s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97) translateY(8px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>