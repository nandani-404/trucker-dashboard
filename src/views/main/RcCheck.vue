<script setup lang="ts">
import { ref } from 'vue'
import { 
  ArrowLeft, Car, CheckCircle2, Clock, Search, 
  ShieldCheck, AlertCircle, X
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

// State
const rcNumber = ref('')
const isLoading = ref(false)
const showInputModal = ref(false)
const showSubscriptionModal = ref(false)
const isSubscriptionActive = ref(true) // Assumed active for demo


const handleCheckRc = () => {
  if (isSubscriptionActive.value) {
    showInputModal.value = true
  } else {
    showSubscriptionModal.value = true
  }
}

const verifyRc = () => {
  if (!rcNumber.value.trim()) return

  isLoading.value = true
  // Mock API Call
  setTimeout(() => {
    isLoading.value = false
    showInputModal.value = false
    emit('navigate', 'rc-check-result')
    rcNumber.value = ''
  }, 1500)
}


</script>

<template>
  <div class="rc-master">
    <div class="web-content-container">

      <!-- Header Area -->
      <header class="page-header">
        <button class="icon-back-btn" @click="emit('back')" title="Go Back">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-titles">
          <h1 class="main-title">Vehicle RC Check</h1>
          <p class="sub-title">Verify vehicle registration details instantly and securely.</p>
        </div>
      </header>

        <!-- Top Hero Banner -->
        <div class="support-banner">
          <div class="banner-content">
            <div class="banner-tag">Instant Verification</div>
            <h2>Verify vehicle RC details instantly by entering your vehicle number</h2>
            <p>Ensure safety and compliance for your operations with live government data checks.</p>
          </div>
          <div class="banner-graphic">
             <Car :size="64" class="graphic-icon glow" />
          </div>
        </div>
        
        <!-- Info Grid Layout -->
        <div class="info-grid">
          
          <div class="info-card hover-lift">
            <div class="card-icon blue-bg"><ShieldCheck :size="24" /></div>
            <h3>What is RC Check?</h3>
            <p>Check your vehicle RC details instantly by entering your vehicle number. Live RTO data sync ensures full accuracy.</p>
            <div class="sub-note">
              <ShieldCheck :size="16" class="note-icon" />
              <span>Available for transporters with an active TruckMitr subscription.</span>
            </div>
          </div>

          <div class="info-card hover-lift timeline-card">
            <div class="card-icon indigo-bg"><Clock :size="24" /></div>
            <h3>How it works</h3>
            <div class="step-list">
              <div class="step">
                <div class="step-num">1</div>
                <div class="step-text">Enter vehicle number</div>
              </div>
              <div class="step">
                <div class="step-num">2</div>
                <div class="step-text">Start verification</div>
              </div>
              <div class="step">
                <div class="step-num">3</div>
                <div class="step-text">Get instant RTO details</div>
              </div>
            </div>
          </div>

          <div class="info-card hover-lift subscription-card">
            <div class="subs-left">
              <div class="card-icon green-bg"><CheckCircle2 :size="24" /></div>
              <div class="subs-text">
                <h3>Subscription Status</h3>
                <p>Your account has active access to RC verification.</p>
              </div>
            </div>
            <div class="subs-right">
              <div class="plan-tag green-tag">
                <CheckCircle2 :size="18" /> ₹499 Plan Active
              </div>
              <div class="subs-warning">
                <AlertCircle :size="14" /> Maintain an active subscription to keep access.
              </div>
            </div>
          </div>
        </div>

        <!-- Horizontal Data Security Banner -->
        <div class="security-banner hover-lift">
          <div class="card-icon gray-bg"><ShieldCheck :size="24" /></div>
          <div class="security-content">
            <h3>Data Security Focus</h3>
            <p>Your data is processed securely via encrypted channels and used solely for Government verification.</p>
          </div>
        </div>

      </div>

    <!-- Sticky Bottom Action Footer -->
    <div class="action-footer">
      <div class="footer-container">
        <div class="footer-text">
          <h3>Ready to verify a vehicle?</h3>
          <p>Get instant access to live RTO details</p>
        </div>
        <button class="btn-primary massive-btn" @click="handleCheckRc">
          <Search :size="20" /> Check Vehicle RC Now
        </button>
      </div>
    </div>

    <!-- Modal: Input RC Number -->
    <div v-if="showInputModal" class="modal-overlay" @click.self="!isLoading && (showInputModal = false)">
      <div class="modal-content slide-up">
        <div class="modal-header">
          <h3>Vehicle RC Verification</h3>
          <button v-if="!isLoading" class="close-btn" @click="showInputModal = false">
            <X :size="20" />
          </button>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <h4>Verifying RC details...</h4>
          <p>Please wait, accessing live RTO databases.</p>
        </div>

        <div v-else class="input-state">
          <label>Enter Vehicle Number</label>
          <div class="input-wrapper">
            <input 
              v-model="rcNumber" 
              type="text" 
              placeholder="e.g. MH12AB1234" 
              class="rc-input"
              style="text-transform: uppercase;"
              maxlength="10"
            />
          </div>
          <p class="input-hint"><AlertCircle :size="14" /> Please enter the vehicle number correctly</p>
          
          <button 
            class="btn-primary full-btn" 
            :disabled="!rcNumber.trim()"
            @click="verifyRc"
          >
            Verify RC
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.rc-master {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  position: relative;
  padding: 40px;
  padding-bottom: 120px;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
  flex-shrink: 0;
}

.icon-back-btn {
  width: 44px; height: 44px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  margin-top: 4px; 
}

.icon-back-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
  transform: translateX(-2px);
}

