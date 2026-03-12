<script setup lang="ts">
import { computed } from 'vue'
import {
  User,
  ShieldCheck,
  Award,
  Star,
  ChevronRight,
  ArrowLeft,
  Camera,
  CreditCard,
  Settings,
  Heart,
  MessageSquare,
  Shield,
  LogOut,
  MapPin,
  Download,
  Receipt,
  Mail,
  Phone,
  Briefcase
} from 'lucide-vue-next'

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

const emit = defineEmits(['back', 'navigate', 'logout'])

// Completion logic
const completion = computed(() => props.profileCompletion || 75)

// Standard color mapping for tiers
const tiers = {
  'JOB READY': { color: '#0056b3', text: 'Job Ready Transporter', bg: '#0056b3' },
  'VERIFIED': { color: '#28a745', text: 'Verified Transporter', bg: '#28a745' },
  'TRUSTED': { color: '#ffc107', text: 'Trusted Transporter', bg: '#ffc107' },
  'TRANSPORTER PRO': { color: '#6f42c1', text: 'Transporter Pro', bg: '#6f42c1' }
}

const userTier = computed(() => {
  const role = props.user?.role?.toLowerCase()
  const amount = props.subscriptionDetails?.amount ? parseFloat(props.subscriptionDetails.amount) : 0
  if (role === 'transporter' && amount >= 499) return 'TRANSPORTER PRO'
  if (amount >= 499) return 'TRUSTED'
  if (amount >= 199) return 'VERIFIED'
  return 'JOB READY'
})

const currentTier = computed(() => tiers[userTier.value as keyof typeof tiers])

const locationStr = computed(() => {
  const city = props.user?.city || ''
  const state = props.user?.state_name || props.user?.state || ''
  return (city && state ? `${city}, ${state}` : (city || state || 'India')).toUpperCase()
})

const formatDate = (ts: number) => {
  if (!ts) return 'N/A'
  return new Date(ts * 1000).toLocaleDateString('en-GB')
}
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

    <div class="classic-content-container">
      <!-- Section 1: Profile Summary -->
      <section class="profile-summary">
        <div class="summary-left">
          <div class="avatar-wrapper">
            <!-- Progress Ring -->
            <div class="progress-ring" :style="{ '--progress': completion + '%' }">
              <div class="avatar-container">
                <img 
                  :src="user.images ? `https://tm-api.truckmitr.com/public/${user.images}` : 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'" 
                  alt="User"
                />
              </div>
            </div>
            <!-- Percentage Badge -->
            <div class="completion-badge">
              {{ completion }}%
            </div>
          </div>
          <div class="summary-info">
            <h2>{{ user.name }}</h2>
            <p class="tm-id">ID: {{ user.unique_id }}</p>
            <div class="badge-list">
              <span class="classic-badge" :style="{ borderColor: currentTier.color, color: currentTier.color }">
                {{ currentTier.text }}
              </span>
              <span v-if="star_rating" class="classic-badge rating">
                <Star :size="12" fill="currentColor" /> {{ star_rating }}.0
              </span>
            </div>
          </div>
        </div>
        <div class="summary-right">
          <button class="classic-edit-btn" @click="emit('navigate', 'profile-edit')">Edit Profile</button>
        </div>
      </section>

      <!-- Section 2: Membership Card -->
      <div class="section-divider">Membership Identification</div>
      <section class="membership-section">
        <div class="id-card-classic" :style="{ backgroundColor: currentTier.bg }">
          <div class="card-header">
            <img src="https://truckmitr.com/wp-content/uploads/2023/04/logotrick.png" class="tm-logo" alt="TruckMitrLogo" />
            <span class="membership-type">{{ currentTier.text.toUpperCase() }}</span>
          </div>
          
          <div class="card-middle">
            <div class="id-group">
              <span class="id-label">OFFICIAL TM ID</span>
              <span class="id-val">{{ user.unique_id }}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="footer-left">
              <div class="card-user-name">{{ user.name.toUpperCase() }}</div>
              <div class="card-location"><MapPin :size="12" /> {{ locationStr }}</div>
            </div>
            <div class="footer-right">
              <div class="valid-box">
                <span class="v-label">VALID UNTIL</span>
                <span class="v-val">{{ subscriptionDetails?.end_at ? formatDate(subscriptionDetails.end_at) : '31/12/2025' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-controls">
          <button class="control-btn" @click="emit('navigate', 'download-invoice')">
            <Receipt :size="18" /> Download Invoice
          </button>
          <button class="control-btn" @click="emit('navigate', 'download-card')">
            <Download :size="18" /> Save ID Card
          </button>
        </div>
      </section>

      <div class="section-divider">General</div>
      <section class="menu-list">
        <div class="menu-item" @click="emit('navigate', 'contact-us')">
          <div class="menu-icon" style="color: #0ea5e9; background-color: #0ea5e915;"><MessageSquare :size="20" /></div>
          <div class="menu-text">Contact Us</div>
          <ChevronRight :size="18" class="chevron" />
        </div>
        <div class="menu-item" @click="emit('navigate', 'privacy')">
          <div class="menu-icon" style="color: #8b5cf6; background-color: #8b5cf615;"><Shield :size="20" /></div>
          <div class="menu-text">Privacy Policy</div>
          <ChevronRight :size="18" class="chevron" />
        </div>
        <div class="menu-item" @click="emit('navigate', 'rating')">
          <div class="menu-icon" style="color: #ec4899; background-color: #ec489915;"><Star :size="20" /></div>
          <div class="menu-text">Rate Us</div>
          <ChevronRight :size="18" class="chevron" />
        </div>
        <div class="menu-item" @click="emit('navigate', 'settings')">
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
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tm-logo {
  height: 28px;
  filter: brightness(0) invert(1);
}

.membership-type {
  font-size: 12px;
  font-weight: 800;
  opacity: 0.9;
  letter-spacing: 1px;
}

.id-group {
  display: flex;
  flex-direction: column;
}

.id-label {
  font-size: 10px;
  opacity: 0.8;
  letter-spacing: 1px;
  font-weight: 600;
}

.id-val {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 2px;
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
}

.card-location {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
  font-weight: 500;
  margin-top: 4px;
}

.valid-box {
  background: rgba(0,0,0,0.15);
  padding: 8px 16px;
  border-radius: 12px;
  text-align: right;
  border: 1px solid rgba(255,255,255,0.1);
}

.v-label {
  display: block;
  font-size: 9px;
  opacity: 0.7;
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
