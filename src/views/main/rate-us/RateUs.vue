<script setup lang="ts">
import { ref } from 'vue'
import { ChevronLeft, Star, Send, Heart, Sparkles, MessageSquare } from 'lucide-vue-next'
import { END_POINTS, apiPostForm } from '../../../services/config/api'

const emit = defineEmits(['back'])

const rating = ref(0)
const feedback = ref('')
const selectedTags = ref<string[]>([])
const loading = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

const tags = [
  'Good performance',
  'Vivid Colours',
  'Enjoyable',
  'Intuitive',
  'Easy to use',
  'Professional UI',
  'Highly Reliable'
]

const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

const handleSubmit = async () => {
  if (rating.value === 0) {
    errorMsg.value = 'Please select a rating before sending.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const formData = new FormData()
    formData.append('rating', String(rating.value))
    formData.append('feedback', feedback.value.trim())
    formData.append('tags', selectedTags.value.join(','))

    const res = await apiPostForm<{ status?: boolean; success?: boolean; message?: string }>(
      END_POINTS.REATE_US,
      formData
    )

    if (res?.status || res?.success) {
      submitted.value = true
      setTimeout(() => {
        emit('back')
      }, 2000)
    } else {
      errorMsg.value = res?.message || 'Failed to submit feedback. Please try again.'
    }
  } catch (err: unknown) {
    errorMsg.value = (err as Error).message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rate-us-master">
    <div class="rate-us-container">
      <!-- Header -->
      <header class="rate-header">
        <button class="back-link" @click="emit('back')">
          <ChevronLeft :size="20" />
          <span>Back to Profile</span>
        </button>
        <div class="header-main">
          <div class="rate-badge">CUSTOMER FEEDBACK</div>
          <h1>Rate Our Platform</h1>
          <p class="subtitle">Your feedback helps us build a better experience for the transporter community.</p>
        </div>
      </header>

      <main class="rate-body">
        <!-- Success State -->
        <div v-if="submitted" class="success-state">
          <div class="success-icon">✓</div>
          <h2>Thank You!</h2>
          <p>Your feedback has been submitted successfully. We appreciate your support!</p>
        </div>

        <!-- Form -->
        <div v-else class="rate-grid">
          <!-- Left: Selection -->
          <div class="rate-card main-card">
            <div class="card-section">
              <div class="section-title">
                <Heart :size="20" class="icon-blue" />
                <h3>Overall Experience</h3>
              </div>
              <div class="stars-container">
                <div class="stars-row">
                  <Star 
                    v-for="i in 5" 
                    :key="i"
                    :size="48"
                    class="star-icon"
                    :class="{ 'active': rating >= i }"
                    @click="rating = i; errorMsg = ''"
                    :fill="rating >= i ? '#ffc107' : 'none'"
                  />
                </div>
                <div class="stars-labels">
                  <span>Dissatisfied</span>
                  <span>Very Satisfied</span>
                </div>
              </div>
            </div>

            <div class="card-section">
              <div class="section-title">
                <Sparkles :size="20" class="icon-blue" />
                <h3>What did you like most?</h3>
              </div>
              <div class="tags-row">
                <button 
                  v-for="tag in tags" 
                  :key="tag"
                  class="tag-btn"
                  :class="{ 'active': selectedTags.includes(tag) }"
                  @click="toggleTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Feedback -->
          <div class="rate-card feedback-card">
            <div class="section-title">
              <MessageSquare :size="20" class="icon-blue" />
              <h3>Detailed Feedback</h3>
            </div>
            <textarea 
              v-model="feedback" 
              placeholder="Write your feedback here... We'd love to hear your suggestions or any issues you faced."
              :disabled="loading"
            ></textarea>

            <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
            
            <button class="send-btn" :disabled="loading" @click="handleSubmit">
              <span v-if="loading" class="btn-spinner"></span>
              <Send v-else :size="18" />
              <span>{{ loading ? 'Sending...' : 'Send My Feedback' }}</span>
            </button>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="rate-footer">
        <p>© 2026 TruckMitr Corporate Services Private Limited. All Rights Reserved.</p>
        <div class="footer-links">
          <span>Official Feedback Portal</span>
          <div class="dot"></div>
          <span>v2.4.1</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700&display=swap');

.rate-us-master {
  background-color: #ffffff;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
  overflow-y: auto;
}

.rate-us-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 48px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Header */
.rate-header {
  margin-bottom: 60px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 40px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  margin-bottom: 40px;
  width: fit-content;
  transition: all 0.2s;
}

.back-link:hover {
  color: #0f172a;
  background: #f1f5f9;
  transform: translateX(-4px);
}

.rate-badge {
  display: inline-block;
  background: #eff6ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.header-main h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 42px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  max-width: 600px;
}

/* Body Content */
.rate-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 32px;
  margin-bottom: 80px;
}

.rate-card {
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 32px;
  padding: 40px;
  transition: all 0.3s ease;
}

.rate-card:hover {
  background: #ffffff;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05);
  border-color: #3b82f630;
}

.card-section {
  margin-bottom: 48px;
}

.card-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.section-title h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.icon-blue {
  color: #3b82f6;
}

/* Star Rating */
.stars-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stars-row {
  display: flex;
  gap: 16px;
}

.star-icon {
  cursor: pointer;
  color: #cbd5e1;
  transition: all 0.2s;
}

.star-icon:hover {
  transform: scale(1.1);
  color: #ffc107;
}

.star-icon.active {
  color: #ffc107;
}

.stars-labels {
  display: flex;
  justify-content: space-between;
  width: 320px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

/* Tags */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-btn {
  background: #ffffff;
  border: 1px solid #eef2f6;
  padding: 10px 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.tag-btn.active {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Feedback Card */
.feedback-card {
  display: flex;
  flex-direction: column;
}

textarea {
  flex: 1;
  width: 100%;
  min-height: 180px;
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 24px;
  font-family: inherit;
  font-size: 15px;
  color: #1e293b;
  resize: none;
  margin-bottom: 24px;
  transition: all 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.send-btn {
  background: #1e3a8a;
  color: #ffffff;
  border: none;
  padding: 18px;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
}

.send-btn:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.4);
}

/* Footer (Matching Privacy Spec) */
.rate-footer {
  padding: 40px;
  background: #1e3a8a;
  border-radius: 24px;
  text-align: center;
  color: #ffffff;
}

.rate-footer p {
  font-size: 14px;
  opacity: 0.7;
  margin: 0 0 16px 0;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dot {
  width: 4px;
  height: 4px;
  background: #ffffff;
  border-radius: 50%;
}

/* Success State */
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: #ffffff;
  font-size: 40px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 12px 30px rgba(34, 197, 94, 0.3);
  animation: success-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes success-pop {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.success-state h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.success-state p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  max-width: 400px;
}

/* Error Message */
.error-msg {
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding: 10px 16px;
  background: #fef2f2;
  border-radius: 10px;
  border: 1px solid #fecaca;
}

/* Button States */
.send-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .rate-grid { grid-template-columns: 1fr; }
  .rate-us-container { padding: 40px 24px; }
}

@media (max-width: 768px) {
  .header-main h1 { font-size: 32px; }
  .stars-row { flex-wrap: wrap; }
  .stars-labels { width: 100%; }
}
</style>
