<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeft, FileText, 
  CheckCircle2, Clock, AlertTriangle, 
  Search, Info, Check, Shield, X, History, ChevronDown, ChevronUp
} from 'lucide-vue-next'
import { useAppStore } from '../../../stores/app'
import { useUserStore } from '../../../stores/user'
import { verifyChallan as apiVerifyChallan, fetchChallanHistory } from '../../../services/challan/challanApi'
import type { ChallanHistoryItem } from '../../../services/challan/challanApi'

const emit = defineEmits(['back', 'navigate'])
const appStore = useAppStore()
const userStore = useUserStore()

const vehicleNumber = ref('')
const isLoading = ref(false)
const showInputModal = ref(false)
const apiError = ref('')
const historyData = ref<ChallanHistoryItem[]>([])
const historyLoading = ref(false)
const expandedHistoryId = ref<number | null>(null)

const hasChallanAccess = computed(() =>
  userStore.isTransporter ? userStore.hasTransporter499Plan : userStore.hasPremium
)

onMounted(async () => {
  if (!userStore.subscriptionDetails) {
    await userStore.fetchSubscription()
  }
  if (hasChallanAccess.value) {
    loadChallanHistory()
  }
})

async function loadChallanHistory() {
  historyLoading.value = true
  try {
    historyData.value = await fetchChallanHistory()
  } catch {
    historyData.value = []
  } finally {
    historyLoading.value = false
  }
}

function toggleHistoryExpand(id: number) {
  expandedHistoryId.value = expandedHistoryId.value === id ? null : id
}

function formatHistoryDate(dateStr: string) {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

function getStatusColors(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'pending') return { bg: '#FEE2E2', text: '#DC2626' }
  if (s === 'disposed' || s === 'paid') return { bg: '#DBF4E6', text: '#16A34A' }
  return { bg: '#F1F5F9', text: '#64748B' }
}

const handleCheckChallan = () => {
  if (!hasChallanAccess.value) {
    userStore.setSubscriptionModal({ visible: true, minPrice: 499 })
    appStore.setShowSubscriptionModal(true)
    return
  }
  apiError.value = ''
  showInputModal.value = true
}

