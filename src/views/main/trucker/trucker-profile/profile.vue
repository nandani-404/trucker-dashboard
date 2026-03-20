<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  User, Edit2, Truck, Wallet,
  LogOut, ChevronRight, Building2,
  FileText
} from 'lucide-vue-next'
import { END_POINTS, apiGet, apiPost, clearAuthToken } from '../../../../services/config/api'

const props = defineProps<{
  initialUser?: any
}>()

const emit = defineEmits(['back', 'navigate', 'home', 'edit'])

// --- STATE ---
const user = ref<any>(props.initialUser || null)
const subscriptionDetails = ref<any>(null)
const isLoading = ref(true)
const isDownloading = ref(false)

// --- Helper Functions (From RN Code) ---

const getPaidAmount = () => {
    if (!subscriptionDetails.value) return 0
    if (subscriptionDetails.value.amount) return parseFloat(subscriptionDetails.value.amount)
    if (subscriptionDetails.value.payment_details?.amount) return subscriptionDetails.value.payment_details.amount / 100
    return 0
}

const getOriginalPrice = () => {
    const paidAmount = getPaidAmount()
    if (paidAmount <= 99) return 249
    if (paidAmount <= 199) return 499
    if (paidAmount <= 499) return 999
    return 999
}

const getSavingsPercent = () => {
    const paidAmount = getPaidAmount()
    const originalPrice = getOriginalPrice()
    if (originalPrice <= 0) return 0
    return Math.round(((originalPrice - paidAmount) / originalPrice) * 100)
}

const profileProgress = computed(() => {
    // Basic completion calc
    let count = 0
    const fields = ['name', 'mobile', 'email', 'images', 'address', 'city', 'state']
    fields.forEach(f => { if (user.value?.[f]) count++ })
    return Math.round((count / fields.length) * 100)
})

const userRoleLabel = computed(() => {
    if (!user.value) return 'Member'
    const role = user.value.role?.toLowerCase()
    if (role === 'transporter') return 'Trucker'
    if (role === 'driver') return 'Driver'
    return role?.toUpperCase() || 'MEMBER'
})

// --- API METHODS ---

const fetchProfileData = async () => {
    try {
        isLoading.value = true
        // 1. Get Profile
        const profileRes: any = await apiGet(END_POINTS.GET_PROFILE)
        if (profileRes?.status) {
            user.value = profileRes.data
        }

        // 2. Get Subscription
        const subRes: any = await apiGet(END_POINTS.PAYMENT_SUBSCRIPTION_DETAILS)
        if (subRes?.status && subRes.data) {
            const data = Array.isArray(subRes.data) ? subRes.data[0] : subRes.data
            subscriptionDetails.value = data
        }
    } catch (err) {
        console.error('Error fetching profile data:', err)
    } finally {
        isLoading.value = false
    }
}

const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return
    try {
        await apiPost(END_POINTS.LOGOUT, {})
    } catch (err) {
        console.warn('Logout API error:', err)
    } finally {
        clearAuthToken()
        localStorage.removeItem('truckmitr_user')
        window.location.reload()
    }
}

const handleDownloadInvoice = async () => {
    const paymentId = subscriptionDetails.value?.payment_id || subscriptionDetails.value?.id
    if (!paymentId) {
        alert('Payment ID not found. Direct invoice download unavailable.')
        return
    }

    try {
        isDownloading.value = true
        const res: any = await apiGet(END_POINTS.INVOICE_DOWNLOAD(paymentId))
        if (res?.status && res.invoice_url) {
            window.open(res.invoice_url, '_blank')
        } else {
            alert(res?.message || 'Failed to download invoice')
        }
    } catch (err: any) {
        alert(err.message || 'Error downloading invoice')
    } finally {
        isDownloading.value = false
    }
}

onMounted(fetchProfileData)
</script>

