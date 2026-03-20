<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import {
  Home,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  User,
  HelpCircle,
  Search,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Video,
  Plus,
  Bell,
  Truck,
  Wallet,
} from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { BASE_URL } from '../services/config/api'
import { getProfileFull, getSubscriptionDetails } from '../services/profile/profileApi'
import logoImg from '../assets/logo/logotrick.png'

const props = defineProps<{
  user: {
    name: string;
    mobile: string;
    role: string;
    tm_id?: string;
    unique_id?: string;
    [key: string]: any;
  };
  currentView: string;
}>()

const emit = defineEmits(['logout', 'navigate'])

const mainContent = ref<HTMLElement | null>(null)
const profileData = ref<Record<string, unknown> | null>(null)
const subscriptionData = ref<Record<string, unknown> | null>(null)
const sidebarVisible = ref(true)

const displayName = computed(() =>
  (profileData.value?.name as string) || (profileData.value?.name_eng as string) || props.user?.name || 'User'
)

const displayTmId = computed(() =>
  (profileData.value?.unique_id as string) || props.user?.unique_id || props.user?.tm_id || '—'
)

const profileCompletion = computed(() => {
  const p =
    profileData.value?.profile_completion ??
    profileData.value?.profile_completion_percentage ??
    profileData.value?.profile_required_fields_status ??
    (props.user as Record<string, unknown>)?.profile_completion ??
    (props.user as Record<string, unknown>)?.profile_completion_percentage
  if (typeof p === 'number') return Math.round(p)
  if (typeof p === 'string') {
    const n = parseInt(p, 10)
    if (!Number.isNaN(n)) return Math.min(100, Math.max(0, n))
  }
  if (p === true) return 100
  if (p && typeof p === 'object' && 'completed' in p && 'total' in p) {
    const completed = Number((p as { completed?: number }).completed) || 0
    const total = Number((p as { total?: number }).total) || 1
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }
  return 0
})

const profileImageUrl = computed(() => {
  const img = profileData.value?.images ?? props.user?.images
  if (!img) return ''
  const path = String(img).startsWith('http') ? img : `${BASE_URL}public/${img}`
  return path
})

const displayRole = computed(() => {
  const r = (props.user?.role || '').toLowerCase()
  if (isTruckerMode.value) return 'Trucker'
  const sub = subscriptionData.value
  if (r === 'shipper') return 'Transporter'
  if (r === 'transporter') {
    const amount = sub?.amount ? parseFloat(String(sub.amount)) : 0
    const captured = sub?.payment_status === 'captured'
    const hasEndAt = sub?.end_at && new Date((sub.end_at as number) * 1000) > new Date()
    if (captured && hasEndAt && [99, 99.0, 100, 1, 1.0].includes(amount)) return 'Legacy Transporter'
    if (captured && hasEndAt && (amount === 499 || amount === 499.0)) return 'Transporter Pro'
    return 'Transporter'
  }
  return (props.user?.role || 'User') as string
})

const isDriver = computed(() =>
  ['driver', 'foreman', 'association'].includes(String(props.user?.role || '').toLowerCase())
)

const progressOffset = computed(() => circumference - (profileCompletion.value / 100) * circumference)
const circumference = 144.5 // 2 * pi * 23 approx 144.5

const navItems = computed(() => {
  const dka = { id: 'driver-ki-awaz', label: 'Driver Ki Awaz', icon: Video }
  if (isTruckerMode.value) {
    return [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'view-jobs', label: 'Find Loads', icon: Search },
      { id: 'add-truck', label: 'Add Truck', icon: PlusCircle },
      { id: 'earnings', label: 'Earnings', icon: Wallet },
      { id: 'profile', label: 'Profile', icon: User },
    ]
  }
  return [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    dka,
    { id: 'add-job', label: 'Add Job', icon: PlusCircle },
    { id: 'view-jobs', label: 'View Job List', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
  ]
})

const userStore = useUserStore()
const isTruckerMode = computed(() => isDriver.value)

const isSwitching = ref(false)

const toggleMode = () => {
  if (isSwitching.value) return
  isSwitching.value = true
  
  // Localized transition timing
  setTimeout(() => {
    userStore.switchRole()
    emit('navigate', 'home')
  }, 450)
  
  setTimeout(() => {
    isSwitching.value = false
  }, 900)
}

watch(() => props.currentView, () => {
  if (mainContent.value) mainContent.value.scrollTop = 0
})

