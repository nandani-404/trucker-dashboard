<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getAuthToken, getUser, clearAuthToken, clearUser } from './services/api'
import Landing from './views/landing/Landing.vue'
import Login from './views/auth/login/Login.vue'
import ModuleSelection from './views/auth/moduleSelection/index.vue'
import Signup from './views/auth/signup/signup.vue'
import ProfileCompletion from './views/auth/profile_completion/index.vue'
import Welcome from './views/main/home/Home.vue'
import Dashboard from './views/main/Dashboard.vue'
import AddJob from './views/main/AddJob.vue'
import ViewJobs from './views/main/ViewJobs.vue'
import ViewApplications from './views/main/ViewApplications.vue'
import AddDriver from './views/main/AddDriver.vue'
import DriverList from './views/main/DriverList.vue'
import VerifyDriver from './views/main/VerifyDriver.vue'
import RcCheck from './views/main/RcCheck.vue'
import RcCheckResult from './views/main/RcCheckResult.vue'
import ChallanCheck from './views/main/ChallanCheck.vue'
import ChallanCheckResult from './views/main/ChallanCheckResult.vue'
import DriverInvites from './views/main/DriverInvites.vue'
import VideoInterview from './views/main/VideoInterview.vue'
import TmLoadMandal from './views/main/TmLoadMandal.vue'
import FuelDiscount from './views/main/FuelDiscount.vue'
import TransporterLoan from './views/main/TransporterLoan.vue'
import TruckInsurance from './views/main/TruckInsurance.vue'
import TruckMarketplace from './views/main/TruckMarketplace.vue'
import ContactUs from './views/main/ContactUs.vue'
import Profile from './views/main/Profile.vue'
import ProfileEdit from './views/main/ProfileEdit.vue'
import PrivacyPolicy from './views/main/PrivacyPolicy.vue'
import RateUs from './views/main/RateUs.vue'
import AppSettings from './views/main/AppSettings.vue'
import AppLayout from './components/AppLayout.vue'

const STORAGE_KEY = 'truckmitr_user'

const isLoggedIn = ref(false)
const showProfileCompletion = ref(false)
// Auth flow: landing → login (on click) | module-selection | signup
const authScreen = ref<'landing' | 'login' | 'module-selection' | 'signup'>('landing')
const currentView = ref<string>('home')
const viewHistory = ref<string[]>(['home'])
const currentUser = ref<any>(null)

// ── History API: push a state entry when navigating to a non-home view
// so the browser ← back button works with real paths
const navigateTo = (view: string) => {
  if (view !== currentView.value) {
    // Manage history stack
    if (view === 'home') {
      viewHistory.value = ['home']
    } else {
      viewHistory.value.push(view)
    }

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
  // ── Restore session from localStorage (bearer token + user) — persist login across refresh
  const token = getAuthToken()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (token && saved) {
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
  let initialView = 'dashboard'
  const path = window.location.pathname.replace(/^\/|\/$/g, '')
  if (path && path !== 'login' && path !== 'index.html') {
    const parts = path.split('/')
    initialView = parts.length > 1 ? parts.slice(1).join('/') : 'dashboard'
  }

  history.replaceState({ view: initialView }, '', window.location.href)
  window.addEventListener('popstate', handlePopState)

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

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  } catch { /* storage full or unavailable */ }

  // Redirect to dashboard after successful login
  navigateTo('dashboard')
}

const handleLogout = () => {
  isLoggedIn.value = false
  currentView.value = 'home'
  currentUser.value = null

  clearAuthToken()
  clearUser()
  localStorage.removeItem(STORAGE_KEY)
  history.replaceState({ view: 'home' }, '', '/')
}

const handleNavigate = (view: string) => {
  navigateTo(view)
}

const handleLandingLogin = () => {
  authScreen.value = 'login'
}

const handleNavigateSignup = () => {
  authScreen.value = 'module-selection'
}

const handleModuleBack = () => {
  authScreen.value = 'login'
}

const signupPreSelectedRole = ref<string>('driver')

const handleModuleContinue = (roleId: string, _module: string) => {
  signupPreSelectedRole.value = roleId
  authScreen.value = 'signup'
}

const handleSignupBack = () => {
  authScreen.value = 'module-selection'
}

const handleSignupComplete = () => {
  // OTP verified; user is logged in → show profile completion → then home
  const userData = getUser() as Record<string, unknown> | null
  if (userData && userData.mobile) {
    currentUser.value = {
      name: (userData.name as string) || 'User',
      mobile: userData.mobile as string,
      role: (userData.role as string) || 'User',
      ...userData,
    }
    isLoggedIn.value = true
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser.value))
    authScreen.value = 'login'
    showProfileCompletion.value = true
  } else {
    authScreen.value = 'login'
  }
}

