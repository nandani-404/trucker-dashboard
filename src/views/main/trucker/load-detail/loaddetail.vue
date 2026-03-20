<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeft, MapPin, Truck, Box, 
  Calendar, Clock, AlertCircle, 
  CheckCircle2, Info, Send, X,
  Loader2
} from 'lucide-vue-next'
import { apiPost, END_POINTS } from '../../../../services/config/api'

// Define Props
const props = defineProps({
  loadData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['back', 'bid-success'])

// State
const showBidModal = ref(false)
const bidAmount = ref('')
const remarks = ref('')
const isSubmitting = ref(false)
const submissionError = ref('')
const submissionSuccess = ref(false)

// Computed
const load = computed(() => props.loadData || {})
const isBooked = computed(() => {
  const status = (load.value.status || '').toLowerCase().replace(/[\s_-]+/g, '')
  return status === 'booked'
})
const isExpired = computed(() => {
  return load.value.expiring_at === 'closed' || load.value.exact_expiring_at === '0'
})
const isBidDisabled = computed(() => isBooked.value || isExpired.value)
const disabledLabel = computed(() => isBooked.value ? 'Already Booked' : 'Load Expired')

// Formatters
const formatPrice = (price: any) => {
  if (!price || isNaN(parseFloat(price))) return 'N/A'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(parseFloat(price))
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Not Specified'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr || 'N/A'
  }
}

const getTimeAgo = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  try {
    const now = new Date()
    const created = new Date(dateStr)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHrs = Math.floor(diffMins / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    const diffDays = Math.floor(diffHrs / 24)
    return `${diffDays}d ago`
  } catch {
    return 'Recently'
  }
}

