<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Star,
  ChevronRight,
  ArrowLeft,
  MessageSquare,
  Shield,
  LogOut,
  MapPin,
  Download,
  Receipt,
  Settings,
  Loader2
} from 'lucide-vue-next'
import html2canvas from 'html2canvas'
import { getProfileFull, getSubscriptionDetails, getInvoiceUrl } from '../../../services/profile/profileApi'
import { BASE_URL } from '../../../services/config/api'
import logoTrick from '../../../assets/logo/logotrick.png'
import membershipCardBg from '../../../assets/images/membership-card/TransporterPro.png'

const props = defineProps<{
  user: {
    id: string;
    unique_id: string;
    name: string;
    mobile: string;
    email: string;
    role: string;
    images?: string;
    state?: string;
    city?: string;
    Type_of_License?: string;
    Transport_Name?: string;
    [key: string]: any;
  };
  profileCompletion?: number;
  rank?: string;
  star_rating?: number;
  subscriptionDetails?: any;
}>()

const emit = defineEmits(['back', 'navigate', 'logout', 'upgrade'])

// Fetched data (API-driven, same as app profile/index.tsx)
const profileData = ref<Record<string, unknown> | null>(null)
const profileCompletionFromApi = ref<string | number | undefined>(undefined)
const subscriptionData = ref<Record<string, unknown> | null>(null)
const loading = ref(true)
const downloadingInvoice = ref(false)
const savingCard = ref(false)
const toastMsg = ref('')

// Merge API profile with props.user
const user = computed(() => ({
  ...props.user,
  ...(profileData.value || {}),
}))

const completion = computed(() => {
  const p =
    profileCompletionFromApi.value ??
    profileData.value?.profile_completion ??
    profileData.value?.profile_completion_percentage ??
    props.profileCompletion
  if (p === undefined || p === null) return 0
  const n = typeof p === 'string' ? parseInt(p, 10) : Number(p)
  return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, Math.round(n)))
})

// Tier logic - mirrors app's getTierFromPaymentType
const tiers: Record<string, { color: string; text: string; bg: string }> = {
  'JOB READY': { color: '#0056b3', text: 'Job Ready', bg: '#0056b3' },
  'TRANSPORTER': { color: '#1e40af', text: 'Transporter', bg: '#1e40af' },
  'VERIFIED': { color: '#28a745', text: 'Verified', bg: '#28a745' },
  'TRUSTED': { color: '#ffc107', text: 'Trusted', bg: '#ffc107' },
  'TRANSPORTER PRO': { color: '#6f42c1', text: 'Transporter Pro', bg: '#6f42c1' },
  'LEGACY TRANSPORTER': { color: '#8B4513', text: 'Legacy Transporter', bg: '#8B4513' },
  'LEGACY': { color: '#8B4513', text: 'Legacy', bg: '#8B4513' },
}

function getTierFromSubscription(): string {
  const sub = subscriptionData.value
  const role = (user.value?.role || '').toLowerCase()
  const amount = sub?.amount ? parseFloat(String(sub.amount)) : 0

  if (role === 'transporter' && (amount === 499 || amount === 499.0)) return 'TRANSPORTER PRO'
  if (role === 'transporter' && [99, 99.0, 100, 1, 1.0].includes(amount)) return 'LEGACY TRANSPORTER'
  if ([49, 49.0, 1, 1.0].includes(amount)) return 'LEGACY'
  if (amount >= 499) return role === 'transporter' ? 'TRANSPORTER PRO' : 'TRUSTED'
  if (amount >= 199) return 'VERIFIED'
  // Role-aware fallback: transporters get "Transporter", drivers get "Job Ready"
  return role === 'transporter' ? 'TRANSPORTER' : 'JOB READY'
}

const userTier = computed(() => getTierFromSubscription())
const currentTier = computed(() => tiers[userTier.value] ?? tiers['JOB READY'] ?? { color: '#0056b3', text: 'Job Ready', bg: '#0056b3' })

const locationStr = computed(() => {
  const city = user.value?.city || ''
  const state = user.value?.state_name || user.value?.state || ''
  return (city && state ? `${city}, ${state}` : (city || state || 'India')).toUpperCase()
})

