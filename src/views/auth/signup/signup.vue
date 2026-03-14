<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  END_POINTS,
  apiGet,
  apiPostForm,
  setAuthToken,
  setUser,
} from '../../../services/config/api'

// ── Privacy Policy & Terms popup state
const policyModalVisible = ref(false)
const policyModalTitle = ref('')
const policyModalContent = ref('')
const policyModalLoading = ref(false)

const openPolicyModal = async (type: 'privacy' | 'terms') => {
  policyModalTitle.value = type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'
  policyModalContent.value = ''
  policyModalLoading.value = true
  policyModalVisible.value = true

  try {
    const endpoint = type === 'privacy' ? END_POINTS.PRIVACY_POLICY : END_POINTS.TERMS_AND_CONDITIONS
    const res = await apiGet<{ status?: boolean; data?: string; message?: string }>(endpoint)
    if (res?.status && res?.data) {
      policyModalContent.value = res.data
    } else {
      policyModalContent.value = '<p style="text-align:center;color:#ef4444;">Failed to load content. Please try again.</p>'
    }
  } catch (err) {
    console.error('Error fetching policy:', err)
    policyModalContent.value = '<p style="text-align:center;color:#ef4444;">Failed to load content. Please try again.</p>'
  } finally {
    policyModalLoading.value = false
  }
}

const closePolicyModal = () => {
  policyModalVisible.value = false
  policyModalContent.value = ''
  policyModalTitle.value = ''
}

const props = defineProps<{
  preSelectedRole?: string
}>()

const emit = defineEmits<{
  back: []
  'signup-complete': []
}>()

interface StateItem {
  id: number
  name: string
}

const name = ref('')
const email = ref('')
const mobile = ref('')
const role = ref(props.preSelectedRole || 'driver')
const state = ref('')
const code = ref('')
const checkBoxSelect = ref(false)
const loading = ref(false)
const locations = ref<StateItem[]>([])
const stateModalVisible = ref(false)
const stateSearchQuery = ref('')
const step = ref(1)
const otp0 = ref('')
const otp1 = ref('')
const otp2 = ref('')
const otp3 = ref('')
const otpInputRefs = ref<(HTMLInputElement | null)[]>([null, null, null, null])

const setOtpRef = (i: number, el: unknown) => {
  if (el) otpInputRefs.value[i] = el as HTMLInputElement
}

const fullOtp = computed(() => (otp0.value + otp1.value + otp2.value + otp3.value).trim())

const onOtpInput = (idx: number, e: Event) => {
  const el = e.target as HTMLInputElement
  const raw = el.value.replace(/\D/g, '')
  const digits = [otp0, otp1, otp2, otp3]
  if (raw.length >= 4) {
    const chars = raw.slice(0, 4).split('')
    chars.forEach((c, i) => { if (digits[i]) digits[i].value = c })
    otpInputRefs.value[3]?.focus()
    nextTick().then(() => verifyOtp())
    return
  }
  const val = raw.slice(-1)
  const d = digits[idx]
  if (d) d.value = val
  if (val && idx < 3) otpInputRefs.value[idx + 1]?.focus()
  if (val && idx === 3) {
    nextTick().then(() => verifyOtp())
  }
}

const onOtpKeydown = (idx: number, e: KeyboardEvent) => {
  const digits = [otp0, otp1, otp2, otp3]
  const curr = digits[idx]
  const prev = digits[idx - 1]
  if (e.key === 'Backspace' && curr && !curr.value && idx > 0) {
    if (prev) prev.value = ''
    otpInputRefs.value[idx - 1]?.focus()
  }
}

const otpStepRef = ref<HTMLElement | null>(null)

const onOtpStepEntered = () => {
  if (step.value !== 2) return
  nextTick().then(() => {
    const el = otpStepRef.value?.querySelector<HTMLInputElement>('.otp-boxes input')
    if (el) el.focus()
  })
}

const errors = ref<{
  name?: string
  email?: string
  mobile?: string
  role?: string
  state?: string
  checkBox?: string
}>({})