.main-title {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.sub-title {
  margin: 0;
  font-size: 15px;
  color: #64748b;
}

/* Content Area */
.web-content-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}



/* Support Banner Header */
.support-banner {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  box-shadow: 0 10px 30px -10px rgba(29, 78, 216, 0.3);
  animation: fadeSlideUp 0.4s ease-out;
  position: relative;
  overflow: hidden;
}

.support-banner::before {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; width: 50%;
  background: radial-gradient(circle at 100% 50%, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.banner-tag {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
  backdrop-filter: blur(4px);
}

.banner-content { position: relative; z-index: 2; }

.banner-content h2 {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
  max-width: 500px;
  line-height: 1.3;
}

.banner-content p {
  font-size: 15px;
  color: #bfdbfe;
  line-height: 1.5;
  margin: 0;
  max-width: 500px;
}

.banner-graphic {
  background: rgba(255,255,255,0.1);
  padding: 24px;
  border-radius: 24px;
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 2;
}

.graphic-icon {
  color: #ffffff;
}
.glow { filter: drop-shadow(0 0 12px rgba(255,255,255,0.5)); }

/* Grid Layout */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
  animation: fadeSlideUp 0.5s ease-out backwards;
  animation-delay: 0.1s;
}

.info-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.info-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: transparent;
  transition: background 0.4s;
}

.hover-lift:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px -8px rgba(0,0,0,0.08);
  border-color: #cbd5e1;
}

