/**
 * App store - mirrors Redux app.reducer + UI state
 * Manages app-level state: currentView, viewHistory, authScreen, modals
 */
import { defineStore } from 'pinia'

export type AuthScreen = 'login' | 'module-selection' | 'signup'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentView: 'home' as string,
    viewHistory: ['home'] as string[],
    authScreen: 'login' as AuthScreen,
    showProfileCompletion: false,
    showSubscriptionModal: false,
    signupPreSelectedRole: 'driver' as string,
    rcVerificationNumber: '' as string,
    rcVerificationData: null as Record<string, unknown> | null,
    challanVerificationVehicleNumber: '' as string,
    challanVerificationResults: [] as Record<string, unknown>[],
  }),
  getters: {
    canGoBack: (state) => state.viewHistory.length > 1,
    previousView: (state) =>
      state.viewHistory.length > 1
        ? state.viewHistory[state.viewHistory.length - 2]
        : 'home',
  },
  actions: {
    setCurrentView(view: string) {
      this.currentView = view
    },
    navigateTo(view: string) {
      if (view !== this.currentView) {
        if (view === 'home') {
          this.viewHistory = ['home']
        } else {
          this.viewHistory.push(view)
        }
        this.currentView = view
      }
    },
    goBack(prevView?: string) {
      if (this.viewHistory.length > 1) {
        this.viewHistory.pop()
        this.currentView = prevView ?? this.viewHistory[this.viewHistory.length - 1] ?? 'home'
      } else {
        this.currentView = 'home'
        this.viewHistory = ['home']
      }
    },
    setAuthScreen(screen: AuthScreen) {
      this.authScreen = screen
    },
    setShowProfileCompletion(show: boolean) {
      this.showProfileCompletion = show
    },
    setShowSubscriptionModal(show: boolean) {
      this.showSubscriptionModal = show
    },
    setSignupPreSelectedRole(role: string) {
      this.signupPreSelectedRole = role
    },
    setRcVerificationResult(rcNumber: string, rcData: Record<string, unknown> | null) {
      this.rcVerificationNumber = rcNumber
      this.rcVerificationData = rcData
    },
    setChallanVerificationResult(vehicleNumber: string, results: Record<string, unknown>[]) {
      this.challanVerificationVehicleNumber = vehicleNumber
      this.challanVerificationResults = results
    },
    resetOnLogout() {
      this.currentView = 'home'
      this.viewHistory = ['home']
      this.authScreen = 'login'
      this.showProfileCompletion = false
      this.showSubscriptionModal = false
      this.rcVerificationNumber = ''
      this.rcVerificationData = null
      this.challanVerificationVehicleNumber = ''
      this.challanVerificationResults = []
    },
  },
})
