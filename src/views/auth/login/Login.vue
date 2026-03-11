<script setup lang="ts">
import { ref } from 'vue'
import {
  END_POINTS,
  apiPostForm,
  apiGet,
  setAuthToken,
  setUser,
} from '../../../services/api'

const mobileNumber = ref('')
const otp = ref('')
const step = ref(1)
const loading = ref(false)
const errorMessage = ref('')

const emit = defineEmits(['login-success', 'navigate-signup', 'back'])

// Validate mobile (same as RN: check not empty)
const validateMobile = (): boolean => {
  if (!mobileNumber.value.trim()) {
    errorMessage.value = 'Please enter your mobile number'
    return false
  }
  return true
}

const handleSendOTP = async () => {
  if (!validateMobile()) return
  loading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('mobile', mobileNumber.value.trim())

    const data = await apiPostForm<{ success: boolean; message?: string }>(
      END_POINTS.LOGIN,
      formData
    )

    if (data.success) {
      step.value = 2
      errorMessage.value = ''
    } else {
      errorMessage.value = data.message || 'Failed to send OTP'
    }
  } catch (error: unknown) {
    errorMessage.value =
      (error as Error).message || 'An error occurred. Please try again.'
    console.error('Send OTP error:', error)
  } finally {
    loading.value = false
  }
}

const handleVerifyOTP = async () => {
  const fullOtp = otp.value.trim()
  if (fullOtp.length < 4) {
    errorMessage.value = 'Please enter complete OTP'
    return
  }
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('mobile', mobileNumber.value.trim())
    formData.append('otp', fullOtp)
    // Web has no FCM; send empty string to match RN API contract
    formData.append('fcm_token', '')

    const data = await apiPostForm<{
      success: boolean
      message?: string
      user?: Record<string, unknown>
      token?: string
      access_token?: string
    }>(END_POINTS.LOGIN_OTP_VERIFY, formData)

    if (data.success && data.token) {
      let token = data.token || data.access_token || ''
      // Strip "Bearer " prefix if present (same as RN)
      if (token.startsWith('Bearer ')) {
        token = token.replace('Bearer ', '')
      }
      setAuthToken(token)

      const userFromResponse = data.user || {}
      const userData = {
        id: userFromResponse.id ?? '',
        unique_id: userFromResponse.unique_id ?? '',
        name: userFromResponse.name ?? userFromResponse.name_eng ?? 'User',
        mobile: userFromResponse.mobile ?? mobileNumber.value,
        email: userFromResponse.email ?? '',
        role: userFromResponse.role ?? 'User',
        ...userFromResponse,
      }
      setUser(userData)

      // Fetch profile to enrich user data (same as RN)
      try {
        const profileRes = await apiGet<{ status?: boolean; data?: Record<string, unknown> }>(
          END_POINTS.GET_PROFILE
        )
        if (profileRes?.status && profileRes?.data) {
          Object.assign(userData, profileRes.data)
          setUser(userData)
        }
      } catch {
        // Profile fetch failed; use OTP user data
      }

      emit('login-success', userData)
    } else if (data.success && !data.token) {
      errorMessage.value = data.message || 'Login succeeded but no token received'
    } else {
      errorMessage.value = data.message || 'Invalid OTP'
    }
  } catch (error: unknown) {
    errorMessage.value =
      (error as Error).message || 'Verification failed. Please try again.'
    console.error('Verify OTP error:', error)
  } finally {
    loading.value = false
  }
}

const clearError = () => {
  errorMessage.value = ''
}

const goToSignup = () => {
  emit('navigate-signup')
}

const handleBack = () => {
  emit('back')
}
</script>