const fetchProfile = async () => {
  try {
    const [full, subscription] = await Promise.all([
      getProfileFull(),
      getSubscriptionDetails(),
    ])
    if (full?.user) {
      profileData.value = {
        ...(full.user as Record<string, unknown>),
        profile_completion: full.profile_completion,
        profile_completion_percentage: full.profile_completion,
      }
    }
    subscriptionData.value = subscription as Record<string, unknown>
  } catch {
    // Use props.user as fallback
  }
}

onMounted(fetchProfile)
</script>

<template>
  <div class="app-shell">
    <!-- ========== FIXED SIDEBAR ========== -->
    <aside class="sidebar" :class="{ collapsed: !sidebarVisible }">
      <div class="sidebar-header">
        <div class="logo">
          <img :src="logoImg" alt="TruckMitr" class="logo-img" />
        </div>
        <button
          type="button"
          class="sidebar-toggle"
          :title="sidebarVisible ? 'Hide sidebar' : 'Show sidebar'"
          @click="sidebarVisible = !sidebarVisible"
        >
          <PanelLeftClose v-if="sidebarVisible" :size="18" />
          <PanelLeft v-else :size="18" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: currentView === item.id }"
          @click="emit('navigate', item.id)"
        >
          <component :is="item.icon" class="nav-icon" :size="20" />
          <span class="nav-label">{{ item.label }}</span>
          <ChevronRight
            v-if="currentView === item.id"
            class="nav-arrow"
            :size="14"
          />
        </button>

        <!-- Premium Switch Mode Section -->
        <div class="sidebar-mode-switcher" v-if="sidebarVisible">
          <div class="mode-switcher-header">
            <span class="mode-label">Switch Mode</span>
          </div>
          <div class="mode-toggle-card" :class="{ 'trucker-active': isTruckerMode, 'card-switching': isSwitching }" @click="toggleMode">
            <div class="mode-indicator" :class="{ 'pulse-active': isSwitching }">
              <span class="mode-dot"></span>
            </div>
            <div class="mode-texts">
              <Transition name="mode-text-slide" mode="out-in">
                <div :key="isTruckerMode + String(isSwitching)" class="texts-container">
                  <span class="mode-title">{{ isSwitching ? 'Changing...' : (isTruckerMode ? 'Trucker Mode' : 'Transporter Mode') }}</span>
                  <span class="mode-desc">{{ isSwitching ? 'Syncing profiles' : (isTruckerMode ? 'Switch to Transporter' : 'Switch to Trucker') }}</span>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="emit('logout')">
          <LogOut class="logout-icon" :size="20" />
          <span>Logout</span>
        </button>
        <div class="help-card">
          <HelpCircle class="help-icon" :size="24" />
          <h4>Need Help?</h4>
          <p>Contact Support</p>
        </div>
      </div>
    </aside>

    <!-- ========== RIGHT PANEL ========== -->
    <div class="right-panel">
      <!-- FIXED TOP HEADER -->
      <header class="top-header" v-if="!currentView.startsWith('live-tracking') && !currentView.startsWith('map-navigation')">
        <button
          v-if="!sidebarVisible"
          type="button"
          class="sidebar-toggle-floating"
          title="Show sidebar"
          @click="sidebarVisible = true"
        >
          <PanelLeft :size="20" />
        </button>
        <!-- Greeting -->
        <div class="greeting-box">
          <h1 class="greeting">
            Hi, {{ displayName }}
            <span class="wave">👋</span>
          </h1>
          <div class="user-meta">
            <span class="user-id">{{ displayTmId }}</span>
            <span class="dot-separator">•</span>
            <span class="user-role">{{ displayRole }}</span>
          </div>
        </div>

        <!-- Search -->
        <div class="search-container">
          <div class="search-bar">
            <Search class="search-icon" :size="18" />
            <input type="text" :placeholder="isDriver ? 'Search Jobs...' : 'Search Drivers (Name, ID, Phone)...'" />
          </div>
        </div>

        <!-- Right Actions -->
        <div class="header-actions">
          <!-- Add Truck (Trucker Mode) -->
          <button
            v-if="isTruckerMode"
            class="add-truck-btn"
            @click="emit('navigate', 'add-truck')"
          >
            <Truck :size="18" class="add-truck-icon" />
            <span class="add-truck-text">Add Truck</span>
          </button>

          <!-- Post Job CTA (transporters only) -->
          <button
            v-if="!isTruckerMode"
            class="post-job-btn"
            :class="{ 'btn-active': currentView === 'add-job' }"
            title="Post a New Job"
            aria-label="Post Job"
            @click="emit('navigate', 'add-job')"
          >
            <span class="post-job-pulse"></span>
            <Plus :size="18" class="post-job-icon" />
            <span class="post-job-text">Post Job</span>
          </button>


          <button
            v-if="!isTruckerMode"
            class="action-btn dashboard-btn"
            :class="{ 'btn-active': currentView === 'dashboard' }"
            title="Dashboard"
            aria-label="Dashboard"
            @click="emit('navigate', 'dashboard')"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/610/610106.png"
              class="btn-img-icon"
              alt=""
            />
            <span class="action-btn-text">Dashboard</span>
          </button>

          <!-- Notification Icon (Trucker Only) -->
          <button v-if="isTruckerMode" class="icon-action-btn" title="Notifications" @click="emit('navigate', 'notification')">
            <Bell :size="20" />
            <span class="notification-badge"></span>
          </button>

          <!-- WhatsApp (Transporter Only) -->
          <a
            v-if="!isTruckerMode"
            href="https://wa.me/919254972811"
            target="_blank"
            rel="noopener noreferrer"
            class="action-btn whatsapp-btn"
            title="Join WhatsApp"
            aria-label="Join WhatsApp"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png"
              class="btn-img-icon"
              style="filter: none;"
              alt=""
            />
            <span class="action-btn-text">Join WhatsApp</span>
          </a>

          <!-- Profile Ring -->
          <div
            class="profile-avatar-container"
            @click="emit('navigate', 'profile')"
            title="View Profile"
          >
            <svg class="progress-ring" width="68" height="68" viewBox="0 0 50 50">
              <circle class="ring-bg" cx="25" cy="25" r="23" />
              <circle
                class="ring-progress"
                cx="25" cy="25" r="23"
                :style="{ strokeDashoffset: progressOffset + 'px' }"
                :class="{ 'trucker-ring': isTruckerMode }"
              />
            </svg>
            <div class="avatar-inner">
              <img v-if="profileImageUrl" :src="profileImageUrl" alt="Profile" class="avatar-img" />
              <User v-else :size="24" :color="isTruckerMode ? '#ea580c' : '#ff6b00'" />
            </div>
            <div class="avatar-badge-pill" :class="{ 'trucker-badge': isTruckerMode }">
              {{ profileCompletion }}%
            </div>
          </div>
        </div>
      </header>

      <!-- SCROLLABLE CONTENT AREA (slot) -->
      <main class="content-area" ref="mainContent">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

