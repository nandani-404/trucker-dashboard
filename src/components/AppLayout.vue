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
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Briefcase,
  FileCheck,
  Video,
} from 'lucide-vue-next'
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

const circumference = 138
const progressOffset = computed(() => circumference - (profileCompletion.value / 100) * circumference)

const navItems = computed(() => {
  const dka = { id: 'driver-ki-awaz', label: 'Driver Ki Awaz', icon: Video }
  if (isDriver.value) {
    return [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      dka,
      { id: 'view-jobs', label: 'Available Jobs', icon: Briefcase },
      { id: 'view-applications', label: 'Applied Jobs', icon: FileCheck },
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
      <header class="top-header">
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
          <button
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

          <a
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
            <svg class="progress-ring" width="60" height="60" viewBox="0 0 50 50">
              <circle class="ring-bg" cx="25" cy="25" r="22" />
              <circle
                class="ring-progress"
                cx="25" cy="25" r="22"
                :style="{ strokeDashoffset: progressOffset + 'px' }"
              />
            </svg>
            <div class="avatar-inner">
              <img v-if="profileImageUrl" :src="profileImageUrl" alt="Profile" class="avatar-img" />
              <User v-else :size="24" color="#ff6b00" />
            </div>
            <div class="avatar-badge-pill">
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
  overflow: hidden;
}

/* ─── Fixed Top Header ─── */
.top-header {
  min-height: 72px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 15;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
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
  width: 60px;
  height: 60px;
  cursor: pointer;
  margin-left: 4px;
}

.progress-ring {
  position: absolute;
  top: 0; left: 0;
  transform: rotate(180deg);
}

.ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 3;
}

.ring-progress {
  fill: none;
  stroke: #ff6b00; /* Vibrant Orange */
  stroke-width: 3.5;
  stroke-dasharray: 138;
  stroke-dashoffset: 138;
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
  width: 44px; height: 44px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.avatar-badge-pill {
  position: absolute;
  bottom: 0px;
  right: -2px;
  background: #ff6b00;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 8px;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 5;
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
  .avatar-badge-pill { font-size: 9px; padding: 1px 4px; }
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
  .avatar-badge-pill { font-size: 8px; padding: 1px 3px; }
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
}
</style>
