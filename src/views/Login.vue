<script setup lang="ts">
import { ref } from 'vue'
import { apiFetch } from '../services/api'

const mobileNumber = ref('')
const otp = ref('')
const step = ref(1)
const loading = ref(false)
const errorMessage = ref('')

const emit = defineEmits(['login-success'])

const handleSendOTP = async () => {
  if (mobileNumber.value.length < 10) return
  loading.value = true
  errorMessage.value = ''
  
  try {
    const formData = new FormData()
    formData.append('mobile', mobileNumber.value)

    const data = await apiFetch('/api/login', formData)

    if (data.success) {
      step.value = 2
    } else {
      errorMessage.value = data.message || 'Failed to send OTP'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred. Please try again.'
    console.error('Send OTP error:', error)
  } finally {
    loading.value = false
  }
}

const handleVerifyOTP = async () => {
  if (otp.value.length < 4) return
  loading.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('mobile', mobileNumber.value)
    formData.append('otp', otp.value)

    const data = await apiFetch('/api/verify-login-otp', formData)

    if (data.success) {
      emit('login-success', data.user || { name: 'User', mobile: mobileNumber.value })
    } else {
      errorMessage.value = data.message || 'Invalid OTP'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred. Please try again.'
    console.error('Verify OTP error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="glass-card">
      <div class="card-header">
        <h2>Welcome Back</h2>
        <p>Please log in to continue</p>
      </div>

      <div class="form-container">
        <!-- Step 1: Mobile Number -->
        <transition name="fade" mode="out-in">
          <div v-if="step === 1" key="step1" class="form-step">
            <div class="input-group">
              <label for="mobile">Mobile Number</label>
              <input 
                id="mobile"
                type="tel"
                v-model="mobileNumber" 
                placeholder="Enter 10 digit number"
                maxlength="10"
                pattern="[0-9]{10}"
              />
            </div>
            <button class="primary-btn" @click="handleSendOTP" :disabled="loading || mobileNumber.length < 10">
              <span v-if="!loading">Send OTP</span>
              <span v-else class="spinner"></span>
            </button>
            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
          </div>

          <!-- Step 2: OTP Verification -->
          <div v-else key="step2" class="form-step">
            <div class="input-group">
              <label for="otp">Enter OTP</label>
              <div class="otp-instruction">Sent to +XX {{ mobileNumber.slice(-4) }} <span class="edit-link" @click="step = 1; errorMessage = ''">Edit</span></div>
              <input 
                id="otp"
                type="text"
                v-model="otp" 
                placeholder="Enter 4 or 6 digit OTP"
                maxlength="6"
              />
            </div>
            <button class="primary-btn" @click="handleVerifyOTP" :disabled="loading || otp.length < 4">
              <span v-if="!loading">Verify OTP</span>
              <span v-else class="spinner"></span>
            </button>
            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
          </div>
        </transition>
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  margin: 0;
  padding: 20px;
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
  border-radius: 12px;
  background: #111827;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(17, 24, 39, 0.15);
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
  margin-top: -12px;
  margin-bottom: 0px;
  font-weight: 500;
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