const filteredLocations = computed(() => {
  const q = stateSearchQuery.value.trim().toLowerCase()
  if (!q) return locations.value
  return locations.value.filter((item) =>
    item.name.toLowerCase().includes(q)
  )
})

const selectedStateName = computed(() => {
  const found = locations.value.find((item) => item.id.toString() === state.value)
  return found ? found.name : ''
})


const fetchStates = async () => {
  try {
    const res = await apiGet<{ status?: boolean; data?: StateItem[] }>(
      END_POINTS.GETSTATES
    )
    if (res?.status && res?.data) {
      locations.value = res.data
    }
  } catch (err) {
    console.error('Error fetching states:', err)
  }
}

onMounted(() => {
  fetchStates()
  if (props.preSelectedRole) {
    role.value = props.preSelectedRole
  }
})

const clearError = (field?: keyof typeof errors.value) => {
  if (field) {
    const next = { ...errors.value }
    delete next[field]
    errors.value = next
  } else {
    errors.value = {}
  }
}

const validate = (): boolean => {
  const next: typeof errors.value = {}
  if (!name.value.trim()) next.name = 'Name is required'
  if (!mobile.value.trim()) next.mobile = 'Mobile number is required'
  else if (mobile.value.length < 10) next.mobile = 'Mobile number must be 10 digits'
  if (email.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) next.email = 'Invalid email format'
  }
  if (!role.value) next.role = 'Role is required'
  if (!state.value) next.state = 'State is required'
  if (!checkBoxSelect.value) next.checkBox = 'You need to accept TruckMitr terms'
  errors.value = next
  return Object.keys(next).length === 0
}

const onSignUpPress = async () => {
  if (!validate()) return
  loading.value = true
  clearError()

  try {
    const formData = new FormData()
    formData.append('name', name.value.trim())
    formData.append('mobile', mobile.value.trim())
    formData.append('email', email.value.trim().toLowerCase())
    formData.append('role', role.value)
    formData.append('states', state.value)
    formData.append('user_lang', 'en')
    formData.append('code', code.value.trim())
    formData.append('consent', '1')

    const res = await apiPostForm<{ success?: boolean; message?: string }>(
      END_POINTS.SIGNUP,
      formData
    )

    if (res?.success) {
      step.value = 2
      otp0.value = otp1.value = otp2.value = otp3.value = ''
      clearError()
    } else {
      const msg = res?.message || 'Signup failed'
      const msgLower = msg.toLowerCase()
      if (msgLower.includes('email')) {
        errors.value = { email: msg }
      } else if (msgLower.includes('mobile') || msgLower.includes('phone')) {
        errors.value = { mobile: msg }
      } else {
        errors.value = { name: msg }
      }
    }
  } catch (err: unknown) {
    const msg = (err as Error).message || 'Signup failed. Please try again.'
    const msgLower = msg.toLowerCase()
    if (msgLower.includes('email')) {
      errors.value = { email: msg }
    } else if (msgLower.includes('mobile') || msgLower.includes('phone')) {
      errors.value = { mobile: msg }
    } else {
      errors.value = { name: msg }
    }
  } finally {
    loading.value = false
  }
}