// Actions
const handleBid = async () => {
  if (!bidAmount.value || parseFloat(bidAmount.value) <= 0) {
    submissionError.value = 'Please enter a valid bid amount'
    return
  }

  isSubmitting.value = true
  submissionError.value = ''
  
  try {
    const payload = {
      load_id: load.value.id,
      shipper_id: load.value.user_id || load.value.user?.id,
      trucker_price: parseFloat(bidAmount.value),
      remarks: remarks.value.trim() || undefined,
    }

    const response: any = await apiPost(END_POINTS.TRUCKER_APPLY_LOAD, payload)
    
    if (response?.status === 'success' || response?.status === 200) {
      submissionSuccess.value = true
      // Clear inputs like in RN code
      bidAmount.value = ''
      remarks.value = ''
      
      setTimeout(() => {
        showBidModal.value = false
        emit('bid-success', load.value.id)
        emit('back')
      }, 1500)
    } else {
      submissionError.value = response?.message || 'Submission failed. Please try again.'
    }
  } catch (error: any) {
    // Ported robust error handling from RN code
    const status = error?.status || error?.response?.status
    const msg = error?.message || error?.response?.data?.message || 'Failed to submit bid. Please try again.'

    if (status === 429) {
      // Daily bid limit reached
      submissionError.value = msg
      setTimeout(() => {
        showBidModal.value = false
        bidAmount.value = ''
        remarks.value = ''
      }, 2000)
    } else {
      submissionError.value = msg
    }
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  if (!isSubmitting.value) {
    showBidModal.value = false
    submissionError.value = ''
    submissionSuccess.value = false
  }
}
onMounted(() => {
  // Try both window and specific element scroll to ensure top position
  window.scrollTo(0, 0)
  const topEl = document.getElementById('load-detail-top')
  if (topEl) {
    topEl.scrollIntoView({ behavior: 'instant', block: 'start' })
  }
})
</script>

<template>
  <div class="load-detail-wrapper">
    <div class="load-detail-screen" v-if="load.id">
      <!-- Premium Header -->
      <header id="load-detail-top" class="detail-header">
        <div class="header-left">
          <button class="btn-back" @click="emit('back')">
            <ArrowLeft :size="20" />
          </button>
          <div class="id-badge-container">
            <h1 class="load-title">Load ID: {{ load.load_id || load.id }}</h1>
            <div class="status-indicator" :class="{ 'is-booked': isBooked, 'is-closed': isExpired }">
              <span class="pulse-dot"></span>
              {{ load.status || 'Active' }}
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="posted-info">
            <span class="label">Posted By</span>
            <span class="value">{{ load.unique_id || 'TM2506DLSH30031' }}</span>
          </div>
          <div class="divider"></div>
          <div class="posted-info">
            <Clock :size="14" />
            <span>{{ getTimeAgo(load.created_at) }}</span>
          </div>
        </div>
      </header>

      <main class="detail-content">
        <div class="content-grid">
          <!-- Main Info Columns -->
          <div class="main-column">
            <!-- Route Section -->
            <section class="info-card route-card animate-slide-up">
              <div class="card-header">
                <MapPin :size="20" class="icon-accent" />
                <h3>Journey Route</h3>
              </div>
              <div class="route-viz">
                <div class="route-line-connector">
                  <div class="dot start"></div>
                  <div class="line"></div>
                  <div class="dot end"></div>
                </div>
                <div class="route-details">
                  <div class="location-group origin">
                    <div class="loc-meta">PICKUP ORIGIN</div>
                    <div class="city">{{ load.origin_location }}</div>
                    <div class="exact" v-if="load.exact_origin_location">{{ load.exact_origin_location }}</div>
                  </div>
                  <div class="location-group destination">
                    <div class="loc-meta">DROP OFF DESTINATION</div>
                    <div class="city">{{ load.destination_location }}</div>
                    <div class="exact" v-if="load.exact_destination_location">{{ load.exact_destination_location }}</div>
                  </div>
                </div>
              </div>
            </section>

            <div class="info-row">
              <!-- Material Details -->
              <section class="info-card material-card animate-slide-up" style="animation-delay: 0.1s">
                <div class="card-header">
                  <Box :size="20" class="icon-accent" />
                  <h3>Cargo Description</h3>
                </div>
                <div class="spec-grid">
                  <div class="spec-item">
                    <span class="label">Material Type</span>
                    <span class="value">{{ load.meterial || 'N/A' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="label">Material Quantity</span>
                    <span class="value">{{ load.meterial_quantity ? `${load.meterial_quantity} Ton` : 'N/A' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="label">Load Quantity</span>
                    <span class="value">{{ load.load_qty ? `${load.load_qty} Ton` : 'N/A' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="label">ODC Requirement</span>
                    <span class="value status-pill" :class="{ 'yes': load.odc === 'Yes' }">{{ load.odc || 'No' }}</span>
                  </div>
                </div>
              </section>

              <!-- Vehicle Requirements -->
              <section class="info-card vehicle-card animate-slide-up" style="animation-delay: 0.2s">
                <div class="card-header">
                  <Truck :size="20" class="icon-accent" />
                  <h3>Vehicle Requirement</h3>
                </div>
                <div class="spec-grid">
                  <div class="spec-item">
                    <span class="label">Body Type</span>
                    <span class="value">{{ load.vechicle_body || 'N/A' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="label">Vehicle Type</span>
                    <span class="value">{{ load.vechicle_type || 'N/A' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="label">Container Size</span>
                    <span class="value">{{ load.container_feet || 'N/A' }}</span>
                  </div>
                  <div class="spec-item">
                    <span class="label">Vehicle Length</span>
                    <span class="value">{{ load.vehicle_length || 'N/A' }}</span>
                  </div>
                </div>
              </section>
            </div>

            <!-- Schedule -->
            <section class="info-card schedule-card animate-slide-up" style="animation-delay: 0.3s">
              <div class="card-header">
                <Calendar :size="20" class="icon-accent" />
                <h3>Pickup Schedule</h3>
              </div>
              <div class="schedule-body">
                <div class="schedule-item">
                  <div class="icon-box"><Calendar :size="18" /></div>
                  <div class="text">
                    <span class="label">Pickup Date</span>
                    <span class="value">{{ formatDate(load.picup_date) }}</span>
                  </div>
                </div>
                <div class="divider-v"></div>
                <div class="schedule-item">
                  <div class="icon-box"><Clock :size="18" /></div>
                  <div class="text">
                    <span class="label">Load Time</span>
                    <span class="value">{{ load.load_time || 'General Shift' }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Sticky Sidebar -->
          <div class="sidebar-column">
            <!-- Pricing Card -->
            <div class="pricing-card animate-slide-up" style="animation-delay: 0.4s">
              <h3>Estimated Pricing</h3>
              <div class="pricing-stats">
                <div class="price-row">
                  <div class="price-info">
                    <span class="label">Advance Price</span>
                    <span class="sub">Paid at pickup</span>
                  </div>
                  <span class="amount advance">{{ formatPrice(load.adv_price) }}</span>
                </div>
                <div class="price-row highlight">
                  <div class="price-info">
                    <span class="label">Settled Price</span>
                    <span class="sub">Final contract price</span>
                  </div>
                  <span class="amount total">{{ formatPrice(load.setteled_price) }}</span>
                </div>
                <div class="price-row sub-row" v-if="load.setteled_by">
                  <div class="price-info">
                    <span class="label">Settled By</span>
                  </div>
                  <span class="settler-value">{{ load.setteled_by }}</span>
                </div>
              </div>

              <!-- Action Button -->
              <button 
                class="btn-bid-main" 
                :disabled="isBidDisabled" 
                @click="showBidModal = true"
              >
                <template v-if="!isBidDisabled">
                  <Send :size="18" />
                  <span>Place Your Bid</span>
                </template>
                <template v-else>
                  <AlertCircle :size="18" />
                  <span>{{ disabledLabel }}</span>
                </template>
              </button>
              <p class="bid-tip" v-if="!isBidDisabled">
                <Info :size="12" />
                Quoting higher than average might delay selection.
              </p>
            </div>
          </div>
        </div>
      </main>

      <!-- Modal Implementation -->
      <transition name="modal-bounce">
        <div v-if="showBidModal" class="bid-modal-overlay" @click.self="closeModal">
          <div class="bid-modal-sheet">
            <div class="modal-header">
              <h3>Submit Quotation</h3>
              <button class="btn-close" @click="closeModal"><X :size="20" /></button>
            </div>
            
            <div class="modal-body">
              <div v-if="submissionSuccess" class="success-screen">
                <div class="confetti-check">
                  <CheckCircle2 :size="64" color="#059669" />
                </div>
                <h4>Bid Submitted!</h4>
                <p>Your offer has been sent to the shipper. Redirecting you...</p>
              </div>

              <template v-else>
                <div class="bid-info">
                  <span class="load-id-label">Quoting for {{ load.load_id || load.id }}</span>
                  <p>Express your interest by proposing a competitive rate.</p>
                </div>

                <div class="input-group">
                  <label>Your Proposed Price (₹)</label>
                  <div class="price-input-wrapper" :class="{ 'error': submissionError && !bidAmount }">
                    <span class="currency-symbol">₹</span>
                    <input 
                      type="number" 
                      v-model="bidAmount" 
                      placeholder="Enter bid amount"
                      :disabled="isSubmitting"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label>Additional Remarks <span class="optional">(Optional)</span></label>
                  <textarea 
                    v-model="remarks" 
                    placeholder="e.g. Can deliver by tomorrow, 10+ years experience..."
                    rows="3"
                    :disabled="isSubmitting"
                  ></textarea>
                </div>

                <div v-if="submissionError" class="error-msg">
                  <AlertCircle :size="16" />
                  <span>{{ submissionError }}</span>
                </div>

                <div class="modal-footer">
                  <button class="btn-cancel" @click="closeModal" :disabled="isSubmitting">Cancel</button>
                  <button 
                    class="btn-submit-bid" 
                    @click="handleBid" 
                    :disabled="isSubmitting || !bidAmount"
                  >
                    <Loader2 v-if="isSubmitting" class="animate-spin" :size="18" />
                    <span v-else>Confirm & Submit Bid</span>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </div>
    
    <div v-else class="empty-state">
      <Loader2 class="animate-spin" :size="32" />
      <p>Loading load details...</p>
    </div>
  </div>
</template>

<style scoped>
.load-detail-wrapper {
  background: #ffffff;
  min-height: 100vh;
}

.load-detail-screen {
  color: #0f172a;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
}

/* Premium Header */
.detail-header {
  padding: 42px 40px 28px 24px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-back {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateX(-2px);
}

.id-badge-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.load-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: #ecfdf5;
  color: #059669;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  width: fit-content;
}

.status-indicator.is-booked { background: #fef2f2; color: #dc2626; }
.status-indicator.is-closed { background: #f1f5f9; color: #64748b; }

.pulse-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 32px;
}

.posted-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.posted-info .label { color: #94a3b8; font-weight: 500; }
.posted-info .value { color: #334155; font-weight: 700; }

.posted-info:last-child {
  color: #64748b;
  font-weight: 600;
}

.divider { width: 1.5px; height: 32px; background: #e2e8f0; }

/* Main Content */
.detail-content {
  flex: 1;
  padding: 40px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 40px;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.info-card:hover { border-color: #d1d9e6; }

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #475569;
}

.icon-accent { color: #2563eb; }

/* Route Viz */
.route-viz {
  display: flex;
  gap: 32px;
  padding: 8px 0;
}

.route-line-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.dot.start { background: #10b981; border: 3px solid #d1fae5; }
.dot.end { background: #ef4444; border: 3px solid #fee2e2; }
.line { width: 2px; flex: 1; background: #e2e8f0; margin: 4px 0; border-style: dashed; }

.route-details { flex: 1; display: flex; flex-direction: column; gap: 40px; }

.location-group .loc-meta { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 6px; }
.location-group .city { font-size: 20px; font-weight: 800; color: #0f172a; }
.location-group .exact { font-size: 14px; color: #64748b; margin-top: 4px; }

/* Spec Grids */
.info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.spec-item { display: flex; flex-direction: column; gap: 6px; }
.spec-item .label { font-size: 12px; color: #94a3b8; font-weight: 600; }
.spec-item .value { font-size: 15px; color: #1e293b; font-weight: 700; }

.status-pill { padding: 4px 10px; background: #f1f5f9; border-radius: 6px; width: fit-content; }
.status-pill.yes { background: #dcfce7; color: #15803d; }

/* Schedule Body */
.schedule-body { display: flex; align-items: center; gap: 40px; }
.schedule-item { display: flex; align-items: center; gap: 16px; }
.schedule-item .icon-box { width: 44px; height: 44px; border-radius: 12px; background: #eff6ff; color: #2563eb; display: flex; justify-content: center; align-items: center; }
.schedule-item .text { display: flex; flex-direction: column; }
.schedule-item .label { font-size: 12px; color: #94a3b8; font-weight: 600; }
.schedule-item .value { font-size: 16px; font-weight: 800; }
.divider-v { width: 1.5px; height: 40px; background: #e2e8f0; }

/* Pricing Card */
.sidebar-column { position: sticky; top: 110px; display: flex; flex-direction: column; gap: 24px; }

.pricing-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.pricing-card h3 { font-size: 18px; font-weight: 800; margin-bottom: 24px; }

.pricing-stats { display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; }

.price-row { display: flex; justify-content: space-between; align-items: center; }
.price-row.highlight { padding-top: 20px; border-top: 1.5px solid #f1f5f9; }

.price-info { display: flex; flex-direction: column; }
.price-info .label { font-size: 13px; font-weight: 600; color: #64748b; }
.price-info .sub { font-size: 11px; color: #94a3b8; }

.amount { font-size: 18px; font-weight: 800; color: #1e293b; }
.amount.total { font-size: 24px; color: #2563eb; }

.price-row.sub-row {
  margin-top: 12px;
}

.settler-value {
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
}

/* Buttons */
.btn-bid-main {
  width: 100%;
  padding: 18px;
  border-radius: 16px;
  background: #2563eb;
  color: white;
  border: none;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none;
}

.btn-bid-main:hover:not(:disabled) { 
  background: #1e40af; 
}
.btn-bid-main:active:not(:disabled) { transform: translateY(0); }
.btn-bid-main:disabled { background: #f1f5f9; color: #94a3b8; box-shadow: none; cursor: not-allowed; border: 1.5px solid #e2e8f0; }

.bid-tip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; margin-top: 16px; text-align: center; justify-content: center; }

/* Modal Styles */
.bid-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 20px; }

.bid-modal-sheet { background: white; width: 100%; max-width: 520px; border-radius: 28px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.2); }

.modal-header { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { font-size: 18px; font-weight: 800; }
.btn-close { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f1f5f9; cursor: pointer; display: flex; justify-content: center; align-items: center; color: #64748b; transition: all 0.2s; }
.btn-close:hover { background: #fee2e2; color: #ef4444; }

.modal-body { padding: 32px; }

.bid-info { margin-bottom: 24px; padding: 16px; background: #eff6ff; border-radius: 16px; }
.load-id-label { font-size: 12px; font-weight: 800; color: #2563eb; text-transform: uppercase; }
.bid-info p { font-size: 14px; color: #334155; margin-top: 4px; font-weight: 600; }

.input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.input-group label { font-size: 14px; font-weight: 700; color: #475569; }
.optional { font-weight: 400; color: #94a3b8; font-size: 12px; }

.price-input-wrapper { display: flex; align-items: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 0 20px; height: 64px; transition: all 0.2s; }
.price-input-wrapper:focus-within { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
.price-input-wrapper.error { border-color: #ef4444; }

.currency-symbol { font-size: 24px; font-weight: 800; color: #0f172a; margin-right: 12px; }
.price-input-wrapper input { flex: 1; height: 100%; border: none; background: transparent; font-size: 24px; font-weight: 800; outline: none; }

textarea { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px; font-size: 15px; font-family: inherit; resize: none; transition: all 0.2s; }
textarea:focus { border-color: #2563eb; background: white; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

.error-msg { display: flex; align-items: center; gap: 8px; color: #ef4444; font-size: 14px; font-weight: 600; margin-bottom: 20px; }

.modal-footer { display: flex; gap: 16px; margin-top: 8px; }
.btn-cancel { flex: 1; padding: 16px; border-radius: 14px; border: 2px solid #e2e8f0; background: white; font-weight: 700; cursor: pointer; }
.btn-submit-bid { flex: 2; padding: 16px; border-radius: 14px; background: #2563eb; color: white; border: none; font-weight: 800; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 8px 20px -5px rgba(37, 99, 235, 0.3); }
.btn-submit-bid:disabled { opacity: 0.6; cursor: not-allowed; }

.success-screen { text-align: center; padding: 20px 0; }
.confetti-check { margin-bottom: 24px; animation: scale-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes scale-bounce { 0% { opacity: 0; transform: scale(0); } 70% { transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
.success-screen h4 { font-size: 24px; font-weight: 800; margin-bottom: 12px; }
.success-screen p { color: #64748b; font-weight: 500; }

/* Animations */
.animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

.modal-bounce-enter-active { animation: modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-bounce-leave-active { animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) reverse; }
@keyframes modal-in { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: #94a3b8; gap: 16px; }

/* Responsive */
@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; gap: 32px; }
  .sidebar-column { position: static; }
}

@media (max-width: 640px) {
  .detail-header { padding: 16px 20px; }
  .detail-content { padding: 20px; }
  .header-right { display: none; }
  .info-row { grid-template-columns: 1fr; }
  .pricing-card { padding: 24px; }
  .load-title { font-size: 18px; }
  .city { font-size: 18px; }
}
</style>