<template>
  <div class="refined-profile-app">
    <!-- Clean Minimal Top Header -->
    <header class="top-util-nav">
      <div class="nav-brand">
         <button class="sq-back-btn" @click="emit('back')">
           <ChevronRight :size="20" class="rotate-180" />
         </button>
         <span>Account & Security</span>
      </div>
      <div class="nav-utils">
         <button class="pill-btn danger" @click="handleLogout">
           <LogOut :size="16" />
           <span>Logout</span>
         </button>
      </div>
      
    </header>

    <main class="split-viewport">
  <div v-if="isLoading" class="loader-cloak single">
    <div class="sk-hero"></div>
    <div class="sk-content full"></div>
  </div>

  <div v-else class="content-flow">
    <!-- HERO PROFILE SECTION (Gradient) -->
    <section class="profile-hero-card">
      <div class="hero-inner">
        <div class="hero-identity">
          <div class="hero-avatar-container" :style="{ '--p': profileProgress + '%' }">
            <div class="hero-avatar-ring">
               <div class="hero-avatar">
                 <img v-if="user?.images" :src="`https://api.truckmitr.com/public/${user.images}`" alt="P" />
                 <User v-else :size="40" class="gray-icon" />
               </div>
            </div>
            <div class="hero-progress-badge">
              {{ profileProgress }}%
            </div>
          </div>
          
          <div class="hero-text">
            <h1 class="h-name">{{ user?.name || 'User Name' }}</h1>
            <div class="h-sub-info">
               <p class="h-id">{{ user?.unique_id || 'ID Pending' }}</p>
               <span class="h-role-tag">{{ userRoleLabel }}</span>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <button class="btn-hero-edit" @click="emit('edit')">
            <Edit2 :size="16" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </section>

    <!-- CENTERED OPERATIONS (Removed Sidebar) -->
    <div class="focused-operations">
       <div class="op-section">
          <div class="section-title-line">
            <Truck :size="18" />
            <span>LOGISTICS & FLEET</span>
          </div>
          
          <div class="op-full-grid">
            <div class="op-large-card" @click="emit('navigate', 'my-vehicles')">
               <div class="op-icon-side purple"><Truck :size="24" /></div>
               <div class="op-content">
                  <h4>Vehicle Management</h4>
                  <p>Register and track fleet status in real-time</p>
               </div>
               <ChevronRight :size="20" class="op-arrow" />
            </div>

            <div class="op-large-card" @click="emit('navigate', 'earnings')">
               <div class="op-icon-side emerald"><Wallet :size="24" /></div>
               <div class="op-content">
                  <h4>Earnings Registry</h4>
                  <p>Comprehensive transaction history and payouts</p>
               </div>
               <ChevronRight :size="20" class="op-arrow" />
            </div>

            <div class="op-large-card" @click="emit('navigate', 'bank-detail')">
               <div class="op-icon-side blue"><Building2 :size="24" /></div>
               <div class="op-content">
                  <h4>Bank & Payouts</h4>
                  <p>Securely manage your settlement accounts</p>
               </div>
               <ChevronRight :size="20" class="op-arrow" />
            </div>

            <!-- NEW MEMBERSHIP / INVOICE ACTION -->
            <div v-if="subscriptionDetails" class="op-large-card highlight" @click="handleDownloadInvoice">
               <div class="op-icon-side amber"><FileText :size="24" /></div>
               <div class="op-content">
                  <h4>Membership Invoice</h4>
                  <p>Paid: ₹{{ getPaidAmount() }} (Saved {{ getSavingsPercent() }}%)</p>
               </div>
               <FileText :size="20" class="op-arrow" />
            </div>
          </div>
       </div>
    </div>
  </div>
</main>
  </div>
</template>

<style scoped>
.refined-profile-app {
  min-height: 100vh;
  background-color: #ffffff;
  color: #1e293b;
  font-family: "Inter", sans-serif;
}

/* Header: Standard & Clean */
.top-util-nav {
  height: 64px;
  padding: 0 40px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
  color: #0f172a;
}

.sq-back-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.sq-back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.rotate-180 { transform: rotate(180deg); }

.nav-utils {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn.secondary {
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
}

.pill-btn.secondary:hover {
  background: #f8fafc;
  color: #0f172a;
}

.pill-btn.primary {
  background: #0f172a;
  color: white;
  border: 1px solid #0f172a;
}

.pill-btn.primary:hover {
  background: #1e293b;
}

.pill-btn.danger {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

.pill-btn.danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Layout */
.split-viewport {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.content-flow {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Hero Section */
.profile-hero-card {
  position: relative;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
  border-radius: 20px;
  padding: 48px;
  color: white;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-identity {
  display: flex;
  align-items: center;
  gap: 32px;
}

.hero-avatar-container {
  position: relative;
  width: 110px;
  height: 110px;
}

.hero-avatar-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  padding: 4px;
  background: conic-gradient(#f59e0b var(--p), rgba(255,255,255,0.1) 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  border: 4px solid #fff;
  overflow: hidden;
}

.hero-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-progress-badge {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #d97706;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  border: 1px solid #ffedd5;
  white-space: nowrap;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.h-name {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: white !important;
}

.h-sub-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.h-id {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: rgba(255,255,255,0.8);
}

.h-role-tag {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-hero-edit {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  color: #0f172a;
  border: none;
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.btn-hero-edit:hover {
  transform: translateY(-2px);
  background: #f8fafc;
}

/* Operations */
.focused-operations {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: 10px;
}

.section-title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #64748b;
}

.section-title-line span {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.op-full-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.op-large-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.op-large-card:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
  transform: translateX(4px);
}

.op-large-card.highlight {
  border-color: #fbbf24;
  background: #fffbeb;
}

.op-icon-side {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.op-icon-side.purple { background: #f5f3ff; color: #8b5cf6; }
.op-icon-side.emerald { background: #ecfdf5; color: #10b981; }
.op-icon-side.blue { background: #eff6ff; color: #2563eb; }
.op-icon-side.amber { background: #fff7ed; color: #f59e0b; }

.op-content { flex: 1; }
.op-content h4 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.op-content p { font-size: 14px; color: #64748b; margin: 0; }

.op-arrow { color: #cbd5e1; transition: transform 0.2s; }
.op-large-card:hover .op-arrow { color: #3b82f6; transform: translateX(4px); }

/* Loader/Skeleton */
.loader-cloak.single {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sk-hero { height: 200px; background: #f1f5f9; border-radius: 20px; }
.sk-content.full { height: 300px; background: #f8fafc; border-radius: 16px; }

@media (max-width: 768px) {
  .hero-inner { flex-direction: column; align-items: flex-start; gap: 32px; }
  .hero-actions { width: 100%; }
  .btn-hero-edit { width: 100%; justify-content: center; }
}
</style>
