<script setup lang="ts">
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { getUser, apiPost, END_POINTS } from './services/config/api'
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'
import { useAppStore } from './stores/app'
import SubscriptionModal from './components/SubscriptionModal.vue'
import Login from './views/auth/login/Login.vue'
import ModuleSelection from './views/auth/moduleSelection/index.vue'
import Signup from './views/auth/signup/signup.vue'
import ProfileCompletion from './views/auth/profile_completion/index.vue'
import Welcome from './views/main/home/Home.vue'
import Dashboard from './views/main/dashboard/Dashboard.vue'
import AddJob from './views/main/add-job/AddJob.vue'
import JobSummary from './views/main/job-summary/JobSummary.vue'
import ViewJobs from './views/main/added-jobs/ViewJobs.vue'
import ViewApplications from './views/main/transporter-applied-jobs/ViewApplications.vue'
import AddDriver from './views/main/add-driver/AddDriver.vue'
import DriverList from './views/main/driver-list/DriverList.vue'
import AppLayout from './components/AppLayout.vue'

const STORAGE_KEY = 'truckmitr_user'

const authStore = useAuthStore()
const userStore = useUserStore()
const appStore = useAppStore()

const isLoggedIn = computed(() => userStore.isAuthenticated)
const currentUser = computed(() => userStore.user)
const showSubscriptionModal = computed({
  get: () => appStore.showSubscriptionModal,
  set: (v) => appStore.setShowSubscriptionModal(v),
})

// ── History API: push a state entry when navigating to a non-home view
const navigateTo = (view: string) => {
  if (view !== appStore.currentView) {
    appStore.navigateTo(view)
    const roleNamespace = userStore.user?.role
      ? `/${String(userStore.user.role).toLowerCase().replace(/\s+/g, '-')}`
      : ''
    if (view !== 'home') {
      history.pushState({ view }, '', `${roleNamespace}/${view}`)
    } else {
      history.pushState({ view: 'home' }, '', roleNamespace || '/')
    }
  }
}

const handlePopState = (event: PopStateEvent) => {
  let view = event.state?.view
  if (!view) {
    const pathPart = window.location.pathname.replace(/^\/|\/$/g, '')
    if (pathPart && pathPart !== 'login') {
      const parts = pathPart.split('/')
      view = parts.length > 1 ? parts.slice(1).join('/') : 'home'
    } else {
      view = 'home'
    }
  }
  appStore.setCurrentView(view)
}

onMounted(() => {
  authStore.hydrateFromStorage()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const token = authStore.token
    if (token && saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.mobile) {
        userStore.setUser(parsed)
        authStore.setAuthenticated(true)
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }

  let initialView = 'home'
  const path = window.location.pathname.replace(/^\/|\/$/g, '')
  if (path && path !== 'login' && path !== 'index.html') {
    const parts = path.split('/')
    initialView = parts.length > 1 ? parts.slice(1).join('/') : 'home'
  }

  history.replaceState({ view: initialView }, '', window.location.href)
  window.addEventListener('popstate', handlePopState)

  if (isLoggedIn.value) {
    appStore.setCurrentView(initialView)
    userStore.fetchSubscription()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
})

const fetchSubscription = () => userStore.fetchSubscription()

const handleLoginSuccess = (user: any) => {
  const userData = {
    name: user.name || user.name_eng || 'User',
    mobile: user.mobile,
    role: user.role || 'User',
    ...user,
  }
  authStore.hydrateFromStorage()
  userStore.setUser(userData)
  authStore.setAuthenticated(true)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  } catch { /* storage full */ }
  userStore.fetchSubscription()
  navigateTo('home')
}

const handleLogout = async () => {
  try {
    await apiPost(END_POINTS.LOGOUT)
  } catch { /* continue */ }
  userStore.reset()
  authStore.logout()
  appStore.resetOnLogout()
  localStorage.removeItem(STORAGE_KEY)
  history.replaceState({}, '', '/')
}

const shouldShowSubscriptionModal = (view: string): boolean => {
  const r = (userStore.user?.role || '').toLowerCase()
  if (r !== 'transporter') return false
  if (!userStore.showSubscriptionModel) return false
  if (view === 'add-job' || view === 'view-jobs') return true
  if (view === 'view-applications') return !userStore.hasPremium
  return false
}

const handleNavigate = (view: string) => {
  if (shouldShowSubscriptionModal(view)) {
    appStore.setShowSubscriptionModal(true)
    return
  }
  navigateTo(view)
}

const handleNavigateSignup = () => {
  appStore.setAuthScreen('module-selection')
}