/* ─── Shell ─── */
.app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  overflow: hidden;
  background: #ffffff;
}

/* ─── Sidebar ─── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 20;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
}

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 24px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
  min-width: 260px;
}

.sidebar.collapsed .sidebar-header {
  min-width: 0;
  padding: 0 12px;
}

.sidebar-toggle {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: #f1f5f9;
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  background: #e2e8f0;
  color: #1e40af;
}

.sidebar-toggle-floating {
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 12px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle-floating:hover {
  background: #f8fafc;
  color: #1e40af;
  border-color: #cbd5e1;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.logo-img {
  height: 44px;
  width: auto;
  object-fit: contain;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 11px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  position: relative;
}

.nav-item:hover {
  background: #f8fafc;
  color: #1e40af;
}

.nav-item.active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

.nav-arrow {
  margin-left: auto;
  opacity: 0.6;
}

.nav-icon { stroke-width: 2px; }

.sidebar-footer {
  padding: 20px;
  flex-shrink: 0;
  border-top: 1px solid #f1f5f9;
}

/* ─── Mode Switcher ─── */
.sidebar-mode-switcher {
  margin-top: 24px;
  padding: 0 4px;
}

.mode-switcher-header {
  margin-bottom: 12px;
  padding-left: 10px;
}

.mode-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  font-weight: 700;
}