<template>
  <div class="login-container">
    <button type="button" class="back-to-home" @click="handleBack">← Back</button>
    <div class="glass-card">
      <div class="card-header">
        <h2>Welcome to TruckMitr</h2>
        <p>Enter your mobile number to continue</p>
      </div>

      <div class="form-container">
        <!-- Step 1: Mobile Number (same flow as RN) -->
        <transition name="fade" mode="out-in">
          <div v-if="step === 1" key="step1" class="form-step">
            <div class="input-group">
              <label for="mobile">Mobile</label>
              <div class="input-with-prefix">
                <span class="prefix">+91</span>
                <input
                  id="mobile"
                  type="tel"
                  v-model="mobileNumber"
                  @input="clearError"
                  placeholder="Enter 10 digit number"
                  maxlength="10"
                  inputmode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div v-if="errorMessage" class="error-row">
                <span class="error-icon">!</span>
                <span class="error-msg">{{ errorMessage }}</span>
              </div>
            </div>
            <button
              class="primary-btn"
              @click="handleSendOTP"
              :disabled="loading || !mobileNumber.trim()"
            >
              <span v-if="!loading">Send OTP</span>
              <span v-else class="spinner"></span>
            </button>
          </div>

          <!-- Step 2: OTP Verification (same flow as RN) -->
          <div v-else key="step2" class="form-step">
            <div class="input-group">
              <label for="otp">Enter OTP</label>
              <div class="otp-instruction">
                Sent to +91 {{ mobileNumber.slice(-4) }}
                <span class="edit-link" @click="step = 1; clearError()">Edit</span>
              </div>
              <input
                id="otp"
                type="text"
                v-model="otp"
                @input="clearError"
                placeholder="Enter 4 or 6 digit OTP"
                maxlength="6"
                inputmode="numeric"
                pattern="[0-9]*"
              />
              <div v-if="errorMessage" class="error-row">
                <span class="error-icon">!</span>
                <span class="error-msg">{{ errorMessage }}</span>
              </div>
            </div>
            <button
              class="primary-btn"
              @click="handleVerifyOTP"
              :disabled="loading || otp.trim().length < 4"
            >
              <span v-if="!loading">Verify OTP</span>
              <span v-else class="spinner"></span>
            </button>
          </div>
        </transition>

        <!-- Register link (same as RN) -->
        <div class="register-row">
          <span class="register-text">Need an account?</span>
          <button type="button" class="register-link" @click="goToSignup">
            Register now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  margin: 0;
  padding: 20px;
}

.back-to-home {
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  font-size: 15px;
  color: #6b7280;
  cursor: pointer;
}

.back-to-home:hover {
  color: #111827;
}

.glass-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 24px;
  padding: 40px 30px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  color: #111827;
  text-align: center;
}

.card-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #3D5EE1;
}

.card-header p {
  margin: 8px 0 24px 0;
  font-size: 14px;
  color: #6b7280;
}

.form-step {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.input-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-with-prefix {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.input-with-prefix:focus-within {
  border-color: #3D5EE1;
  box-shadow: 0 0 0 4px rgba(61, 94, 225, 0.1);
}

.prefix {
  padding: 14px 16px;
  font-size: 16px;
  color: #374151;
  font-weight: 500;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
}

.input-with-prefix input {
  flex: 1;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.input-with-prefix input:focus {
  box-shadow: none;
}

.error-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.error-icon {
  color: #ef4444;
  font-size: 14px;
  font-weight: 700;
}

.otp-instruction {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.edit-link {
  color: #111827;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  margin-left: 8px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
}

input::placeholder {
  color: #9ca3af;
}

input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.1);
}

.primary-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 100px;
  background: #3D5EE1;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 52px;
  box-shadow: 0 4px 15px rgba(61, 94, 225, 0.3);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(61, 94, 225, 0.35);
}

.primary-btn:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(156, 163, 175, 0.3);
  border-radius: 50%;
  border-top-color: #6b7280;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-msg {
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
}

.register-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.register-text {
  color: #6b7280;
  font-size: 14px;
}

.register-link {
  background: none;
  border: none;
  color: #3D5EE1;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.register-link:hover {
  text-decoration: underline;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