const handleProfileComplete = () => {
  showProfileCompletion.value = false
  navigateTo('home')
}

const handleBack = () => {
  if (viewHistory.value.length > 1) {
    viewHistory.value.pop() // remove current
    const prev = viewHistory.value[viewHistory.value.length - 1] as string
    
    // Update browser history seamlessly
    const roleNamespace = currentUser.value?.role 
      ? `/${currentUser.value.role.toLowerCase().replace(/\s+/g, '-')}` 
      : ''
      
    if (prev !== 'home') {
      history.pushState({ view: prev }, '', `${roleNamespace}/${prev}`)
    } else {
      history.pushState({ view: 'home' }, '', roleNamespace || '/')
    }
    
    currentView.value = prev
  } else {
    navigateTo('home')
  }
}
</script>

<template>
  <div id="app">
    <Landing
      v-if="!isLoggedIn && authScreen === 'landing'"
      @login="handleLandingLogin"
    />
    <Login
      v-else-if="!isLoggedIn && authScreen === 'login'"
      @login-success="handleLoginSuccess"
      @navigate-signup="handleNavigateSignup"
      @back="authScreen = 'landing'"
    />
    <ModuleSelection
      v-else-if="!isLoggedIn && authScreen === 'module-selection'"
      @back="handleModuleBack"
      @role-selected="handleModuleContinue"
    />
    <Signup
      v-else-if="!isLoggedIn && authScreen === 'signup'"
      :pre-selected-role="signupPreSelectedRole"
      @back="handleSignupBack"
      @signup-complete="handleSignupComplete"
    />

    <!-- Logged in → Profile completion (after signup) or main app -->
    <ProfileCompletion
      v-if="isLoggedIn && showProfileCompletion && currentUser"
      :user="currentUser"
      @complete="handleProfileComplete"
    />
    <AppLayout
      v-else-if="isLoggedIn && currentUser && !showProfileCompletion"
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
        @navigate="handleNavigate"
      />

      <!-- Add Job content -->
      <AddJob
        v-else-if="currentView === 'add-job'"
        @back="handleBack"
      />

      <!-- View Jobs content -->
      <ViewJobs
        v-else-if="currentView === 'view-jobs'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- View Applications content -->
      <ViewApplications
        v-else-if="currentView === 'view-applications'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- Add Driver content -->
      <AddDriver
        v-else-if="currentView === 'add-driver'"
        @back="handleBack"
      />

      <!-- Driver List content -->
      <DriverList
        v-else-if="currentView === 'driver-list'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- Verify Driver content -->
      <VerifyDriver
        v-else-if="currentView === 'verify-driver'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- Contact Us content -->
      <ContactUs
        v-else-if="currentView === 'contact-us'"
        @back="handleBack"
      />

      <!-- RC Check content -->
      <RcCheck
        v-else-if="currentView === 'rc-check'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- RC Check Result content -->
      <RcCheckResult
        v-else-if="currentView === 'rc-check-result'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- Challan Check content -->
      <ChallanCheck
        v-else-if="currentView === 'challan-check'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- Challan Check Result content -->
      <ChallanCheckResult
        v-else-if="currentView === 'challan-check-result'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- Driver Invites content -->
      <DriverInvites
        v-else-if="currentView === 'driver-invites'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <!-- Video Interview content -->
      <VideoInterview
        v-else-if="currentView === 'video-interview'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TmLoadMandal
        v-else-if="currentView === 'tm-load-mandal'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <FuelDiscount
        v-else-if="currentView === 'fuel-discount'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TransporterLoan
        v-else-if="currentView === 'transporter-loan'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TruckInsurance
        v-else-if="currentView === 'truck-insurance'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <TruckMarketplace
        v-else-if="currentView === 'truck-marketplace'"
        @back="handleBack"
        @navigate="handleNavigate"
      />

      <Profile
        v-else-if="currentView === 'profile'"
        :user="currentUser"
        :profile-completion="currentUser?.profile_completion || 75"
        @back="handleBack"
        @navigate="handleNavigate"
        @logout="handleLogout"
      />

      <ProfileEdit
        v-else-if="currentView === 'profile-edit'"
        :user="currentUser"
        @back="handleBack"
        @save="handleBack"
      />

      <PrivacyPolicy
        v-else-if="currentView === 'privacy'"
        @back="handleBack"
      />

      <RateUs
        v-else-if="currentView === 'rating'"
        @back="handleBack"
      />

      <AppSettings
        v-else-if="currentView === 'settings'"
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