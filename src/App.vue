<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Login from './views/Login.vue'
import Welcome from './views/Welcome.vue'
import Dashboard from './views/Dashboard.vue'
import AddJob from './views/AddJob.vue'
import AppLayout from './components/AppLayout.vue'

const STORAGE_KEY = 'truckmitr_user'

const isLoggedIn = ref(false)
const currentView = ref<string>('home')
const currentUser = ref<any>(null)

// ── History API: push a state entry when navigating to a non-home view
// so the browser ← back button works with real paths
const navigateTo = (view: string) => {
  if (view !== currentView.value) {
    // Get URL-friendly role string (e.g. "transporter", "dhaba-shop")
    const roleNamespace = currentUser.value?.role 
      ? `/${currentUser.value.role.toLowerCase().replace(/\s+/g, '-')}` 
      : ''
      
    if (view !== 'home') {
      history.pushState({ view }, '', `${roleNamespace}/${view}`)
    } else {
      history.pushState({ view: 'home' }, '', roleNamespace || '/')
    }
  }
  currentView.value = view
}

// Browser back/forward button handler
const handlePopState = (event: PopStateEvent) => {
  let view = event.state?.view
  if (!view) {
    const pathPart = window.location.pathname.replace(/^\/|\/$/g, '')
    if (pathPart && pathPart !== 'login') {
      // The first segment is the role (e.g. "transporter"). The rest is the view.
      const parts = pathPart.split('/')
      view = parts.length > 1 ? parts.slice(1).join('/') : 'home'
    } else {
      view = 'home'
    }
  }
  currentView.value = view
}

onMounted(() => {
  // ── Restore session from localStorage (persist login across refresh)
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.mobile) {
        currentUser.value = parsed
        isLoggedIn.value = true
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }

  // Set initial history state based on URL path
  let initialView = 'home'
  const path = window.location.pathname.replace(/^\/|\/$/g, '')
  // If the user lands on a specific valid path directly, keep it. Ignore /login or root.
  if (path && path !== 'login' && path !== 'index.html') {
    const parts = path.split('/')
    // First segment is the role, remaining segments form the view name (e.g. "dashboard")
    initialView = parts.length > 1 ? parts.slice(1).join('/') : 'home'
  }
  
  history.replaceState({ view: initialView }, '', window.location.href)
  window.addEventListener('popstate', handlePopState)

  // Navigate to initial view if already logged in from localStorage
  if (isLoggedIn.value) {
    currentView.value = initialView
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
})

const handleLoginSuccess = (user: any) => {
  const userData = {
    name: user.name || user.name_eng || 'User',
    mobile: user.mobile,
    role: user.role || 'User',
    ...user
  }
  currentUser.value = userData
  isLoggedIn.value = true

  // ── Persist to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  } catch { /* storage full or unavailable */ }

  navigateTo('home')
}

const handleLogout = () => {
  isLoggedIn.value = false
  currentView.value = 'home'
  currentUser.value = null

  // ── Clear persisted session
  localStorage.removeItem(STORAGE_KEY)
  history.replaceState({ view: 'home' }, '', '/')
}

const handleNavigate = (view: string) => {
  navigateTo(view)
}

const handleBack = () => {
  navigateTo('home')
}
</script>

<template>
  <div id="app">
    <!-- Not logged in → Login screen -->
    <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />

    <!-- Logged in → Shared layout shell with content slot -->
    <AppLayout
      v-else
      :user="currentUser"
      :current-view="currentView"
      @logout="handleLogout"
      @navigate="handleNavigate"
    >
      <!-- Home / Welcome content -->
      <Welcome
        v-if="currentView === 'home'"
        :user="currentUser"
        @navigate="handleNavigate"
      />

      <!-- Dashboard content -->
      <Dashboard
        v-else-if="currentView === 'dashboard'"
        :user="currentUser"
        @back="handleBack"
      />

      <!-- Add Job content -->
      <AddJob
        v-else-if="currentView === 'add-job'"
        @back="handleBack"
      />

      <!-- Placeholder for future views -->
      <div v-else class="coming-soon-page">
        <div class="coming-soon-inner">
          <span class="coming-soon-emoji">🚧</span>
          <h2>Coming Soon</h2>
          <p>This section is under construction.</p>
        </div>
      </div>
    </AppLayout>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.coming-soon-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.coming-soon-inner {
  text-align: center;
  color: #64748b;
}

.coming-soon-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.coming-soon-inner h2 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
}

.coming-soon-inner p {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}
</style>