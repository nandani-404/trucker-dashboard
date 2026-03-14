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
import Profile from './views/main/profile/Profile.vue'
import ProfileOverview from './views/main/profile-overview/ProfileOverview.vue'
import ProfileEdit from './views/main/profile-edit/ProfileEdit.vue'
import PrivacyPolicy from './views/main/privacy-policy/PrivacyPolicy.vue'
import RateUs from './views/main/rate-us/RateUs.vue'
import AppSettings from './views/main/app-settings/AppSettings.vue'
import ContactUs from './views/main/contact-us/ContactUs.vue'
import DriverInvites from './views/main/driver-invites/DriverInvites.vue'
import DriverKiAwaz from './views/main/driver-ki-awaz/DriverKiAwaz.vue'
import VerifyDriver from './views/main/verify-driver/VerifyDriver.vue'
import VerifyDriverDocuments from './views/main/verify-driver-documents/VerifyDriverDocuments.vue'
import VideoInterview from './views/main/video-interview/VideoInterview.vue'
import RcCheck from './views/main/rc-check/RcCheck.vue'
import RcCheckResult from './views/main/rc-check-result/RcCheckResult.vue'
import ChallanCheck from './views/main/challan-check/ChallanCheck.vue'
import ChallanCheckResult from './views/main/challan-check-result/ChallanCheckResult.vue'
import FuelDiscount from './views/main/fuel-discount/FuelDiscount.vue'
import TmLoadMandal from './views/main/tm-load-mandal/TmLoadMandal.vue'
import TransporterLoan from './views/main/transporter-loan/TransporterLoan.vue'
import TruckInsurance from './views/main/truck-insurance/TruckInsurance.vue'
import TruckMarketplace from './views/main/truck-marketplace/TruckMarketplace.vue'
import AppLayout from './components/AppLayout.vue'

const STORAGE_KEY = 'truckmitr_user'

const authStore = useAuthStore()
const userStore = useUserStore()
const appStore = useAppStore()

// Restore auth synchronously before first render so protected routes never flash
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

const isLoggedIn = computed(() => userStore.isAuthenticated)
const currentUser = computed(() => userStore.user)
const layoutUser = computed(() => ({
  ...(currentUser.value ?? {}),
  name: String(currentUser.value?.name ?? currentUser.value?.name_eng ?? ''),
  mobile: String(currentUser.value?.mobile ?? ''),
  role: String(currentUser.value?.role ?? ''),
}))
const showSubscriptionModal = computed({
  get: () => appStore.showSubscriptionModal,
  set: (v) => appStore.setShowSubscriptionModal(v),
})

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '') || ''

// ── History API: push a state entry when navigating (domain/login/transporter/home, etc.)
function getUrlForView(view: string): string {
  const roleNamespace = userStore.user?.role
    ? `/${String(userStore.user.role).toLowerCase().replace(/\s+/g, '-')}`
    : ''
  const path = view === 'home' ? (roleNamespace ? `${roleNamespace}/home` : '/') : `${roleNamespace}/${view}`
  return BASE_PATH ? `${BASE_PATH}${path}` : path
}

const navigateTo = (view: string, replace = false) => {
  if (view !== appStore.currentView) {
    appStore.navigateTo(view)
  }
  const url = getUrlForView(view)
  if (replace) {
    history.replaceState({ view }, '', url)
  } else {
    history.pushState({ view }, '', url)
  }
}

const isAuthPath = (path: string) => {
  const p = path.replace(/^login\/?/, '') // strip base when app is in /login/
  return !p || p === 'login' || p === 'index.html' || p === 'signup' || p === 'module-selection'
}

