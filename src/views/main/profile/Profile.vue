<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Star, ChevronRight, ArrowLeft, MessageSquare, Shield,
  LogOut, MapPin, Download, Receipt, Settings, Loader2,
  CreditCard, Edit2, Heart
} from 'lucide-vue-next'
// import html2canvas from 'html2canvas' (dynamically imported below)
import { getProfileFull, getSubscriptionDetails, getInvoiceUrl } from '../../../services/profile/profileApi'
import { BASE_URL } from '../../../services/config/api'
import logoTrick from '../../../assets/logo/logotrick.png'
import membershipCardBg from '../../../assets/images/membership-card/TransporterPro.png'

const props = defineProps<{
  user: {
    id: string; unique_id: string; name: string; mobile: string;
    email: string; role: string; images?: string; state?: string;
    city?: string; Type_of_License?: string; Transport_Name?: string;
    [key: string]: any;
  };
  profileCompletion?: number;
  rank?: string;
  star_rating?: number;
  subscriptionDetails?: any;
}>()

const emit = defineEmits(['back', 'navigate', 'logout', 'upgrade', 'edit'])

// --- Fetched data ---
const profileData = ref<Record<string, unknown> | null>(null)
const profileCompletionFromApi = ref<string | number | undefined>(undefined)
const subscriptionData = ref<Record<string, unknown> | null>(null)
const loading = ref(true)
const downloadingInvoice = ref(false)
const savingCard = ref(false)
const toastMsg = ref('')

// --- Computed ---
const user = computed(() => ({ ...props.user, ...(profileData.value || {}) }))

const completion = computed(() => {
  const p = profileCompletionFromApi.value ?? profileData.value?.profile_completion ?? profileData.value?.profile_completion_percentage ?? props.profileCompletion
  if (p === undefined || p === null) return 0
  const n = typeof p === 'string' ? parseInt(p, 10) : Number(p)
  return Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, Math.round(n)))
})

const tiers = {
  'JOB READY': { color: '#0056b3', text: 'Job Ready', bg: '#0056b3' },
  'TRANSPORTER': { color: '#1e40af', text: 'Transporter', bg: '#1e40af' },
  'VERIFIED': { color: '#28a745', text: 'Verified', bg: '#28a745' },
  'TRUSTED': { color: '#ffc107', text: 'Trusted', bg: '#ffc107' },
  'TRANSPORTER PRO': { color: '#6f42c1', text: 'Transporter Pro', bg: '#6f42c1' },
  'LEGACY TRANSPORTER': { color: '#8B4513', text: 'Legacy Transporter', bg: '#8B4513' },
} as const

const userTier = computed(() => {
  const sub = subscriptionData.value
  const role = (user.value?.role || '').toLowerCase()
  const amount = sub?.amount ? parseFloat(String(sub.amount)) : 0
  if (role === 'transporter' && amount === 499) return 'TRANSPORTER PRO'
  if (role === 'transporter' && [99, 100, 1].includes(amount)) return 'LEGACY TRANSPORTER'
  if (amount >= 499) return role === 'transporter' ? 'TRANSPORTER PRO' : 'TRUSTED'
  if (amount >= 199) return 'VERIFIED'
  return role === 'transporter' ? 'TRANSPORTER' : 'JOB READY'
})

const currentTier = computed(() => {
  const t = (tiers as any)[userTier.value] || tiers['JOB READY']
  return t as { color: string; text: string; bg: string }
})

const locationStr = computed(() => {
  const city = user.value?.city || ''
  const state = user.value?.state_name || user.value?.state || ''
  return (city && state ? `${city}, ${state}` : (city || state || 'India')).toUpperCase()
})

const profileImageUrl = computed(() => {
  const img = String(user.value?.images ?? '')
  if (!img) return 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
  return img.startsWith('http') ? img : `${BASE_URL}public/${img}`
})

const showMembershipCard = computed(() => {
  const sub = subscriptionData.value
  return sub && (sub.payment_id ?? sub.id) && sub.payment_status === 'captured'
})