const verifyChallan = async () => {
  const num = vehicleNumber.value.trim().toUpperCase()
  if (!num) return

  isLoading.value = true
  apiError.value = ''
  try {
    const results = await apiVerifyChallan(num)
    appStore.challanVerificationVehicleNumber = num
    appStore.challanVerificationResults = results as Record<string, unknown>[]
    showInputModal.value = false
    vehicleNumber.value = ''
    if (hasChallanAccess.value) loadChallanHistory()
    emit('navigate', 'challan-check-result')
  } catch (e) {
    apiError.value = e instanceof Error ? e.message : 'Verification failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="challan-master">
    <div class="web-content-container">

      <!-- Header Area -->
      <header class="page-header">
        <button class="icon-back-btn" @click="emit('back')" title="Go Back">
          <ArrowLeft :size="20" stroke-width="2.5" />
        </button>
        <div class="header-titles">
          <h1 class="main-title">Challan Verification</h1>
          <p class="sub-title">Instantly verify traffic violations and pending challans using live RTO data.</p>
        </div>
      </header>

      <!-- Premium Hero Banner -->
      <div class="premium-hero">
        <div class="hero-content">
          <div class="hero-tag">Live Government Data Check</div>
          <h2>Check pending traffic challans instantly</h2>
          <p>Ensure your vehicles are compliant and free from outstanding penalties. Enter your vehicle number to get a comprehensive history of traffic violations.</p>
        </div>
        <div class="hero-graphic">
          <div class="graphic-circle">
            <FileText :size="56" class="graphic-icon glow" stroke-width="1.5" />
          </div>
        </div>
      </div>

      <!-- Main Web Dashboard Grid -->
      <div class="dashboard-grid">
        
        <!-- How it works Timeline -->
        <div class="dashboard-panel col-span-2">
          <div class="panel-header indigo-line">
            <div class="icon-box indigo-light"><Info :size="18" /></div>
            <h3>How Challan Check Works</h3>
          </div>
          <div class="panel-body">
            <p class="panel-desc">Follow these simple steps to retrieve official traffic records for any commercial vehicle.</p>
            
            <div class="process-steps">
              <div class="step-item">
                <div class="step-circle">1</div>
                <h4>Enter Vehicle Details</h4>
                <p>Provide the valid registration number of the vehicle.</p>
              </div>
              <div class="step-connector"></div>
              <div class="step-item">
                <div class="step-circle">2</div>
                <h4>Initiate Verification</h4>
                <p>Our system securely queries government databases.</p>
              </div>
              <div class="step-connector"></div>
              <div class="step-item">
                <div class="step-circle">3</div>
                <h4>View Detailed Status</h4>
                <p>Get instant results on generated or pending e-challans.</p>
              </div>
            </div>

            <div class="info-alert success-alert">
              <Clock :size="16" class="alert-icon" />
              <span>Verification results are generated in real-time within seconds of submission.</span>
            </div>
          </div>
        </div>

        <!-- Challan History (only for users with 499 plan) -->
        <div v-if="hasChallanAccess" class="dashboard-panel col-span-2 history-panel">
          <div class="panel-header slate-line">
            <div class="icon-box slate-light"><History :size="18" /></div>
            <h3>Challan History</h3>
            <span v-if="historyData.length > 0" class="history-badge">{{ historyData.length }} records</span>
          </div>
          <div class="panel-body">
            <div v-if="historyLoading" class="history-loading">
              <div class="spinner-small"></div>
              <span>Loading history...</span>
            </div>
            <div v-else-if="historyData.length > 0" class="history-list">
              <div
                v-for="item in historyData.slice(0, 5)"
                :key="item.id"
                class="history-card"
                :class="{ expanded: expandedHistoryId === item.id }"
                @click="toggleHistoryExpand(item.id)"
              >
                <div class="history-card-header">
                  <div class="history-card-main">
                    <span class="history-vehicle">{{ item.number || '-' }}</span>
                    <span class="history-offence">{{ item.offense_details || item.offence_details || 'No offence details' }}</span>
                  </div>
                  <div class="history-card-right">
                    <span class="history-status" :style="{ backgroundColor: getStatusColors(item.challan_status || '').bg, color: getStatusColors(item.challan_status || '').text }">
                      {{ item.challan_status || 'pending' }}
                    </span>
                    <ChevronDown v-if="expandedHistoryId !== item.id" :size="18" class="chevron" />
                    <ChevronUp v-else :size="18" class="chevron" />
                  </div>
                </div>
                <div v-if="expandedHistoryId === item.id" class="history-card-expanded">
                  <div class="history-detail"><span class="label">Challan Number</span><span>{{ item.challan_number || '-' }}</span></div>
                  <div class="history-detail"><span class="label">Place</span><span>{{ item.challan_place || '-' }}</span></div>
                  <div class="history-detail"><span class="label">Date & Time</span><span>{{ formatHistoryDate(item.challan_date_time as string) }}</span></div>
                  <div class="history-detail"><span class="label">Accused Name</span><span>{{ item.accused_name || '-' }}</span></div>
                  <div class="history-amount-row">
                    <span class="label">Challan Amount</span>
                    <span class="amount-val">₹{{ (item.amount ? parseFloat(String(item.amount)) : 0).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="history-empty">
              <FileText :size="32" class="empty-icon" />
              <p>No History Found</p>
              <span>Your checked challans will appear here</span>
            </div>
          </div>
        </div>

        <!-- Subscription Status (Horizontal Full Width) -->
        <div class="dashboard-panel col-span-2 subscription-horizontal" :class="{ 'subs-inactive': !hasChallanAccess }">
          <div class="subs-left">
            <div class="icon-box emerald-light"><Check :size="20" /></div>
            <div class="subs-text">
              <h3>Access Requirement</h3>
              <p>{{ hasChallanAccess ? 'Challan Check is included with your active subscription plan.' : 'Subscribe to the ₹499 plan to access Challan Check.' }}</p>
            </div>
          </div>
          <div class="subs-right">
            <div class="plan-tag" :class="hasChallanAccess ? 'tag-green' : 'tag-gray'">
              <CheckCircle2 v-if="hasChallanAccess" :size="18" class="tag-icon" />
              <AlertTriangle v-else :size="18" class="tag-icon" />
              {{ hasChallanAccess ? '₹499 Plan Active' : 'Subscription Required' }}
            </div>
            <div class="warning-alert-small">
               <AlertTriangle :size="14" class="alert-icon-small" /> {{ hasChallanAccess ? 'Ensure subscription remains active' : 'Challan Check requires an active ₹499 plan.' }}
            </div>
          </div>
        </div>

      </div>

      <!-- Data Security Banner (Consent style) -->
      <div class="security-horizontal-banner">
        <div class="security-icon-wrapper">
          <Shield :size="24" stroke-width="2" class="text-slate" />
        </div>
        <div class="security-text">
          <h3>Data Security Focus</h3>
          <p>Your search queries and retrieved documents are highly encrypted. Data is utilized exclusively for verification purposes and is never exposed to third parties.</p>
        </div>
      </div>
    </div>

    <!-- Action Action Footer -->
    <div class="bottom-action-bar">
      <div class="action-container">
        <div class="action-text">
          <h3>Ready to verify challan status?</h3>
          <p>Get instant access to live penalty records.</p>
        </div>
        <button class="brand-btn" @click="handleCheckChallan">
          <Search :size="18" /> Check Vehicle Challan
        </button>
      </div>
    </div>

    <!-- Modal: Input Vehicle Number (Centered) -->
    <div v-if="showInputModal" class="modal-overlay" @click.self="!isLoading && (showInputModal = false)">
      <div class="modal-content-center scale-up">
        <div class="modal-header">
          <h3>Challan Verification</h3>
          <button v-if="!isLoading" class="close-btn-minimal" @click="showInputModal = false">
            <X :size="24" />
          </button>
        </div>

        <div v-if="isLoading" class="loading-state-centered">
          <div class="spinner-large"></div>
          <h4>Verifying details...</h4>
          <p>Please wait, this may take a moment</p>
        </div>

        <div v-else class="input-form-stack">
          <label class="input-label">Enter Vehicle Number</label>
          <input 
            v-model="vehicleNumber" 
            type="text" 
            placeholder="MH12AB1234" 
            class="mobile-input-field"
            style="text-transform: uppercase;"
            maxlength="10"
          />
          <p v-if="apiError" class="error-msg">{{ apiError }}</p>
          
          <div class="info-help-row">
            <Info :size="16" class="info-icon-gray" />
            <p>Please enter the vehicle number correctly</p>
          </div>
          
          <button 
            class="verify-action-btn" 
            :class="{ 'btn-disabled': !vehicleNumber.trim() }"
            :disabled="!vehicleNumber.trim()"
            @click="verifyChallan"
          >
            Verify Challan
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

.challan-master {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  padding: 40px;
  padding-bottom: 120px;
}

.web-content-container {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 8px;
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
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.sub-title {
  margin: 0;
  font-size: 15px;
  color: #64748b;
  max-width: 600px;
}

/* Premium Hero Banner */
.premium-hero {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
  border-radius: 24px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  box-shadow: 0 12px 30px -10px rgba(29, 78, 216, 0.4);
  animation: fadeSlideUp 0.4s ease-out;
  position: relative;
  overflow: hidden;
}

.premium-hero::before {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; width: 60%;
  background: radial-gradient(circle at 100% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 60%);
}

.hero-tag {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
  backdrop-filter: blur(8px);
}

.hero-content { position: relative; z-index: 2; max-width: 540px; }

.hero-content h2 {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero-content p {
  font-size: 16px;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;
}

.hero-graphic {
  position: relative;
  z-index: 2;
  padding-right: 32px;
}

.graphic-circle {
  width: 120px; height: 120px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(12px);
}

.glow { filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.6)); color: #bae6fd; }

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  animation: fadeSlideUp 0.5s ease-out backwards;
  animation-delay: 0.1s;
}

.col-span-2 {
  grid-column: 1 / -1;
}

.dashboard-panel {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.dashboard-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.06);
  border-color: #cbd5e1;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.indigo-line { border-top: 3px solid #6366f1; border-top-left-radius: 20px; border-top-right-radius: 20px; }
.emerald-line { border-top: 3px solid #10b981; border-top-left-radius: 20px; border-top-right-radius: 20px; }
.slate-line { border-top: 3px solid #64748b; border-top-left-radius: 20px; border-top-right-radius: 20px; }

.icon-box {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

.indigo-light { background: #e0e7ff; color: #4f46e5; }
.emerald-light { background: #d1fae5; color: #059669; }
.slate-light { background: #f1f5f9; color: #475569; }

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.panel-body {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-desc {
  margin: 0 0 32px 0;
  font-size: 15px;
  color: #64748b;
  line-height: 1.5;
}

/* Process Timeline (Horizontal) */
.process-steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  text-align: center;
  margin-bottom: 40px;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 48px; height: 48px;
  background: #ffffff;
  border: 2px solid #6366f1;
  color: #4f46e5;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.step-item h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.step-item p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  max-width: 200px;
  line-height: 1.4;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin-top: 24px; /* align with center of circle */
  position: relative;
  z-index: 1;
}

/* Info Alerts */
.info-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  margin-top: auto;
}

.success-alert {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  align-items: center;
}
.success-alert .alert-icon { color: #10b981; }

.warning-alert {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
}
.warning-alert .alert-icon { margin-top: 2px; color: #ea580c; }

.alert-text strong { display: block; margin-bottom: 4px; color: #9a3412; }
.alert-text p { margin: 0; color: #c2410c; }
.mt-4 { margin-top: 24px; }

/* Subscription Horizontal */
.subscription-horizontal {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  background: linear-gradient(to right, #ffffff, #f0fdf4);
  border: 1px solid #bbf7d0;
}
.subs-left { display: flex; align-items: center; gap: 20px; }
.subs-text h3 { margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
.subs-text p { margin: 0; font-size: 15px; color: #475569; }
.subs-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }

.plan-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
}
.tag-green { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.tag-gray { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.tag-icon { margin-top: -1px; }
.subscription-horizontal.subs-inactive { background: linear-gradient(to right, #ffffff, #f8fafc); border-color: #e2e8f0; }

.warning-alert-small {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #b45309; font-weight: 500;
}
.alert-icon-small { color: #ea580c; }

/* Horizontal Security Banner */
.security-horizontal-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03);
  margin-top: -8px; 
}

.security-icon-wrapper {
  background: #f1f5f9;
  width: 64px; height: 64px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.text-slate { color: #475569; }

.security-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.security-text p {
  margin: 0;
  font-size: 15px;
  color: #475569;
  line-height: 1.5;
}

/* Bottom Action Bar */
.bottom-action-bar {
  position: fixed;
  bottom: 0; left: 260px; right: 0; /* assuming 260px sidebar */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  padding: 24px 40px;
  z-index: 20;
}

.action-container {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action-text h3 { margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #0f172a; }
.action-text p { margin: 0; font-size: 14px; color: #64748b; }

.brand-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  padding: 16px 32px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.brand-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .col-span-2 { grid-column: auto; }
  .process-steps { flex-direction: column; gap: 32px; text-align: left;}
  .step-item { flex-direction: row; text-align: left; gap: 16px; align-items: flex-start; }
  .step-circle { margin-bottom: 0; }
  .step-connector { display: none; }
  .bottom-action-bar { left: 0; }
}

@media (max-width: 768px) {
  .challan-master { padding: 24px; padding-bottom: 140px; }
  .premium-hero { flex-direction: column; text-align: center; gap: 32px; padding: 32px 24px; }
  .hero-graphic { padding-right: 0; }
  .bottom-action-bar { padding: 16px 24px; }
  .action-container { flex-direction: column; gap: 16px; text-align: center; }
  .brand-btn { width: 100%; justify-content: center; }
  .subscription-horizontal { flex-direction: column; text-align: center; gap: 24px; }
  .subs-left { flex-direction: column; gap: 12px; }
  .subs-right { align-items: center; width: 100%; }
  .security-horizontal-banner { flex-direction: column; text-align: center; gap: 16px; padding: 24px; }
}

/* Modal / Bottom Sheet Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4); 
  display: flex;
  align-items: center; /* Centered */
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(12px); /* Stronger Blur */
  -webkit-backdrop-filter: blur(12px);
}

.modal-content-center {
  background: #ffffff;
  width: 90%;
  max-width: 460px;
  border-radius: 24px; /* Full rounded corners */
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  position: relative;
}

.scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
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
  color: #001F3F; /* Matching color: '#001F3F' */
}

.close-btn-minimal {
  background: none;
  border: none;
  color: #64748B; /* Matching color: "#64748B" */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.2s;
}

.close-btn-minimal:hover {
  color: #0f172a;
}

/* Loading State */
.loading-state-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  text-align: center;
}

.spinner-large {
  width: 48px; height: 48px;
  border: 4px solid #f1f5f9;
  border-top-color: #2563eb; /* Matching colors.royalBlue */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-state-centered h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #001F3F;
}

.loading-state-centered p {
  margin: 0;
  font-size: 14px;
  color: #64748B;
}

/* Input Form Stack */
.input-form-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-label {
  font-size: 14px;
  color: #334155; /* Matching color: '#334155' */
  font-weight: 500;
}

.mobile-input-field {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #E2E8F0; /* Matching borderColor: '#E2E8F0' */
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #001F3F;
  background: #F8FAFC; /* Matching backgroundColor: '#F8FAFC' */
  outline: none;
  transition: all 0.2s;
}

.mobile-input-field:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.info-help-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 20px;
}

.info-icon-gray {
  color: #64748B;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-help-row p {
  margin: 0;
  font-size: 13px;
  color: #64748B;
  line-height: 1.5;
}

.verify-action-btn {
  width: 100%;
  padding: 16px;
  background: #2563eb; /* Matching colors.royalBlue */
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-action-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-disabled {
  background: #CBD5E1 !important; /* Matching color: '#CBD5E1' */
  cursor: not-allowed;
}

.error-msg { font-size: 14px; color: #dc2626; margin: 8px 0; font-weight: 500; }

/* History panel */
.history-panel .panel-header { display: flex; align-items: center; gap: 12px; }
.history-badge { background: #EFF6FF; color: #2563eb; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-left: auto; }
.history-loading { display: flex; align-items: center; gap: 12px; padding: 24px; color: #64748b; }
.spinner-small { width: 24px; height: 24px; border: 2px solid #f1f5f9; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; }
.history-card:hover { border-color: #cbd5e1; }
.history-card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; }
.history-card-main { flex: 1; min-width: 0; }
.history-vehicle { font-size: 16px; font-weight: 700; color: #0f172a; display: block; }
.history-offence { font-size: 14px; color: #64748b; display: block; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.history-status { padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
.chevron { color: #94a3b8; }
.history-card-expanded { padding: 16px; background: #fafbfc; border-top: 1px solid #f1f5f9; }
.history-detail { margin-bottom: 12px; }
.history-detail .label { font-size: 13px; color: #64748b; display: block; margin-bottom: 2px; }
.history-detail span:last-child { font-size: 15px; font-weight: 600; color: #334155; }
.history-amount-row { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; border-radius: 8px; margin-top: 12px; }
.history-amount-row .label { font-size: 14px; color: #64748b; }
.history-amount-row .amount-val { font-size: 18px; font-weight: 700; color: #0f172a; }
.history-empty { padding: 32px; text-align: center; color: #64748b; }
.history-empty .empty-icon { color: #94a3b8; margin-bottom: 12px; }
.history-empty p { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #334155; }
.history-empty span { font-size: 14px; }

</style>