const handlePopState = (event: PopStateEvent) => {
  if (!userStore.isAuthenticated) {
    const pathPart = window.location.pathname.replace(/^\/|\/$/g, '')
    if (!isAuthPath(pathPart)) {
      history.replaceState({}, '', BASE_PATH ? `${BASE_PATH}/` : '/login')
      appStore.setAuthScreen('login')
      return
    }
  }
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
  let initialView = 'home'
  let path = window.location.pathname.replace(/^\/|\/$/g, '')
  // Strip base path when app is in /login/
  if (BASE_PATH && path.startsWith(BASE_PATH.replace(/^\//, ''))) {
    path = path.slice(BASE_PATH.length).replace(/^\//, '')
  }

  if (path && path !== 'login' && path !== 'index.html') {
    const parts = path.split('/')
    initialView = parts.length > 1 ? parts.slice(1).join('/') : 'home'
  }

  if (!isLoggedIn.value && !isAuthPath(path)) {
    // Unauthenticated user tried to access protected route - redirect to login
    appStore.setAuthScreen('login')
    window.location.replace(BASE_PATH ? `${BASE_PATH}/` : '/login')
    return
  } else if (isLoggedIn.value) {
    // Logged in: ensure URL is domain/role/home or domain/role/view
    const roleNamespace = userStore.user?.role
      ? `/${String(userStore.user.role).toLowerCase().replace(/\s+/g, '-')}`
      : ''
    const basePath = roleNamespace || ''
    const url = initialView === 'home'
      ? (basePath ? `${BASE_PATH}${basePath}/home` : `${BASE_PATH}/`)
      : `${BASE_PATH}${basePath}/${initialView}`
    history.replaceState({ view: initialView }, '', url)
  } else {
    history.replaceState({ view: initialView }, '', window.location.href)
  }
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

const handleLoginSuccess = async (user: any) => {
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
  const subRes = await userStore.fetchSubscription()
  navigateTo('home', true)
  // After login: if transporter without subscription, show 499 modal
  const isTransporter = (userData.role || '').toLowerCase() === 'transporter'
  const hasSub = subRes?.hasPremium ?? userStore.hasPremium
  if (isTransporter && !hasSub) {
    userStore.setSubscriptionModal({ visible: true, minPrice: 499 })
    appStore.setShowSubscriptionModal(true)
  }
}

const clearAllBrowserCaches = async () => {
  localStorage.clear()
  sessionStorage.clear()
  if ('caches' in window) {
    try {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n)))
    } catch { /* ignore */ }
  }
}

const handleLogout = async () => {
  try {
    await apiPost(END_POINTS.LOGOUT)
  } catch { /* continue */ }
  userStore.reset()
  authStore.logout()
  appStore.resetOnLogout()
  await clearAllBrowserCaches()
  history.replaceState({}, '', BASE_PATH ? `${BASE_PATH}/` : '/')
}

const TRANSPORTER_499_VIEWS = ['rc-check', 'challan-check', 'view-applications']

const shouldShowSubscriptionModal = (view: string): boolean => {
  const r = (userStore.user?.role || '').toLowerCase()
  if (r !== 'transporter') return false
  if (!userStore.showSubscriptionModel) return false
  if (view === 'add-job' || view === 'view-jobs') return true
  if (TRANSPORTER_499_VIEWS.includes(view)) return !userStore.hasTransporter499Plan
  return false
}

const handleNavigate = (view: string) => {
  if (shouldShowSubscriptionModal(view)) {
    if (TRANSPORTER_499_VIEWS.includes(view)) {
      userStore.setSubscriptionModal({ visible: true, minPrice: 499 })
    }
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

const handleProfileComplete = async () => {
  appStore.setShowProfileCompletion(false)
  navigateTo('home', true)
  // After signup (profile complete): if transporter without subscription, show 499 modal
  const isTransporter = (userStore.user?.role || '').toLowerCase() === 'transporter'
  if (isTransporter) {
    const subRes = await userStore.fetchSubscription()
    const hasSub = subRes?.hasPremium ?? userStore.hasPremium
    if (!hasSub) {
      userStore.setSubscriptionModal({ visible: true, minPrice: 499 })
      appStore.setShowSubscriptionModal(true)
    }
  }
}

const handleSubscriptionRequired = () => {
  appStore.setShowSubscriptionModal(true)
  navigateTo('home', true)
}

const handleBack = () => {
  if (appStore.viewHistory.length > 1) {
    const prev = appStore.viewHistory[appStore.viewHistory.length - 2] as string
    appStore.goBack(prev)
    const url = getUrlForView(prev === 'home' ? 'home' : prev)
    history.pushState({ view: prev }, '', url)
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
      :user="layoutUser"
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
        :user="layoutUser"
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

      <Profile
        v-else-if="appStore.currentView === 'profile'"
        :user="{ ...(currentUser ?? {}), id: String(currentUser?.id ?? ''), unique_id: String(currentUser?.unique_id ?? currentUser?.tm_id ?? ''), name: String(currentUser?.name ?? currentUser?.name_eng ?? ''), mobile: String(currentUser?.mobile ?? ''), email: String(currentUser?.email ?? ''), role: String(currentUser?.role ?? '') }"
        :subscription-details="userStore.subscriptionDetails"
        @back="handleBack"
        @navigate="handleNavigate"
        @logout="handleLogout"
        @upgrade="appStore.setShowSubscriptionModal(true)"
      />

      <ProfileOverview
        v-else-if="appStore.currentView === 'profile-overview'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <ProfileEdit
        v-else-if="appStore.currentView === 'profile-edit'"
        :user="{ ...(currentUser ?? {}), id: String(currentUser?.id ?? ''), unique_id: String(currentUser?.unique_id ?? currentUser?.tm_id ?? ''), name: String(currentUser?.name ?? currentUser?.name_eng ?? ''), mobile: String(currentUser?.mobile ?? ''), email: String(currentUser?.email ?? ''), role: String(currentUser?.role ?? '') }"
        @back="handleBack"
        @save="() => {}"
      />

      <PrivacyPolicy
        v-else-if="appStore.currentView === 'privacy-policy'"
        @back="handleBack"
      />

      <RateUs
        v-else-if="appStore.currentView === 'rate-us'"
        @back="handleBack"
      />

      <AppSettings
        v-else-if="appStore.currentView === 'app-settings'"
        @back="handleBack"
        @logout="handleLogout"
      />

      <ContactUs
        v-else-if="appStore.currentView === 'contact-us'"
        @back="handleBack"
      />

      <DriverInvites
        v-else-if="appStore.currentView === 'driver-invites'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <DriverKiAwaz
        v-else-if="appStore.currentView === 'driver-ki-awaz'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <VerifyDriver
        v-else-if="appStore.currentView === 'verify-driver'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <VerifyDriverDocuments
        v-else-if="appStore.currentView === 'verify-driver-documents'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <VideoInterview
        v-else-if="appStore.currentView === 'video-interview'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <RcCheck
        v-else-if="appStore.currentView === 'rc-check'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <RcCheckResult
        v-else-if="appStore.currentView === 'rc-check-result'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <ChallanCheck
        v-else-if="appStore.currentView === 'challan-check'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <ChallanCheckResult
        v-else-if="appStore.currentView === 'challan-check-result'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <FuelDiscount
        v-else-if="appStore.currentView === 'fuel-discount'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TmLoadMandal
        v-else-if="appStore.currentView === 'tm-load-mandal'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TransporterLoan
        v-else-if="appStore.currentView === 'transporter-loan'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TruckInsurance
        v-else-if="appStore.currentView === 'truck-insurance'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TruckMarketplace
        v-else-if="appStore.currentView === 'truck-marketplace'"
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
