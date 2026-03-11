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
  Briefcase,
  FileCheck,
} from 'lucide-vue-next'
import { apiGet } from '../services/api'
import { END_POINTS, BASE_URL } from '../services/api'
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

const displayName = computed(() =>
  (profileData.value?.name as string) || (profileData.value?.name_eng as string) || props.user?.name || 'User'
)

const displayTmId = computed(() =>
  (profileData.value?.unique_id as string) || props.user?.unique_id || props.user?.tm_id || '—'
)

const profileCompletion = computed(() => {
  const p = profileData.value?.profile_completion ?? profileData.value?.profile_required_fields_status
  if (typeof p === 'number') return p
  if (p === true) return 100
  return 0
})

const profileImageUrl = computed(() => {
  const img = profileData.value?.images ?? props.user?.images
  if (!img) return ''
  const path = String(img).startsWith('http') ? img : `${BASE_URL}public/${img}`
  return path
})

const whatsappLink = computed(() =>
  (profileData.value?.whatsapp_link as string) || (props.user?.whatsapp_link as string) || ''
)

const isDriver = computed(() =>
  ['driver', 'foreman', 'association'].includes(String(props.user?.role || '').toLowerCase())
)

const circumference = 138
const progressOffset = computed(() => circumference - (profileCompletion.value / 100) * circumference)

const navItems = computed(() => {
  if (isDriver.value) {
    return [
      { id: 'home', label: 'Home', icon: Home },
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'view-jobs', label: 'Available Jobs', icon: Briefcase },
      { id: 'view-applications', label: 'Applied Jobs', icon: FileCheck },
      { id: 'profile', label: 'Profile', icon: User },
    ]
  }
  return [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-job', label: 'Add Job', icon: PlusCircle },
    { id: 'view-jobs', label: 'View Job List', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: User },
  ]
})

watch(() => props.currentView, () => {
  if (mainContent.value) mainContent.value.scrollTop = 0
})

onMounted(async () => {
  try {
    const res = await apiGet<{ status?: boolean; data?: Record<string, unknown> }>(END_POINTS.GET_PROFILE)
    if (res?.status && res?.data) {
      profileData.value = res.data
    }
  } catch {
    // Use props.user as fallback
  }
})
</script>

<template>
  <div class="app-shell">
    <!-- ========== FIXED SIDEBAR ========== -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <img :src="logoImg" alt="TruckMitr" class="logo-img" />
        </div>
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
        <!-- Greeting -->
        <div class="greeting-box">
          <h1 class="greeting">
            Hi, {{ displayName }}
            <span class="wave">👋</span>
          </h1>
          <div class="user-meta">
            <span class="user-id">{{ displayTmId }}</span>
            <span class="user-role">{{ user.role || 'User' }}</span>
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
            @click="emit('navigate', 'dashboard')"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/610/610106.png"
              class="btn-img-icon"
              alt="Dashboard"
            />
            Dashboard
          </button>

          <a
            v-if="whatsappLink"
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            class="action-btn whatsapp-btn"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png"
              class="btn-img-icon whatsapp-img"
              alt="WhatsApp"
            />
            Join WhatsApp
          </a>

          <!-- Profile Ring / Logout -->
          <div
            class="profile-avatar-container"
            @click="emit('logout')"
            title="Click to Logout"
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
              <User v-else :size="28" color="#1e40af" />
              <div class="avatar-badge">{{ profileCompletion }}%</div>
            </div>
            <div class="logout-overlay">
              <LogOut :size="20" color="#ffffff" />
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
}

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
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
  height: 72px;
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
  stroke: #fbbf24;
  stroke-width: 3;
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

.avatar-badge {
  position: absolute;
  bottom: -8px;
  background: #ffffff;
  color: #16a34a;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
}

.logout-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15,23,42,0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.profile-avatar-container:hover .logout-overlay { opacity: 1; }

/* ─── Scrollable content area ─── */
.content-area {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.content-area::-webkit-scrollbar { width: 6px; }
.content-area::-webkit-scrollbar-track { background: transparent; }
.content-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
</style>