const formatDate = (ts: number) => {
  if (!ts) return 'N/A'
  return new Date(ts * 1000).toLocaleDateString('en-GB')
}

const profileImageUrl = computed(() => {
  const img = String(user.value?.images ?? '')
  if (!img) return 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
  return img.startsWith('http') ? img : `${BASE_URL}public/${img}`
})

// Should show membership card (has subscription with captured payment - same as app)
const showMembershipCard = computed(() => {
  const sub = subscriptionData.value
  if (!sub) return false
  if (!(sub.payment_id ?? sub.id)) return false
  return sub.payment_status === 'captured'
})

function showToast(msg: string) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

async function fetchProfileAndSubscription() {
  loading.value = true
  try {
    const [fullProfile, subscription] = await Promise.all([
      getProfileFull(),
      getSubscriptionDetails(),
    ])
    profileData.value = (fullProfile?.user ?? fullProfile) as Record<string, unknown>
    profileCompletionFromApi.value = fullProfile?.profile_completion
    subscriptionData.value = subscription as Record<string, unknown>
  } catch (e) {
    console.error('Profile fetch error', e)
  } finally {
    loading.value = false
  }
}

async function handleDownloadInvoice() {
  const sub = subscriptionData.value
  const rawId = sub?.payment_id ?? sub?.id
  if (rawId == null || (typeof rawId !== 'string' && typeof rawId !== 'number')) {
    showToast('Unable to download invoice')
    return
  }
  const paymentId = typeof rawId === 'number' ? rawId : String(rawId)
  downloadingInvoice.value = true
  try {
    const url = await getInvoiceUrl(paymentId)
    if (url) {
      window.open(url, '_blank')
      showToast('Invoice opened')
    } else {
      showToast('Invoice not available')
    }
  } catch (e) {
    showToast('Failed to download invoice')
  } finally {
    downloadingInvoice.value = false
  }
}

