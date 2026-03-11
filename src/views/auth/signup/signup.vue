<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  END_POINTS,
  apiGet,
  apiPostForm,
  setAuthToken,
  setUser,
} from '../../../services/api'

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
const otp = ref('')

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
      otp.value = ''
      clearError()
    } else {
      errors.value = { name: res?.message || 'Signup failed' }
    }
  } catch (err: unknown) {
    errors.value = {
      name: (err as Error).message || 'Signup failed. Please try again.',
    }
  } finally {
    loading.value = false
  }
}

const verifyOtp = async () => {
  const fullOtp = otp.value.trim()
  if (fullOtp.length < 4) {
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
    formData.append('otp', fullOtp)
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
    <header class="nav-header">
      <button type="button" class="back-btn" @click="handleBack" aria-label="Go back">
        ← Back
      </button>
    </header>

    <main class="content">
      <div class="header">
        <h1 class="title">Welcome to TruckMitr</h1>
        <p class="subtitle">
          {{ step === 1 ? 'Enter the details to create an account' : 'Enter OTP sent to your mobile' }}
        </p>
      </div>

      <transition name="fade" mode="out-in">
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
              <a href="#" class="link">Terms of Use</a>
              and
              <a href="#" class="link">Privacy Policy</a>
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
        <div v-else key="otp" class="otp-step">
          <div class="field">
            <label>Enter OTP</label>
            <p class="otp-hint">Sent to +91 {{ mobile.slice(-4) }}</p>
            <input
              v-model="otp"
              type="text"
              placeholder="4 or 6 digit OTP"
              maxlength="6"
              inputmode="numeric"
              :class="{ error: errors.checkBox }"
              @input="clearError('checkBox')"
            />
            <span v-if="errors.checkBox" class="err-msg">{{ errors.checkBox }}</span>
          </div>
          <button
            type="button"
            class="submit-btn"
            :disabled="loading || otp.trim().length < 4"
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
  </div>
</template>

<style scoped>
.signup {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: system-ui, -apple-system, sans-serif;
}

.nav-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  background: none;
  border: none;
  font-size: 15px;
  color: #3D5EE1;
  cursor: pointer;
  padding: 6px 0;
}

.content {
  flex: 1;
  padding: 24px 20px 40px;
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 28px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
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
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 15px;
}

input.error {
  border-color: #ef4444;
}

.input-with-prefix {
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  overflow: hidden;
}

.input-with-prefix input {
  flex: 1;
  border: none;
  border-radius: 0;
}

.input-with-prefix .prefix {
  padding: 12px 14px;
  background: #f9fafb;
  font-size: 15px;
  color: #374151;
  border-right: 1px solid #e5e7eb;
}

.state-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-size: 15px;
  color: #1a1a1a;
  cursor: pointer;
  text-align: left;
}

.state-select.placeholder {
  color: #9ca3af;
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
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.checkbox-label {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.4;
}

.link {
  color: #3D5EE1;
  font-weight: 600;
}

.submit-btn {
  height: 52px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(90deg, #3D5EE1, #18A9B3);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
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
</style>