const verifyOtp = async () => {
  const otpVal = fullOtp.value
  if (otpVal.length < 4) {
    errors.value = { checkBox: 'Please enter complete OTP' }
    return
  }
  if (loading.value) return

  loading.value = true
  clearError()

  try {
    const formData = new FormData()
    formData.append('name', name.value.trim())
    formData.append('email', email.value.trim().toLowerCase())
    formData.append('mobile', mobile.value.trim())
    formData.append('states', state.value)
    formData.append('role', role.value)
    formData.append('otp', otpVal)
    formData.append('fcm_token', '')

    const res = await apiPostForm<{
      success?: boolean
      message?: string
      token?: string
      user?: Record<string, unknown>
    }>(END_POINTS.OTP_VERIFY, formData)

    if (res?.success && res?.token) {
      let token = res.token
      if (token.startsWith('Bearer ')) token = token.replace('Bearer ', '')
      setAuthToken(token)
      const userData = res.user || {
        name: name.value,
        mobile: mobile.value,
        email: email.value,
        role: role.value,
      }
      setUser(userData)
      localStorage.removeItem('signup_incomplete')
      emit('signup-complete')
    } else {
      errors.value = { checkBox: res?.message || 'Invalid OTP' }
    }
  } catch (err: unknown) {
    errors.value = {
      checkBox: (err as Error).message || 'Verification failed. Please try again.',
    }
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  emit('back')
}

const handleLogin = () => {
  emit('back')
}

const openStateModal = () => {
  stateModalVisible.value = true
  stateSearchQuery.value = ''
}

const closeStateModal = () => {
  stateModalVisible.value = false
  stateSearchQuery.value = ''
}

const selectState = (item: StateItem) => {
  state.value = item.id.toString()
  clearError('state')
  closeStateModal()
}

const toggleCheckbox = () => {
  checkBoxSelect.value = !checkBoxSelect.value
  clearError('checkBox')
}
</script>

<template>
  <div class="signup">
    <img src="../../../assets/logo/logotrick.png" alt="TruckMitr Logo" class="top-logo" />
    <main class="auth-card">
      <header class="nav-header">
        <button type="button" class="back-btn" @click="handleBack" aria-label="Go back">
          ← Back
        </button>
      </header>

      <div class="content">
        <div class="header">
        <h1 class="title">Welcome to TruckMitr</h1>
        <p class="subtitle">
          {{ step === 1 ? 'Enter the details to create an account' : 'Enter OTP sent to your mobile' }}
        </p>
      </div>

      <transition name="fade" mode="out-in" @after-enter="onOtpStepEntered">
        <!-- Step 1: Form -->
        <form v-if="step === 1" key="form" class="form" @submit.prevent="onSignUpPress">
          <div class="field">
            <label>Name <span class="required">*</span></label>
            <input
              v-model="name"
              type="text"
              placeholder="Enter name"
              :class="{ error: errors.name }"
              @input="clearError('name')"
            />
            <span v-if="errors.name" class="err-msg">{{ errors.name }}</span>
          </div>

          <div class="field">
            <label>Mobile <span class="required">*</span></label>
            <div class="input-with-prefix">
              <span class="prefix">+91</span>
              <input
                v-model="mobile"
                type="tel"
                placeholder="10 digit number"
                maxlength="10"
                inputmode="numeric"
                :class="{ error: errors.mobile }"
                @input="clearError('mobile')"
              />
            </div>
            <span v-if="errors.mobile" class="err-msg">{{ errors.mobile }}</span>
          </div>

          <div class="field">
            <label>E-mail</label>
            <input
              v-model="email"
              type="email"
              placeholder="Enter email"
              :class="{ error: errors.email }"
              @input="clearError('email')"
            />
            <span v-if="errors.email" class="err-msg">{{ errors.email }}</span>
          </div>

          <div class="field">
            <label>State <span class="required">*</span></label>
            <button
              type="button"
              class="state-select"
              :class="{ error: errors.state }"
              @click="openStateModal"
            >
              <span :class="{ placeholder: !selectedStateName }">
                {{ selectedStateName || 'Select state' }}
              </span>
              <span class="chevron">▼</span>
            </button>
            <span v-if="errors.state" class="err-msg">{{ errors.state }}</span>
          </div>

          <div v-if="role === 'driver'" class="field">
            <label>Referral code</label>
            <input
              v-model="code"
              type="text"
              placeholder="Optional"
            />
          </div>

          <div class="checkbox-row">
            <button
              type="button"
              class="checkbox"
              :aria-pressed="checkBoxSelect"
              @click="toggleCheckbox"
            >
              {{ checkBoxSelect ? '☑' : '☐' }}
            </button>
            <span class="checkbox-label">
              I agree to TruckMitr
              <a href="#" class="link" @click.prevent="openPolicyModal('terms')">Terms of Use</a>
              and
              <a href="#" class="link" @click.prevent="openPolicyModal('privacy')">Privacy Policy</a>
            </span>
          </div>
          <span v-if="errors.checkBox" class="err-msg">{{ errors.checkBox }}</span>

          <button
            type="submit"
            class="submit-btn"
            :disabled="loading"
          >
            <span v-if="!loading">Register now</span>
            <span v-else class="spinner"></span>
          </button>
        </form>

        <!-- Step 2: OTP -->
        <div v-else key="otp" ref="otpStepRef" class="otp-step">
          <div class="field">
            <label>Enter OTP</label>
            <p class="otp-hint">Sent to +91 {{ mobile }}</p>
            <div class="otp-boxes" :class="{ error: errors.checkBox }">
              <input
                v-for="(_, i) in [0,1,2,3]"
                :key="i"
                :ref="(el) => setOtpRef(i, el)"
                :value="[otp0, otp1, otp2, otp3][i]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                @input="(e) => { onOtpInput(i, e); clearError('checkBox') }"
                @keydown="onOtpKeydown(i, $event)"
              />
            </div>
            <span v-if="errors.checkBox" class="err-msg">{{ errors.checkBox }}</span>
          </div>
          <button
            type="button"
            class="submit-btn"
            :disabled="loading || fullOtp.length < 4"
            @click="verifyOtp"
          >
            <span v-if="!loading">Verify OTP</span>
            <span v-else class="spinner"></span>
          </button>
          <button type="button" class="text-btn" @click="step = 1">
            ← Change number
          </button>
        </div>
      </transition>

      <div class="login-link">
        <span>Already registered?</span>
        <button type="button" class="link-btn" @click="handleLogin">Login</button>
      </div>
      </div>
    </main>

    <!-- State picker modal -->
    <Teleport to="body">
      <div v-if="stateModalVisible" class="modal-overlay" @click.self="closeStateModal">
        <div class="modal">
          <div class="modal-header">
            <button type="button" class="close-btn" @click="closeStateModal">✕</button>
            <h3>Select state</h3>
          </div>
          <div class="modal-search">
            <input
              v-model="stateSearchQuery"
              type="text"
              placeholder="Search state..."
              class="search-input"
            />
          </div>
          <div class="modal-list">
            <button
              v-for="item in filteredLocations"
              :key="item.id"
              type="button"
              class="state-item"
              :class="{ selected: state === item.id.toString() }"
              @click="selectState(item)"
            >
              {{ item.name }}
            </button>
            <p v-if="filteredLocations.length === 0" class="empty">No states found</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Privacy Policy / Terms & Conditions modal -->
    <Teleport to="body">
      <transition name="policy-fade">
        <div v-if="policyModalVisible" class="policy-overlay" @click.self="closePolicyModal">
          <div class="policy-modal">
            <div class="policy-modal-header">
              <h3>{{ policyModalTitle }}</h3>
              <button type="button" class="policy-close-btn" @click="closePolicyModal" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="policy-modal-body">
              <div v-if="policyModalLoading" class="policy-loading">
                <span class="policy-spinner"></span>
                <p>Loading…</p>
              </div>
              <div v-else class="policy-content" v-html="policyModalContent"></div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.signup {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-image: url('../../../assets/images/login-bg/9169170290.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 24px 12vw;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.top-logo {
  position: absolute;
  top: 24px;
  right: 3vw;
  height: 85px;
  object-fit: contain;
  z-index: 10;
}

@media (max-width: 1024px) {
  .signup {
    padding: 24px 8vw;
  }
}

@media (max-width: 768px) {
  .signup {
    justify-content: center;
    padding: 24px;
    background-position: right;
  }
  .top-logo {
    top: 24px;
    right: 24px;
    height: 60px;
  }
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 48px;
  background: transparent;
  box-shadow: none;
  border: none;
}

.nav-header {
  margin-bottom: 24px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background: #ffffff;
  color: #1e293b;
  transform: translateY(-1px);
}

.content {
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 32px;
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px 0;
  text-align: center;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 16px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.form,
.otp-step {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

input {
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  font-size: 16px;
  background: rgba(248, 250, 252, 0.8);
  font-weight: 500;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

input::placeholder {
  color: #94a3b8;
}

input.error {
  border-color: #ef4444;
}

.otp-boxes {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 8px 0;
}

.otp-boxes input {
  width: 56px;
  height: 64px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.8);
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: all 0.2s ease;
  color: #1e293b;
  padding: 0;
}

.otp-boxes input:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.otp-boxes.error input {
  border-color: #ef4444;
}

.input-with-prefix {
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.8);
  overflow: hidden;
  transition: all 0.2s ease;
}

.input-with-prefix:focus-within {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.input-with-prefix .prefix {
  padding: 0 16px;
  font-size: 16px;
  color: #475569;
  font-weight: 600;
  border-right: 1px solid #e2e8f0;
  background: transparent;
}

.input-with-prefix input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  color: #1e293b;
  border-radius: 0;
}

.input-with-prefix input:focus {
  box-shadow: none;
  transform: none;
  background: transparent;
}

.state-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background: rgba(248, 250, 252, 0.8);
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.state-select:focus,
.state-select:active {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.state-select.placeholder {
  color: #94a3b8;
}

.state-select.error {
  border-color: #ef4444;
}

.chevron {
  font-size: 12px;
  color: #9ca3af;
}

.err-msg {
  font-size: 13px;
  color: #ef4444;
}

.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.checkbox {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  color: #3b82f6;
  transition: all 0.2s;
}

.checkbox-label {
  font-size: 14px;
  color: #475569;
  line-height: 1.4;
}

.link {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
}

.submit-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  height: auto;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.otp-hint {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.text-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  padding: 8px 0;
}

.login-link {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.link-btn {
  background: none;
  border: none;
  color: #3D5EE1;
  font-weight: 700;
  cursor: pointer;
  margin-left: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  position: absolute;
  left: 20px;
  background: none;
  border: none;
  font-size: 20px;
  color: #374151;
  cursor: pointer;
}

.modal-search {
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 15px;
}

.modal-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px 24px;
}

.state-item {
  display: block;
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  font-size: 15px;
  text-align: left;
  cursor: pointer;
}

.state-item.selected {
  border-color: #3D5EE1;
  background: rgba(61, 94, 225, 0.08);
  color: #3D5EE1;
  font-weight: 600;
}

.empty {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 24px 0;
  margin: 0;
}

/* ── Privacy / Terms Policy Modal ── */
.policy-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 24px;
}

.policy-modal {
  background: #ffffff;
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: policy-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes policy-slide-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.policy-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  flex-shrink: 0;
}

.policy-modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.policy-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.policy-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: rotate(90deg);
}

.policy-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  -webkit-overflow-scrolling: touch;
}

.policy-modal-body::-webkit-scrollbar {
  width: 6px;
}

.policy-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.policy-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.policy-modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.policy-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.policy-loading p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.policy-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.policy-content {
  font-size: 14px;
  line-height: 1.7;
  color: #374151;
}

.policy-content :deep(h1) {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.policy-content :deep(h2) {
  font-size: 17px;
  font-weight: 700;
  color: #1e3a8a;
  margin: 24px 0 10px 0;
}

.policy-content :deep(h3) {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin: 18px 0 8px 0;
}

.policy-content :deep(p) {
  margin: 0 0 12px 0;
}

.policy-content :deep(ul) {
  margin: 0 0 12px 0;
  padding-left: 20px;
}

.policy-content :deep(li) {
  margin-bottom: 6px;
}

.policy-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.policy-content :deep(strong) {
  color: #1e293b;
}

.policy-content :deep(.disclaimer) {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 12px 0;
  font-size: 13px;
}

/* Transition */
.policy-fade-enter-active,
.policy-fade-leave-active {
  transition: opacity 0.25s ease;
}

.policy-fade-enter-from,
.policy-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .policy-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .policy-modal {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 20px 20px 0 0;
    animation: policy-slide-up-mobile 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes policy-slide-up-mobile {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