.mode-toggle-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mode-toggle-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.mode-indicator {
  width: 44px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 12px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.mode-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.mode-toggle-card.trucker-active {
  background: #fff7ed;
  border-color: #ffedd5;
  box-shadow: 0 4px 15px rgba(251, 146, 60, 0.1);
}

.trucker-active .mode-indicator {
  background: #f97316;
}

.trucker-active .mode-dot {
  transform: translateX(20px);
  box-shadow: 0 1px 5px rgba(249, 115, 22, 0.3);
}

.mode-texts {
  display: flex;
  flex-direction: column;
}

.mode-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.mode-desc {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

.trucker-active .mode-title {
  color: #c2410c;
}

.trucker-active .mode-desc {
  color: #ea580c;
}

.add-truck-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.add-truck-btn:hover {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%);
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(234, 88, 12, 0.5);
}

.add-truck-btn:active {
  transform: scale(0.97);
}

.add-truck-icon {
  flex-shrink: 0;
  stroke-width: 2.5px;
}

.add-truck-text {
  white-space: nowrap;
  letter-spacing: 0.3px;
}

@media (max-width: 768px) {
  .add-truck-btn .add-truck-text { display: none; }
  .add-truck-btn { padding: 10px 12px; border-radius: 14px; }
}



.icon-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.icon-action-btn:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
}

.trucker-ring {
  stroke: #ea580c !important;
}



.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.logout-icon {
  flex-shrink: 0;
}