// --- Handlers ---
function showToast(msg: string) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

async function fetchProfileAndSubscription() {
  loading.value = true
  try {
    const [fullProfile, subscription] = await Promise.all([getProfileFull(), getSubscriptionDetails()])
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
  if (!rawId) { showToast('Unable to download invoice'); return }
  downloadingInvoice.value = true
  try {
    const url = await getInvoiceUrl(String(rawId))
    if (url) { window.open(url, '_blank'); showToast('Invoice opened') }
    else showToast('Invoice not available')
  } catch (e) { showToast('Failed to download invoice') }
  finally { downloadingInvoice.value = false }
}

async function handleSaveCard() {
  const el = membershipCardRef.value
  if (!el) return
  savingCard.value = true
  try {
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null, logging: false })
    const link = document.createElement('a')
    link.download = `TruckMitr_Membership_Card_${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    showToast('Card saved')
  } catch (e) { showToast('Failed to save card') }
  finally { savingCard.value = false }
}

function formatDate(ts: any) {
  if (!ts) return '31/12/2025'
  const n = Number(ts)
  if (isNaN(n)) return String(ts)
  return new Date(n * 1000).toLocaleDateString('en-GB')
}

const handleNavigate = (route: string) => emit('navigate', route)
const handleBack = () => emit('back')
const handleLogout = () => emit('logout')
const handleUpgrade = () => emit('upgrade')

const membershipCardRef = ref<HTMLElement | null>(null)
onMounted(() => fetchProfileAndSubscription())
</script>

<template>
  <div class="refined-profile-app">
    <!-- Clean Sticky Header -->
    <header class="top-nav">
      <div class="nav-left">
        <button class="icon-btn" @click="handleBack">
          <ArrowLeft :size="20" />
        </button>
        <span class="nav-title">My Account</span>
      </div>
      <div class="nav-right">
        <button class="pill-btn logout" @click="handleLogout">
          <LogOut :size="16" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="48" class="spin-icon" />
      <p>Fetching your credentials...</p>
    </div>

    <main v-else class="viewport-content">
      <!-- HERO-IDENTITY SECTION -->
      <section class="profile-hero-section">
        <div class="hero-bg-overlay"></div>
        <div class="hero-main-content">
          <div class="hero-meta">
            <div class="avatar-aura" :style="{ '--p': completion + '%' }">
              <div class="avatar-inner">
                <img :src="profileImageUrl" alt="User Avatar" />
              </div>
              <div class="completion-pill">{{ completion }}%</div>
            </div>
            
            <div class="user-core-info">
              <h1 class="user-display-name">{{ user.name || 'Account Holder' }}</h1>
              <div class="user-identifiers">
                <p class="unique-tm-id">{{ user.unique_id }}</p>
                <span class="role-badge">Transporter</span>
              </div>
              <div class="stat-row">
                <div v-if="user.star_rating ?? star_rating" class="rating-pill">
                  <Star :size="12" fill="currentColor" />
                  <span>{{ user.star_rating ?? star_rating }}.0 Rating</span>
                </div>
              </div>
            </div>
          </div>

          <div class="hero-cta-group">
            <button class="btn-primary-filled" @click="handleNavigate('profile-edit')">
              <Edit2 :size="16" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </section>

      <!-- MEMBERSHIP SECTION -->
      <div class="content-container">
        <div class="section-heading">
          <CreditCard :size="18" />
          <span>Membership Identification</span>
        </div>

        <section v-if="showMembershipCard" class="membership-card-wrap">
          <div ref="membershipCardRef" class="membership-id-card" :style="{ backgroundImage: `url(${membershipCardBg})` }">
            <!-- Glass Overlay for premium feel -->
            <div class="glass-glare"></div>
            
            <div class="card-brand-header">
              <img :src="logoTrick" class="brand-logo" alt="TruckMitr" />
              <div class="membership-status-badge">
                 <span class="status-token">{{ currentTier.text.toUpperCase() }}</span>
                 <img :src="profileImageUrl" class="card-mini-avatar" alt="" />
              </div>
            </div>
            
            <div class="card-middle-section">
              <label>OFFICIAL TM ID</label>
              <h3>{{ user.unique_id }}</h3>
            </div>

            <div class="card-footer-info">
              <div class="footer-primary">
                <div class="holder-name">{{ (user.name || '').toUpperCase() }}</div>
                <div class="holder-loc"><MapPin :size="12" /> {{ locationStr }}</div>
              </div>
              <div class="validity-tag">
                <span class="tag-label">VALID UNTIL</span>
                <span class="tag-date">{{ formatDate(subscriptionData?.end_at) }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions-dock">
            <button class="dock-btn secondary" :disabled="downloadingInvoice" @click="handleDownloadInvoice">
              <Loader2 v-if="downloadingInvoice" :size="18" class="spin" />
              <Receipt v-else :size="18" />
              <span>Download Invoice</span>
            </button>
            <button class="dock-btn primary" :disabled="savingCard" @click="handleSaveCard">
              <Loader2 v-if="savingCard" :size="18" class="spin" />
              <Download v-else :size="18" />
              <span>Save Member ID</span>
            </button>
          </div>
        </section>

        <section v-else class="membership-upsell-card">
          <div class="upsell-content">
            <CreditCard :size="40" class="upsell-icon" />
            <h3>Complete your Identification</h3>
            <p>Upgrade your plan to receive your official TruckMitr Membership Card and exclusive transporter benefits.</p>
            <button class="btn-upgrade" @click="handleUpgrade">Upgrade Now</button>
          </div>
        </section>

        <!-- GENERAL MENU -->
        <div class="section-heading">
          <Settings :size="18" />
          <span>Security & Support</span>
        </div>

        <section class="options-grid">
           <div class="opt-card" @click="handleNavigate('contact-us')">
              <div class="opt-icon sky"><MessageSquare :size="20" /></div>
              <div class="opt-text">
                <h4>Contact Support</h4>
                <p>Get help from our team</p>
              </div>
              <ChevronRight :size="18" class="opt-chevron" />
           </div>

           <div class="opt-card" @click="handleNavigate('privacy-policy')">
              <div class="opt-icon violet"><Shield :size="20" /></div>
              <div class="opt-text">
                <h4>Privacy & Terms</h4>
                <p>Your data security details</p>
              </div>
              <ChevronRight :size="18" class="opt-chevron" />
           </div>

           <div class="opt-card" @click="handleNavigate('rate-us')">
              <div class="opt-icon pink"><Heart :size="20" /></div>
              <div class="opt-text">
                <h4>Rate the Experience</h4>
                <p>Help us improve TruckMitr</p>
              </div>
              <ChevronRight :size="18" class="opt-chevron" />
           </div>

           <div class="opt-card" @click="handleNavigate('app-settings')">
              <div class="opt-icon slate"><Settings :size="20" /></div>
              <div class="opt-text">
                <h4>App Preferences</h4>
                <p>Customize your dashboard</p>
              </div>
              <ChevronRight :size="18" class="opt-chevron" />
           </div>
        </section>

        <footer class="app-info-footer">
          <p class="version-tag">TruckMitr Professional v2.4.1</p>
          <div class="legal-links">
             <span>Terms of Service</span>
             <span class="dot">•</span>
             <span>Legal Registry</span>
          </div>
        </footer>
      </div>
    </main>

    <!-- Global Toast notification -->
    <Transition name="fade-slide">
      <div v-if="toastMsg" class="profile-toast-alert">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.refined-profile-app {
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
}

/* -- Sticky Navigation -- */
.top-nav {
  position: sticky; top: 0; z-index: 100;
  height: 72px; padding: 0 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
}
.nav-left { display: flex; align-items: center; gap: 16px; }
.nav-title { font-size: 18px; font-weight: 700; color: #0f172a; }
.icon-btn {
  width: 40px; height: 40px; border-radius: 10px;
  border: 1px solid #e2e8f0; background: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s; color: #64748b;
}
.icon-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
.pill-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;
}
.pill-btn.logout { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
.pill-btn.logout:hover { background: #fee2e2; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1); }

/* -- Loading -- */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 100px 20px; color: #64748b;
}
.spin-icon { animation: spin 1s linear infinite; margin-bottom: 20px; color: #3b82f6; }
@keyframes spin { to { transform: rotate(360deg); } }

/* -- Hero Section -- */
.profile-hero-section {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
  padding: 32px 40px; color: white;
  max-width: 1120px;
  margin: 32px auto 0;
  border-radius: 30px;
  box-shadow: 0 12px 40px rgba(37, 99, 235, 0.2);
}
.hero-bg-overlay {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
  opacity: 0.4;
}
.hero-main-content { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; width: 100%; }
.hero-meta { display: flex; align-items: center; gap: 40px; }

.avatar-aura {
  position: relative; width: 104px; height: 104px;
}
.avatar-inner {
  width: 100%; height: 100%; border-radius: 50%;
  padding: 5px; background: conic-gradient(#f59e0b var(--p), rgba(255,255,255,0.1) 0deg);
  display: flex; align-items: center; justify-content: center;
}
.avatar-inner img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid #1e293b; background: white; }
.completion-pill {
  position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
  background: white; color: #d97706; padding: 4px 12px; border-radius: 20px;
  font-size: 12px; font-weight: 800; border: 2px solid #1e293b; box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.user-core-info { display: flex; flex-direction: column; gap: 8px; }
.user-display-name { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin: 0; }
.unique-tm-id { font-size: 16px; color: rgba(255, 255, 255, 0.6); margin: 0; font-family: monospace; letter-spacing: 1px; }
.role-badge { 
  display: inline-block; padding: 4px 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.1); 
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.1);
}
.stat-row { display: flex; gap: 12px; margin-top: 4px; }
.rating-pill, .tier-pill { 
  display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
}
.rating-pill { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
.tier-pill { border: 1px solid transparent; }

.hero-cta-group { display: flex; gap: 16px; }
.btn-primary-ghost {
  padding: 12px 24px; border-radius: 12px; background: rgba(255,255,255,0.05); color: white;
  border: 1px solid rgba(255,255,255,0.2); font-weight: 700; cursor: pointer; transition: 0.2s;
}
.btn-primary-ghost:hover { background: rgba(255,255,255,0.1); border-color: white; }
.btn-primary-filled {
  padding: 12px 28px; border-radius: 12px; background: white; color: #0f172a;
  border: none; font-weight: 700; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
}
.btn-primary-filled:hover { transform: translateY(-2px); background: #f1f5f9; }

/* -- Content Sections -- */
.viewport-content { max-width: 1200px; margin: 0 auto; width: 100%; }
.content-container { padding: 40px; }
.section-heading {
  display: flex; align-items: center; gap: 10px; padding: 0 0 24px 4px; color: #64748b;
}
.section-heading span { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }

/* -- Membership ID Card -- */
.membership-card-wrap { display: flex; flex-direction: column; gap: 32px; margin-bottom: 60px; }
.membership-id-card {
  width: 100%; max-width: 540px; margin: 0 auto; aspect-ratio: 1.586;
  border-radius: 28px; padding: 36px; color: white; position: relative;
  overflow: hidden; background-size: cover; background-position: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}
.membership-id-card::after {
  content: ''; position: absolute; inset: 0; 
  background: linear-gradient(105deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.4) 50%, transparent 100%);
  pointer-events: none;
}
.glass-glare {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%);
  pointer-events: none; z-index: 1;
}
.membership-id-card > * { position: relative; z-index: 2; }

.card-brand-header { display: flex; justify-content: space-between; align-items: flex-start; }
.brand-logo { height: 32px; }
.membership-status-badge { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.status-token { font-size: 13px; font-weight: 800; letter-spacing: 1px; color: #f59e0b; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
.card-mini-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.8); }

.card-middle-section { margin: 40px 0; }
.card-middle-section label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); letter-spacing: 2px; }
.card-middle-section h3 { font-size: 36px; font-weight: 900; letter-spacing: 2px; margin: 4px 0 0 0; }

.card-footer-info { display: flex; justify-content: space-between; align-items: flex-end; }
.holder-name { font-size: 22px; font-weight: 700; }
.holder-loc { font-size: 12px; color: rgba(255,255,255,0.8); display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.validity-tag { background: rgba(255,255,255,0.1); padding: 10px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px); }
.tag-label { display: block; font-size: 9px; font-weight: 800; color: rgba(255,255,255,0.6); margin-bottom: 2px; }
.tag-date { font-size: 13px; font-weight: 700; }

.card-actions-dock { display: flex; justify-content: center; gap: 16px; }
.dock-btn { 
  display: flex; align-items: center; gap: 10px; padding: 14px 24px; border-radius: 14px;
  font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; border: 1px solid #e2e8f0;
}
.dock-btn.secondary { background: white; color: #475569; }
.dock-btn.primary { background: #0f172a; color: white; border-color: #0f172a; }
.dock-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.dock-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* -- Upsell Card -- */
.membership-upsell-card {
  padding: 48px; background: white; border-radius: 28px; border: 1px dashed #cbd5e1;
  text-align: center; margin-bottom: 60px;
}
.upsell-icon { color: #e2e8f0; margin-bottom: 20px; }
.upsell-content h3 { font-size: 20px; font-weight: 800; margin-bottom: 12px; }
.upsell-content p { color: #64748b; max-width: 440px; margin: 0 auto 28px; line-height: 1.6; }
.btn-upgrade { 
  padding: 14px 40px; background: #3b82f6; color: white; border: none;
  border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.btn-upgrade:hover { transform: scale(1.02); background: #2563eb; }

/* -- Options Grid -- */
.options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 60px; }
.opt-card {
  background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 20px; cursor: pointer; transition: 0.2s;
}
.opt-card:hover { border-color: #3b82f6; background: #f0f7ff; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); }
.opt-icon { 
  width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
}
.opt-icon.sky { background: #e0f2fe; color: #0ea5e9; }
.opt-icon.violet { background: #f5f3ff; color: #8b5cf6; }
.opt-icon.pink { background: #fdf2f8; color: #ec4899; }
.opt-icon.slate { background: #f1f5f9; color: #64748b; }

.opt-text { flex: 1; }
.opt-text h4 { font-size: 16px; font-weight: 700; margin: 0 0 2px 0; }
.opt-text p { font-size: 13px; color: #64748b; margin: 0; }
.opt-chevron { color: #cbd5e1; transition: 0.2s; }
.opt-card:hover .opt-chevron { color: #3b82f6; transform: translateX(3px); }

/* -- Footer -- */
.app-info-footer { text-align: center; padding-bottom: 60px; }
.version-tag { font-size: 13px; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
.legal-links { color: #cbd5e1; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 12px; }
.legal-links span { cursor: pointer; }
.legal-links span:hover { color: #94a3b8; }

/* -- Toast & Animations -- */
.profile-toast-alert {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  background: #1e293b; color: white; padding: 14px 28px; border-radius: 14px;
  font-weight: 600; font-size: 14px; z-index: 1000; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
}
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translate(-50%, 20px); }

@media (max-width: 768px) {
  .top-nav { padding: 0 20px; }
  .profile-hero-section { padding: 40px 20px; }
  .hero-main-content { flex-direction: column; align-items: flex-start; gap: 32px; }
  .hero-meta { flex-direction: column; align-items: flex-start; gap: 24px; }
  .user-display-name { font-size: 30px; }
  .hero-cta-group { width: 100%; }
  .btn-primary-ghost, .btn-primary-filled { flex: 1; justify-content: center; }
  .content-container { padding: 32px 20px; }
  .membership-id-card { padding: 24px; border-radius: 20px; }
  .card-middle-section h3 { font-size: 28px; }
  .card-actions-dock { flex-direction: column; }
  .dock-btn { width: 100%; justify-content: center; }
}
</style>
