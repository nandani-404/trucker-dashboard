<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { END_POINTS, apiPostForm, setAuthToken, setUser } from '../../../services/config/api'

const props = defineProps<{
  showBackButton?: boolean
}>()

const emit = defineEmits<{
  'login-success': [user: Record<string, unknown>]
  'navigate-signup': []
}>()

const mobile = ref('')
const otp0 = ref('')
const otp1 = ref('')
const otp2 = ref('')
const otp3 = ref('')
const otpInputRefs = ref<(HTMLInputElement | null)[]>([null, null, null, null])

function setOtpRef(i: number, el: unknown) {
  if (el) otpInputRefs.value[i] = el as HTMLInputElement
}
const step = ref(1)
const loading = ref(false)
const error = ref('')
const showTransporterOnlyPopup = ref(false)

function clearError() {
  error.value = ''
}

const otpStepRef = ref<HTMLElement | null>(null)

function onOtpStepEntered() {
  if (step.value !== 2) return
  nextTick().then(() => {
    const el = otpStepRef.value?.querySelector<HTMLInputElement>('.otp-boxes input')
    el?.focus()
  })
}

async function sendOtp() {
  const m = mobile.value.trim()
  if (!m || m.length !== 10) {
    error.value = 'Enter a valid 10 digit mobile number'
    return
  }
  loading.value = true
  clearError()
  try {
    const formData = new FormData()
    formData.append('mobile', m)
    formData.append('user_lang', 'en')

    const res = await apiPostForm<{ status?: boolean; success?: boolean; message?: string }>(
      END_POINTS.LOGIN,
      formData
    )

    if (res?.status || res?.success) {
      step.value = 2
      otp0.value = otp1.value = otp2.value = otp3.value = ''
    } else {
      error.value = (res as { message?: string })?.message || 'Failed to send OTP'
    }
  } catch (err) {
    error.value = (err as Error).message || 'Failed to send OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

const fullOtp = computed(() => (otp0.value + otp1.value + otp2.value + otp3.value).trim())

function onOtpInput(idx: number, e: Event) {
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

function onOtpKeydown(idx: number, e: KeyboardEvent) {
  const digits = [otp0, otp1, otp2, otp3]
  const curr = digits[idx]
  const prev = digits[idx - 1]
  if (e.key === 'Backspace' && curr && !curr.value && idx > 0) {
    if (prev) prev.value = ''
    otpInputRefs.value[idx - 1]?.focus()
  }
}

async function verifyOtp() {
  const otpVal = fullOtp.value
  if (otpVal.length < 4) {
    error.value = 'Please enter complete OTP'
    return
  }
  loading.value = true
  clearError()
  try {
    const formData = new FormData()
    formData.append('mobile', mobile.value.trim())
    formData.append('otp', otpVal)
    formData.append('user_lang', 'en')

    const res = await apiPostForm<{
      status?: boolean
      success?: boolean
      message?: string
      token?: string
      user?: Record<string, unknown>
      data?: { user?: Record<string, unknown>; token?: string }
    }>(END_POINTS.LOGIN_OTP_VERIFY, formData)

    const data = res?.data as { user?: Record<string, unknown>; token?: string } | undefined
    const token = res?.token ?? data?.token
    const userData = res?.user ?? data?.user

    if ((res?.status || res?.success) && token) {
      const user = (userData || {
        name: '',
        name_eng: '',
        mobile: mobile.value.trim(),
        email: '',
        role: '',
      }) as Record<string, unknown>
      const role = String(user?.role || '').toLowerCase().trim()

      if (role === 'transporter') {
        let t = String(token)
        if (t.startsWith('Bearer ')) t = t.replace('Bearer ', '')
        setAuthToken(t)
        setUser(user)
        emit('login-success', user)
      } else {
        showTransporterOnlyPopup.value = true
      }
    } else {
      error.value = (res as { message?: string })?.message || 'Invalid OTP'
    }
  } catch (err) {
    error.value = (err as Error).message || 'Verification failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleNavigateSignup() {
  emit('navigate-signup')
}

function handleChangeNumber() {
  step.value = 1
  otp0.value = otp1.value = otp2.value = otp3.value = ''
  clearError()
}

function closeTransporterPopup() {
  showTransporterOnlyPopup.value = false
  handleChangeNumber()
}
</script>

<template>
  <div class="login-page">
    <main class="login-card">
      <h1 class="title">Welcome to TruckMitr</h1>
      <p class="subtitle">Enter your mobile number to continue</p>

      <transition name="fade" mode="out-in" @after-enter="onOtpStepEntered">
        <form v-if="step === 1" key="mobile" class="form" @submit.prevent="sendOtp">
          <div class="field">
            <label>Mobile</label>
            <div class="input-with-prefix">
              <span class="prefix">+91</span>
              <input
                v-model="mobile"
                type="tel"
                placeholder="Enter 10 digit number"
                maxlength="10"
                inputmode="numeric"
                :class="{ error: error }"
                @input="clearError"
              />
            </div>
            <span v-if="error" class="err-msg">{{ error }}</span>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="!loading">Send OTP</span>
            <span v-else class="spinner"></span>
          </button>
        </form>

        <div v-else key="otp" ref="otpStepRef" class="otp-step">
          <div class="field">
            <label>Enter OTP</label>
            <p class="otp-hint">Sent to +91 {{ mobile }}</p>
            <div class="otp-boxes" :class="{ error: error }">
              <input
                v-for="(_, i) in [0,1,2,3]"
                :key="i"
                :ref="(el) => setOtpRef(i, el)"
                :value="[otp0, otp1, otp2, otp3][i]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                @input="(e) => { onOtpInput(i, e); clearError() }"
                @keydown="onOtpKeydown(i, $event)"
              />
            </div>
            <span v-if="error" class="err-msg">{{ error }}</span>
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
          <button type="button" class="text-btn" @click="handleChangeNumber">
            ← Change number
          </button>
        </div>
      </transition>

      <div class="signup-link">
        <span>Need an account?</span>
        <button type="button" class="link-btn" @click="handleNavigateSignup">Register now</button>
      </div>
    </main>

    <!-- Transporter-only popup -->
    <Teleport to="body">
      <div v-if="showTransporterOnlyPopup" class="popup-overlay" @click.self="closeTransporterPopup">
        <div class="popup-card">
          <div class="popup-icon">⚠️</div>
          <h3 class="popup-title">Oops, you are not a transporter</h3>
          <p class="popup-message">For now only transporter can access this website.</p>
          <button type="button" class="popup-btn" @click="closeTransporterPopup">Back to login</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 24px;
  font-family: 'Inter', sans-serif;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #1e40af;
  margin: 0 0 8px 0;
  text-align: center;
}

.subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 28px 0;
  text-align: center;
}

.form,
.otp-step {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.input-with-prefix {
  display: flex;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  overflow: hidden;
}

.input-with-prefix:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.prefix {
  padding: 0 16px;
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
}

.input-with-prefix input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 14px 16px;
  font-size: 16px;
  outline: none;
}

.otp-boxes {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.otp-boxes input {
  width: 52px;
  height: 56px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  outline: none;
}

.otp-boxes input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.otp-boxes.error input {
  border-color: #ef4444;
}

.input-with-prefix.error {
  border-color: #ef4444;
}

.otp-hint {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.err-msg {
  font-size: 13px;
  color: #ef4444;
}

.submit-btn {
  width: 100%;
  padding: 14px 24px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.text-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 0;
}

.text-btn:hover {
  color: #3b82f6;
}

.signup-link {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  padding: 0 4px;
}

.link-btn:hover {
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transporter-only popup */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.popup-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.popup-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.popup-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.popup-message {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.popup-btn {
  width: 100%;
  padding: 14px 24px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.popup-btn:hover {
  background: #2563eb;
}
</style>