.hover-lift:hover::after {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.card-icon {
  width: 56px; height: 56px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px;
}

.blue-bg { background: #eff6ff; color: #2563eb; }
.indigo-bg { background: #eef2ff; color: #4f46e5; }
.green-bg { background: #f0fdf4; color: #16a34a; }
.gray-bg { background: #f1f5f9; color: #475569; }

.info-card h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.info-card p {
  margin: 0 0 16px 0;
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
}

.sub-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
  margin-top: auto;
}
.note-icon { color: #94a3b8; flex-shrink: 0; margin-top: 2px; }

/* Timeline */
.step-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.step {
  display: flex;
  align-items: center;
  gap: 16px;
}
.step-num {
  width: 36px; height: 36px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px;
  flex-shrink: 0;
}
.step-text {
  font-size: 16px; color: #334155; font-weight: 600;
}

/* Subscription tags */
.plan-tag {
  display: inline-flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  padding: 10px 20px; border-radius: 20px;
  font-weight: 600; color: #0f172a; font-size: 15px;
  margin-bottom: 20px;
}
.warning-box {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff7ed; padding: 16px; border-radius: 12px;
  border-left: 4px solid #f97316;
  font-size: 14px; color: #9a3412; font-weight: 500; line-height: 1.4;
  margin-top: auto;
}

/* Subscription Full Width Card */
.subscription-card {
  grid-column: 1 / -1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  background: linear-gradient(to right, #ffffff, #f0fdf4);
  border: 1px solid #bbf7d0;
}

.subscription-card::after {
  display: none; /* remove default underline gradient */
}

.subs-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.subs-left .card-icon {
  margin-bottom: 0;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #dcfce7;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);
}

.subs-text h3 { margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
.subs-text p { margin: 0; font-size: 15px; color: #475569; }

.subs-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.green-tag {
  background: #dcfce7 !important;
  color: #166534 !important;
  border: 1px solid #bbf7d0 !important;
  margin-bottom: 0 !important;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.15);
}

.subs-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #b45309;
  font-size: 13px;
  font-weight: 500;
}

/* Horizontal Security Banner */
.security-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.security-banner::after {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0; width: 4px;
  background: transparent;
  transition: background 0.4s;
}

.security-banner:hover::after {
  background: linear-gradient(180deg, #475569, #cbd5e1);
}

.security-banner .card-icon {
  margin-bottom: 0;
  flex-shrink: 0;
  width: 64px; height: 64px;
  border-radius: 16px;
}

.security-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.security-content p {
  margin: 0;
  font-size: 15px;
  color: #475569;
  line-height: 1.5;
}

/* Footer Actions */
.action-footer {
  position: fixed;
  bottom: 0;
  left: 260px; /* align to right panel assuming sidebar is 260px */
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  padding: 24px 40px;
  box-shadow: 0 -10px 30px -10px rgba(0,0,0,0.05);
  z-index: 20;
}

.footer-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-text h3 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
.footer-text p { margin: 0; font-size: 15px; color: #64748b; }

.massive-btn {
  font-size: 16px !important;
  padding: 16px 36px !important;
  border-radius: 16px !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.massive-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.4);
}


/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}

.btn-primary:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.full-btn { width: 100%; }

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: #ffffff;
  width: 90%;
  max-width: 440px;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}

.slide-up {
  animation: modalSlideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}
.close-btn:hover { background: #e2e8f0; color: #0f172a; }

.input-state label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 8px;
}

.rc-input {
  width: 100%;
  padding: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: all 0.2s;
  font-family: monospace;
  letter-spacing: 1px;
}

.rc-input:focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  margin: 12px 0 24px 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  text-align: center;
}

.spinner {
  width: 48px; height: 48px;
  border: 4px solid #eff6ff;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-state h4 { margin: 0 0 8px 0; font-size: 18px; color: #0f172a; }
.loading-state p { margin: 0; font-size: 14px; color: #64748b; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
  .subscription-card { flex-direction: column; align-items: flex-start; gap: 24px; }
  .subs-left { flex-direction: column; align-items: flex-start; gap: 16px; }
  .subs-right { align-items: flex-start; width: 100%; }
  .support-banner { flex-direction: column; text-align: center; gap: 24px; }
  .support-banner::before { display: none; }
  .security-banner { flex-direction: column; text-align: center; gap: 16px; padding: 24px; }
  .action-footer { left: 0; padding: 20px 24px; }
  .footer-container { flex-direction: column; gap: 16px; text-align: center; }
  .massive-btn { width: 100%; }
  .rc-master { padding: 24px; padding-bottom: 200px; }
}
</style>