const handleModuleBack = () => {
  appStore.setAuthScreen('login')
}

const handleModuleContinue = (roleId: string) => {
  appStore.setSignupPreSelectedRole(roleId)
  appStore.setAuthScreen('signup')
}

const handleSignupBack = () => {
  appStore.setAuthScreen('module-selection')
}

const handleSignupComplete = () => {
  const userData = getUser() as Record<string, unknown> | null
  if (userData && userData.mobile) {
    const u = {
      name: (userData.name as string) || 'User',
      mobile: userData.mobile as string,
      role: (userData.role as string) || 'User',
      ...userData,
    }
    userStore.setUser(u)
    authStore.setAuthenticated(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    appStore.setAuthScreen('login')
    appStore.setShowProfileCompletion(true)
  } else {
    appStore.setAuthScreen('login')
  }
}

const handleProfileComplete = () => {
  appStore.setShowProfileCompletion(false)
  navigateTo('home')
}

const handleSubscriptionRequired = () => {
  appStore.setShowSubscriptionModal(true)
  navigateTo('home')
}

const handleBack = () => {
  if (appStore.viewHistory.length > 1) {
    const prev = appStore.viewHistory[appStore.viewHistory.length - 2] as string
    appStore.goBack(prev)
    const roleNamespace = userStore.user?.role
      ? `/${String(userStore.user.role).toLowerCase().replace(/\s+/g, '-')}`
      : ''
    if (prev !== 'home') {
      history.pushState({ view: prev }, '', `${roleNamespace}/${prev}`)
    } else {
      history.pushState({ view: 'home' }, '', roleNamespace || '/')
    }
  } else {
    navigateTo('home')
  }
}
</script>

<template>
  <div id="app">
    <Login
      v-if="!isLoggedIn && appStore.authScreen === 'login'"
      :show-back-button="false"
      @login-success="handleLoginSuccess"
      @navigate-signup="handleNavigateSignup"
    />
    <ModuleSelection
      v-else-if="!isLoggedIn && appStore.authScreen === 'module-selection'"
      @back="handleModuleBack"
      @role-selected="handleModuleContinue"
    />
    <Signup
      v-else-if="!isLoggedIn && appStore.authScreen === 'signup'"
      :pre-selected-role="appStore.signupPreSelectedRole"
      @back="handleSignupBack"
      @signup-complete="handleSignupComplete"
    />

    <ProfileCompletion
      v-if="isLoggedIn && appStore.showProfileCompletion && currentUser"
      :user="currentUser"
      @complete="handleProfileComplete"
    />
    <AppLayout
      v-else-if="isLoggedIn && currentUser && !appStore.showProfileCompletion"
      :user="currentUser"
      :current-view="appStore.currentView"
      @logout="handleLogout"
      @navigate="handleNavigate"
    >
      <Welcome
        v-if="appStore.currentView === 'home'"
        :user="currentUser"
        @navigate="handleNavigate"
      />

      <Dashboard
        v-else-if="appStore.currentView === 'dashboard'"
        :user="currentUser"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <AddJob
        v-else-if="appStore.currentView === 'add-job'"
        :user="currentUser"
        @back="handleBack"
        @navigate="handleNavigate"
        @subscription-required="handleSubscriptionRequired"
      />

      <JobSummary
        v-else-if="appStore.currentView === 'job-summary'"
        :user="currentUser"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <ViewJobs
        v-else-if="appStore.currentView === 'view-jobs'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <ViewApplications
        v-else-if="appStore.currentView === 'view-applications'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <AddDriver
        v-else-if="appStore.currentView === 'add-driver'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <DriverList
        v-else-if="appStore.currentView === 'driver-list'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <div v-else class="coming-soon-page">
        <div class="coming-soon-inner">
          <span class="coming-soon-emoji">🚧</span>
          <h2>Coming Soon</h2>
          <p>This section is under construction.</p>
        </div>
      </div>
    </AppLayout>

    <SubscriptionModal
      :visible="showSubscriptionModal"
      :user="currentUser"
      @close="appStore.setShowSubscriptionModal(false)"
      @success="appStore.setShowSubscriptionModal(false); fetchSubscription()"
    />
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

.auth-placeholder {
  min-height: 100vh;
  padding: 20px;
  font-family: system-ui, sans-serif;
}

.auth-placeholder .back-btn {
  background: none;
  border: none;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  padding: 6px 0;
}

.auth-placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.auth-placeholder-inner h2 {
  font-size: 22px;
  margin-bottom: 8px;
}

.auth-placeholder-inner p {
  color: #666;
  font-size: 14px;
}
</style>