async function handleSaveCard() {
  const el = membershipCardRef.value
  if (!el) return
  savingCard.value = true
  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    })
    const link = document.createElement('a')
    link.download = `TruckMitr_Membership_Card_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    showToast('Card saved')
  } catch (e) {
    showToast('Failed to save card')
  } finally {
    savingCard.value = false
  }
}

const membershipCardRef = ref<HTMLElement | null>(null)

onMounted(() => fetchProfileAndSubscription())
</script>

<template>
  <div class="classic-profile-layout">
    <!-- Header -->
    <header class="classic-header">
      <div class="header-inner">
        <button class="header-back" @click="emit('back')">
          <ArrowLeft :size="18" />
          <span>Back</span>
        </button>
        <h1 class="header-title">My Profile</h1>
      </div>
    </header>

    <div v-if="loading" class="profile-loading">
      <Loader2 :size="40" class="spin" />
      <p>Loading profile...</p>
    </div>

    <div v-else class="classic-content-container">
      <!-- Section 1: Profile Summary -->
      <section class="profile-summary">
        <div class="summary-left">
          <div class="avatar-wrapper">
            <!-- Progress Ring -->
            <div class="progress-ring" :style="{ '--progress': completion + '%' }">
              <div class="avatar-container">
                <img :src="profileImageUrl" alt="User" />
              </div>
            </div>
            <!-- Percentage Badge -->
            <div class="completion-badge">
              {{ completion }}%
            </div>
          </div>
          <div class="summary-info">
            <h2>{{ user.name || user.name_eng }}</h2>
            <p class="tm-id">ID: {{ user.unique_id }}</p>
            <div class="badge-list">
              <span class="classic-badge" :style="{ borderColor: currentTier.color, color: currentTier.color }">
                {{ currentTier.text }}
              </span>
              <span v-if="(user.star_rating ?? star_rating)" class="classic-badge rating">
                <Star :size="12" fill="currentColor" /> {{ (user.star_rating ?? star_rating) }}.0
              </span>
            </div>
          </div>
        </div>
        <div class="summary-right">
          <button class="classic-view-btn" @click="emit('navigate', 'profile-overview')">View Full Profile</button>
          <button class="classic-edit-btn" @click="emit('navigate', 'profile-edit')">Edit Profile</button>
        </div>
      </section>

      <!-- Section 2: Membership Card (API-driven, same as app) -->
      <template v-if="showMembershipCard">
        <div class="section-divider">Membership Identification</div>
        <section class="membership-section">
          <div ref="membershipCardRef" class="id-card-classic" :style="{ backgroundImage: `url(${membershipCardBg})` }">
            <div class="card-header">
              <img :src="logoTrick" class="tm-logo" alt="TruckMitrLogo" />
              <div class="card-header-right">
                <span class="membership-type">{{ currentTier.text.toUpperCase() }}</span>
                <img :src="profileImageUrl" class="card-profile-photo" alt="" />
              </div>
            </div>
            
            <div class="card-middle">
              <div class="id-group">
                <span class="id-label">OFFICIAL TM ID</span>
                <span class="id-val">{{ user.unique_id }}</span>
              </div>
            </div>

            <div class="card-footer">
              <div class="footer-left">
                <div class="card-user-name">{{ (user.name || user.name_eng || '').toUpperCase() }}</div>
                <div class="card-location"><MapPin :size="12" /> {{ locationStr }}</div>
              </div>
              <div class="footer-right">
                <div class="valid-box">
                  <span class="v-label">VALID UNTIL</span>
                  <span class="v-val">{{ subscriptionData?.end_at ? formatDate(Number(subscriptionData.end_at)) : '31/12/2025' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-controls">
            <button class="control-btn" :disabled="downloadingInvoice" @click="handleDownloadInvoice">
              <Loader2 v-if="downloadingInvoice" :size="18" class="spin" />
              <Receipt v-else :size="18" />
              {{ downloadingInvoice ? 'Downloading...' : 'Download Invoice' }}
            </button>
            <button class="control-btn" :disabled="savingCard" @click="handleSaveCard">
              <Loader2 v-if="savingCard" :size="18" class="spin" />
              <Download v-else :size="18" />
              {{ savingCard ? 'Saving...' : 'Save ID Card' }}
            </button>
          </div>
        </section>
      </template>

      <template v-else-if="user.unique_id">
        <div class="section-divider">Membership</div>
        <section class="membership-section no-subscription">
          <p class="no-sub-msg">Complete your subscription to get your membership card.</p>
          <button class="control-btn upgrade-btn" @click="emit('upgrade')">
            Upgrade Plan
          </button>
        </section>
      </template>

      <div class="section-divider">General</div>
      <section class="menu-list">
        <div class="menu-item" @click="emit('navigate', 'contact-us')">
          <div class="menu-icon" style="color: #0ea5e9; background-color: #0ea5e915;"><MessageSquare :size="20" /></div>
          <div class="menu-text">Contact Us</div>
          <ChevronRight :size="18" class="chevron" />
        </div>
        <div class="menu-item" @click="emit('navigate', 'privacy-policy')">
          <div class="menu-icon" style="color: #8b5cf6; background-color: #8b5cf615;"><Shield :size="20" /></div>
          <div class="menu-text">Privacy Policy</div>
          <ChevronRight :size="18" class="chevron" />
        </div>
        <div class="menu-item" @click="emit('navigate', 'rate-us')">
          <div class="menu-icon" style="color: #ec4899; background-color: #ec489915;"><Star :size="20" /></div>
          <div class="menu-text">Rate Us</div>
          <ChevronRight :size="18" class="chevron" />
        </div>
        <div class="menu-item" @click="emit('navigate', 'app-settings')">
          <div class="menu-icon" style="color: #64748b; background-color: #64748b15;"><Settings :size="20" /></div>
          <div class="menu-text">App Settings</div>
          <ChevronRight :size="18" class="chevron" />
        </div>
      </section>

      <!-- Logout -->
      <div class="logout-wrapper">
        <button class="classic-logout-btn" @click="emit('logout')">
          <LogOut :size="18" />
          <span>Logout Account</span>
        </button>
      </div>

      <div class="classic-footer">
        <p>TruckMitr Application v2.4.1</p>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="profile-toast">{{ toastMsg }}</div>
  </div>
</template>

<style scoped>
/* Standard Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.classic-profile-layout {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #333333;
  width: 100%;
}

/* Header */
.classic-header {
  border-bottom: 1px solid #eef0f2;
  padding: 16px 24px;
  background: #ffffff;
  width: 100%;
}

.header-inner {
  display: flex;
  align-items: center;
  width: 100%;
}

.header-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid #eef0f2;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  margin-right: 20px;
  transition: all 0.2s;
}

.header-back:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

/* Content Container */
.classic-content-container {
  width: 100%;
  padding: 32px;
  box-sizing: border-box;
}

/* Section Common Styling */
section {
  border: 1px solid #eef0f2;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  background: #ffffff;
  width: 100%;
  box-sizing: border-box;
}

.section-divider {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 32px 0 16px 4px;
}

/* Profile Summary with Progress Ring */
.profile-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(#ff8c00 var(--progress), #f1f5f9 0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container {
  width: 88px;
  height: 88px;
  background: #ffffff;
  border-radius: 50%;
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.completion-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff8c00;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 20px;
  border: 2px solid #ffffff;
  white-space: nowrap;
}

.summary-info h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #0f172a;
}

.tm-id {
  font-size: 14px;
  color: #64748b;
  font-family: monospace;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.badge-list {
  display: flex;
  gap: 8px;
}

.classic-badge {
  font-size: 11px;
  font-weight: 700;
  border: 1px solid #eef0f2;
  padding: 4px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.classic-view-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.classic-view-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}

.classic-edit-btn {
  background: #ffffff;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.classic-edit-btn:hover {
  background: #3b82f6;
  color: #ffffff;
  transform: translateY(-1px);
}

/* Membership Section */
.id-card-classic {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  aspect-ratio: 1.586;
  border-radius: 24px;
  padding: 32px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.id-card-classic::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(30,41,59,0.85) 0%, rgba(30,41,59,0.5) 45%, transparent 70%);
  pointer-events: none;
  border-radius: 24px;
}

.id-card-classic > * {
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.tm-logo {
  height: 28px;
}

.card-profile-photo {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.8);
}

.membership-type {
  font-size: 12px;
  font-weight: 800;
  color: #ffffff;
  opacity: 0.95;
  letter-spacing: 1px;
}

.id-group {
  display: flex;
  flex-direction: column;
}

.id-label {
  font-size: 10px;
  color: rgba(255,255,255,0.85);
  letter-spacing: 1px;
  font-weight: 600;
}

.id-val {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #ffffff;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.card-user-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.card-location {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
  margin-top: 4px;
}

.valid-box {
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 12px;
  color: #ffffff;
  text-align: right;
  border: 1px solid rgba(255,255,255,0.3);
}

.v-label {
  display: block;
  font-size: 9px;
  color: rgba(255,255,255,0.85);
  font-weight: 700;
}

.v-val {
  font-size: 12px;
  font-weight: 700;
}

.card-controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.control-btn {
  background: #ffffff;
  border: 1px solid #eef0f2;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Menu List with Colored Icons */
.menu-list {
  padding: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: all 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-icon {
  margin-right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.chevron {
  color: #cbd5e1;
}

/* Logout */
.logout-wrapper {
  margin-top: 48px;
}

.classic-logout-btn {
  width: 100%;
  background: #ffffff;
  border: 1px solid #fee2e2;
  color: #ef4444;
  padding: 16px;
  border-radius: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.classic-logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.classic-footer {
  text-align: center;
  margin: 48px 0;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.profile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.profile-loading p { margin-top: 12px; font-size: 14px; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.no-subscription {
  text-align: center;
  padding: 32px;
}

.no-sub-msg {
  color: #64748b;
  font-size: 15px;
  margin: 0 0 20px;
}

.upgrade-btn {
  background: #3b82f6 !important;
  color: #fff !important;
  border-color: #3b82f6 !important;
}

.profile-toast {
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
  font-size: 14px;
}

@media (max-width: 768px) {
  .classic-content-container {
    padding: 20px;
  }
  .profile-summary {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  .summary-left {
    flex-direction: column;
  }
  .classic-edit-btn {
    width: 100%;
  }
}
</style>