.help-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.help-icon { color: #1e40af; margin-bottom: 8px; }
.help-card h4 { margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #0f172a; }
.help-card p  { margin: 0; font-size: 12px; color: #64748b; }

/* ─── Right Panel ─── */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #ffffff;
}

.content-area {
  flex: 1;
  padding: 0;
  background: #ffffff;
}

.top-header {
  min-height: 72px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
  position: relative;
  z-index: 15;
  flex-wrap: wrap;
  gap: 12px;
}

.greeting-box { display: flex; flex-direction: column; }

.greeting {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
}
@keyframes wave {
  0%   { transform: rotate(0deg);   }
  25%  { transform: rotate(-20deg); }
  50%  { transform: rotate(0deg);   }
  75%  { transform: rotate(20deg);  }
  100% { transform: rotate(0deg);   }
}

.wave {
  display: inline-block;
  animation: wave 1.5s infinite;
  transform-origin: 70% 70%;
}

.user-meta {
  font-size: 12px;
  color: #64748b;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 7px;
}

.user-id {
  font-family: monospace;
  color: #1e40af;
  background: #eff6ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.dot-separator { color: #cbd5e1; }

/* Search */
.search-container {
  flex: 1;
  max-width: 400px;
  margin: 0 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 24px;
  padding: 8px 16px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.search-bar:focus-within {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}

.search-icon { color: #64748b; margin-right: 10px; }

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #0f172a;
}

.search-bar input::placeholder { color: #94a3b8; }

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
}

.action-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

.dashboard-btn {
  color: #ffffff;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1e3a8a);
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}

.dashboard-btn:hover,
.dashboard-btn.btn-active {
  background: linear-gradient(135deg, #1d4ed8, #172554);
  box-shadow: 0 6px 16px rgba(37,99,235,0.4);
}

.whatsapp-btn {
  color: #ffffff;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 4px 12px rgba(34,197,94,0.3);
}

.whatsapp-btn:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 6px 16px rgba(34,197,94,0.4);
}

.btn-img-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.whatsapp-img { filter: none; }

/* Profile ring */
.profile-avatar-container {
  position: relative;
  width: 68px;
  height: 68px;
  cursor: pointer;
  margin-left: 4px;
}

.progress-ring {
  position: absolute;
  top: 0; left: 0;
  width: 68px;
  height: 68px;
  transform: rotate(180deg);
}

.ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 2.2;
}

.ring-progress {
  fill: none;
  stroke: #ff6b00; /* Vibrant Orange */
  stroke-width: 2.8;
  stroke-dasharray: 144.5;
  stroke-dashoffset: 144.5;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s cubic-bezier(0.1, 0.7, 0.1, 1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-inner {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 54px; height: 54px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.avatar-badge-pill {
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  color: #10b981;
  font-size: 8px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 5;
  white-space: nowrap;
}

/* ─── Scrollable content area ─── */
.content-area {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.content-area::-webkit-scrollbar { width: 6px; }
.content-area::-webkit-scrollbar-track { background: transparent; }
.content-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

/* ─── Mobile responsive top header ─── */
@media (max-width: 1024px) {
  .top-header {
    padding: 12px 20px;
    gap: 10px;
  }
  .search-container {
    order: 3;
    flex: 1 1 100%;
    max-width: none;
    margin: 0;
  }
  .greeting { font-size: 15px; }
  .user-meta { font-size: 11px; gap: 5px; }
  .user-id { font-size: 10px; padding: 2px 5px; }
  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  .action-btn .btn-img-icon { width: 14px; height: 14px; }
  .profile-avatar-container {
    width: 48px;
    height: 48px;
  }
  .profile-avatar-container .progress-ring { width: 48px; height: 48px; }
  .avatar-inner { width: 36px; height: 36px; }
  .avatar-badge-pill { font-size: 8px; padding: 1px 4px; bottom: 0px; }
}

@media (max-width: 768px) {
  .top-header {
    padding: 10px 16px;
    min-height: auto;
  }
  .greeting-box {
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }
  .greeting {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .user-meta {
    flex-wrap: wrap;
    gap: 4px;
  }
  .user-id {
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .search-container {
    order: 3;
    flex: 1 1 100%;
  }
  .search-bar input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
  .header-actions {
    gap: 8px;
    flex-shrink: 0;
  }
  .action-btn .action-btn-text { display: none; }
  .action-btn {
    padding: 8px 10px;
  }
  .action-btn .btn-img-icon {
    width: 18px;
    height: 18px;
    margin: 0;
  }
  .profile-avatar-container {
    width: 44px;
    height: 44px;
    margin-left: 0;
  }
  .profile-avatar-container .progress-ring { width: 44px; height: 44px; }
  .avatar-inner { width: 32px; height: 32px; }
  .avatar-badge-pill { font-size: 7px; padding: 1px 3px; bottom: 0px; }
}

@media (max-width: 480px) {
  .top-header {
    padding: 8px 12px;
  }
  .greeting { font-size: 13px; }
  .dot-separator,
  .user-role { display: none; }
  .user-id { max-width: 70px; }
  .search-bar { padding: 6px 12px; }
  .sidebar-toggle-floating {
    width: 36px;
    height: 36px;
    margin-right: 8px;
  }
  .post-job-btn .post-job-text { display: none; }
  .post-job-btn { padding: 10px; border-radius: 12px; }
}

/* ─── Post Job CTA ─── */
.post-job-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border: none;
  border-radius: 24px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
  overflow: hidden;
  z-index: 1;
  animation: postJobAttention 3s ease-in-out infinite;
}

@keyframes postJobAttention {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4); }
  50% { transform: scale(1.03); box-shadow: 0 6px 25px rgba(249, 115, 22, 0.55); }
}

.post-job-btn:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #b91c1c 100%);
  transform: scale(1.05) !important;
  box-shadow: 0 8px 30px rgba(234, 88, 12, 0.5) !important;
}

.post-job-btn:active {
  transform: scale(0.97) !important;
}

.post-job-btn.btn-active {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  animation: none;
}

.post-job-pulse {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
  animation: pulseShine 2.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes pulseShine {
  0%, 100% { opacity: 0; transform: translateX(-100%); }
  50% { opacity: 1; transform: translateX(100%); }
}

.post-job-icon {
  flex-shrink: 0;
  stroke-width: 2.5px;
}

.post-job-text {
  white-space: nowrap;
  letter-spacing: 0.3px;
}

@media (max-width: 768px) {
  .post-job-btn .post-job-text { display: none; }
  .post-job-btn { padding: 10px 12px; border-radius: 14px; }
}
/* ─── Smooth Mode Switch Transition (Blinkit Style) ─── */
.mode-toggle-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
}

.mode-toggle-card:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.mode-toggle-card.card-switching {
  opacity: 0.85;
  transform: scale(0.98);
  pointer-events: none;
}

.mode-indicator {
  width: 44px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 12px;
  position: relative;
  flex-shrink: 0;
  transition: background 0.5s ease;
}

.mode-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.mode-toggle-card.trucker-active {
  background: #fff7ed;
  border-color: #ffedd5;
  box-shadow: 0 4px 15px rgba(251, 146, 60, 0.1);
}

.trucker-active .mode-indicator { background: #f97316; }
.trucker-active .mode-dot { transform: translateX(20px); }

.pulse-active.mode-indicator {
  animation: bgPulse 0.8s infinite alternate;
}

@keyframes bgPulse {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

.mode-texts {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.texts-container {
  display: flex;
  flex-direction: column;
}

.mode-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.mode-desc {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

.trucker-active .mode-title { color: #c2410c; }
.trucker-active .mode-desc { color: #ea580c; }

/* Text Slide Animation */
.mode-text-slide-enter-active,
.mode-text-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.mode-text-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.mode-text-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
