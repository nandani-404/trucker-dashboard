<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Scale,
  MapPin,
  CheckCircle,
  Lock,
  PhoneCall,
  ArrowRight,
  X,
  Loader2,
  History,
  Check
} from 'lucide-vue-next'
import {
  fetchUnverifiedDrivers,
  fetchVerificationStatus,
  createVerificationOrder,
  submitBulkVerification,
  getDriverImageUrl,
  type Driver,
  type Payment,
} from '../../../services/verification/verificationApi'
import { apiGet } from '../../../services/config/api'
import { END_POINTS, STATICS } from '../../../services/config/api'
import { cleanupRazorpayOverlay } from '../../../utils/razorpayCleanup'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const emit = defineEmits(['back', 'navigate'])

const drivers = ref<Driver[]>([])
const selectedDriverIds = ref<Set<string>>(new Set())
const loading = ref(false)
const showDriverModal = ref(false)
const showHistoryModal = ref(false)
const paymentHistory = ref<Payment[]>([])
const startingVerification = ref(false)
const paymentLoading = ref(false)

const pricePerDriver = computed(() =>
  selectedDriverIds.value.size >= 10 ? 826 : 1180
)
const totalAmount = computed(
  () => selectedDriverIds.value.size * pricePerDriver.value
)

const toggleDriver = (id: string) => {
  const next = new Set(selectedDriverIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedDriverIds.value = next
}

const isSelected = (id: string) => selectedDriverIds.value.has(id)

const fetchDrivers = async () => {
  loading.value = true
  try {
    drivers.value = await fetchUnverifiedDrivers()
  } catch (e) {
    console.error('Fetch drivers error:', e)
    drivers.value = []
  } finally {
    loading.value = false
  }
}

const loadRazorpay = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.body.appendChild(script)
  })
}

const handleVerify = () => {
  showDriverModal.value = true
  fetchDrivers()
}

const handleProceedToPayment = async () => {
  if (selectedDriverIds.value.size === 0) {
    alert('Please select at least one driver.')
    return
  }
  startingVerification.value = true
  paymentLoading.value = true
  try {
    const driverIds = Array.from(selectedDriverIds.value)
    const amount = totalAmount.value

    const orderRes = await createVerificationOrder({
      driver_ids: driverIds,
      amount,
    })
    const orderId = orderRes?.order_id || orderRes?.id
    if (!orderId || orderId === 'undefined') {
      throw new Error('Failed to create payment order')
    }

    let profileMobile = ''
    let profileName = ''
    let profileEmail = ''
    try {
      const profileRes = await apiGet<{ status?: boolean; data?: Record<string, unknown> }>(
        END_POINTS.GET_PROFILE
      )
      if (profileRes?.status && (profileRes as { data?: Record<string, unknown> }).data) {
        const p = (profileRes as { data: Record<string, unknown> }).data
        profileMobile = String(p?.mobile ?? p?.mobile_number ?? '').replace(/\D/g, '')
        profileName = String(p?.name ?? p?.name_eng ?? '')
        profileEmail = String(p?.email ?? '')
      }
    } catch {
      /* fallback */
    }

    const digits = profileMobile.length >= 10 ? profileMobile.slice(-10) : profileMobile
    const contact = digits.length === 10 ? `+91${digits}` : ''

    await loadRazorpay()
    if (!window.Razorpay) throw new Error('Razorpay failed to load')

    await new Promise<void>((resolve, reject) => {
      const options = {
        key: STATICS.RAYZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'TruckMitr',
        description: `Driver Verification - ${driverIds.length} driver(s)`,
        order_id: orderId,
        image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
        prefill: {
          name: profileName || 'User',
          email: profileEmail || 'user@truckmitr.com',
          contact,
        },
        readonly: { contact: !!contact },
        theme: { color: '#1a3a5c' },
        modal: {
          confirm_close: true,
          escape: true,
          ondismiss: () => {
            cleanupRazorpayOverlay()
            paymentLoading.value = false
            startingVerification.value = false
            reject(new Error('Payment cancelled'))
          },
        },
        handler: (response: {
          razorpay_payment_id?: string
          razorpay_order_id?: string
          razorpay_signature?: string
        }) => {
          cleanupRazorpayOverlay()
          submitBulkVerification({
            driver_ids: driverIds,
            payment_data: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
          })
            .then((res) => {
              if (res?.success) {
                selectedDriverIds.value = new Set()
                showDriverModal.value = false
                emit('navigate', 'verify-driver-documents')
              } else {
                alert(res?.message || 'Verification could not be started.')
              }
            })
            .catch((e) => {
              console.error('Bulk verification error:', e)
              alert('Verification failed. Please contact support.')
            })
            .finally(() => {
              paymentLoading.value = false
              startingVerification.value = false
            })
          resolve()
        },
      }
      if (!window.Razorpay) throw new Error('Razorpay failed to load')
    const rzp = new window.Razorpay(options)
    rzp.open()
    })
  } catch (e) {
    console.error('Payment error:', e)
    paymentLoading.value = false
    startingVerification.value = false
    if (e instanceof Error && e.message !== 'Payment cancelled') {
      alert(e.message || 'Payment failed.')
    }
  }
}

const handleContactSales = () => {
  emit('navigate', 'contact-us')
}

const handleViewHistory = async () => {
  showHistoryModal.value = true
  try {
    const res = await fetchVerificationStatus()
    paymentHistory.value = res?.payment?.all_payments || []
  } catch {
    paymentHistory.value = []
  }
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {})
</script>

<template>
  <div class="verify-master">
    <div class="page-container">
      <header class="page-header">
        <button class="icon-back-btn" @click="emit('back')" title="Go Back">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-titles">
          <h1 class="main-title">Verify Your Drivers</h1>
          <p class="sub-title">
            Ensure safety and compliance through essential background checks.
          </p>
        </div>
        <button
          class="history-btn"
          @click="handleViewHistory"
          title="Payment History"
        >
          <History :size="20" />
          <span>History</span>
        </button>
      </header>

      <div class="content-container">
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-badge">
              <ShieldCheck :size="16" class="badge-icon" />
              <span>Trust & Safety Program</span>
            </div>
            <h2>Verify Your Drivers</h2>
            <p>
              Hire with confidence by verifying your drivers through essential
              background checks. TruckMitr helps transporters ensure safety,
              compliance, and trust across operations.
            </p>
          </div>
          <div class="hero-pattern"></div>
        </section>

        <section class="info-card">
          <div class="section-title-wrap">
            <h3>What is driver verification?</h3>
          </div>
          <p>
            TruckMitr enables transporters to verify drivers through essential
            background checks to build trust and ensure compliant operations.
          </p>
        </section>

        <section class="checks-section">
          <h3>Verification Checks Covered</h3>
          <div class="checks-grid">
            <div class="check-card">
              <div class="check-icon id-icon">
                <FileText :size="24" />
              </div>
              <h4>ID Check</h4>
              <div class="divider"></div>
              <p class="req-title">Required details/documents:</p>
              <ul>
                <li>Government-issued Photo ID (Aadhaar / Voter ID / PAN)</li>
                <li>Valid Driving License</li>
              </ul>
            </div>
            <div class="check-card">
              <div class="check-icon court-icon">
                <Scale :size="24" />
              </div>
              <h4>Court Check</h4>
              <div class="divider"></div>
              <p class="req-title">Required details/documents:</p>
              <ul>
                <li>Full Name & DOB</li>
                <li>Address & Father's Name</li>
              </ul>
            </div>
            <div class="check-card">
              <div class="check-icon address-icon">
                <MapPin :size="24" />
              </div>
              <h4>Digital Address Check</h4>
              <div class="divider"></div>
              <p class="req-title">Required details/documents:</p>
              <ul>
                <li>Mobile Number</li>
                <li>Full Name</li>
                <li>Current Address</li>
              </ul>
            </div>
          </div>
        </section>

        <div class="split-section">
          <section class="benefits-section">
            <h3>Why verify your drivers</h3>
            <ul class="benefit-list">
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Build a trusted & reliable driver workforce</span>
              </li>
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Reduce operational & legal risks</span>
              </li>
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Improve safety & compliance</span>
              </li>
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Enable faster & confident hiring decisions</span>
              </li>
            </ul>
          </section>

          <section class="pricing-card">
            <h3>Pricing</h3>
            <div class="price-amount">
              <span class="currency">₹</span>
              <span class="amount">1,000</span>
              <span class="gst">+ GST</span>
            </div>
            <p class="price-desc">per driver</p>
            <div class="price-includes">
              (Includes ID Check, Court Check & Digital Address Check)
            </div>
            <div class="bulk-deal">
              <h5>Bulk Verification (10+ drivers)</h5>
              <button class="sales-link-btn" @click="handleContactSales">
                <PhoneCall :size="16" /> Contact Sales for bulk deals
              </button>
            </div>
          </section>
        </div>

        <section class="how-it-works">
          <h3>How it works</h3>
          <div class="timeline">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-content">
                <h4>Submit driver information</h4>
                <p>
                  Enter the required personal and document details into the
                  secure portal.
                </p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-content">
                <h4>Required checks are initiated</h4>
                <p>
                  Our systems immediately begin processing the ID, Court, and
                  Address checks.
                </p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-content">
                <h4>Status updated in the app</h4>
                <p>
                  Track the progress in real-time. Each verification is processed
                  securely and efficiently.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="privacy-banner">
          <Lock :size="24" class="privacy-icon" />
          <div class="privacy-content">
            <h4>Data privacy & security</h4>
            <p>
              All driver data is encrypted and used only for verification
              purposes, following strict data protection standards.
            </p>
          </div>
        </section>
      </div>
    </div>

    <div class="action-footer">
      <div class="footer-container">
        <button class="btn btn-secondary" @click="handleContactSales">
          <PhoneCall :size="18" />
          Contact Sales
        </button>
        <button class="btn btn-primary" @click="handleVerify">
          Verify Driver
          <ArrowRight :size="18" />
        </button>
      </div>
    </div>

    <!-- Driver Selection Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDriverModal"
          class="modal-overlay"
          @click.self="showDriverModal = false"
        >
          <div class="modal-content driver-modal">
            <div class="modal-header">
              <h3>Select Drivers to Verify</h3>
              <button class="close-btn" @click="showDriverModal = false">
                <X :size="24" />
              </button>
            </div>
            <p class="modal-subtitle">
              {{ selectedDriverIds.size }} selected · ₹{{ totalAmount.toLocaleString() }} total
            </p>

            <div v-if="loading" class="modal-loading">
              <Loader2 class="spin" :size="36" />
              <span>Loading drivers...</span>
            </div>
            <div v-else-if="drivers.length === 0" class="modal-empty">
              <p>No unverified drivers found.</p>
              <p class="hint">Add drivers first from the Driver List.</p>
            </div>
            <div v-else class="driver-list">
              <div
                v-for="d in drivers"
                :key="d.id"
                class="driver-card"
                :class="{ selected: isSelected(d.id) }"
                @click="toggleDriver(d.id)"
              >
                <img
                  :src="getDriverImageUrl(d.images)"
                  alt=""
                  class="driver-avatar"
                />
                <div class="driver-info">
                  <span class="driver-name">{{ d.name }}</span>
                  <span class="driver-id">{{ d.unique_id }}</span>
                  <span class="driver-mobile">{{ d.mobile }}</span>
                </div>
                <div class="driver-check" :class="{ checked: isSelected(d.id) }">
                  <Check v-if="isSelected(d.id)" :size="16" />
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button
                class="btn-proceed"
                :disabled="selectedDriverIds.size === 0 || paymentLoading"
                @click="handleProceedToPayment"
              >
                <Loader2
                  v-if="paymentLoading"
                  class="spin"
                  :size="18"
                />
                <span v-else>
                  Proceed · ₹{{ pricePerDriver }} × {{ selectedDriverIds.size }} = ₹{{ totalAmount.toLocaleString() }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Payment History Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showHistoryModal"
          class="modal-overlay"
          @click.self="showHistoryModal = false"
        >
          <div class="modal-content history-modal">
            <div class="modal-header">
              <h3>Payment History</h3>
              <button class="close-btn" @click="showHistoryModal = false">
                <X :size="24" />
              </button>
            </div>
            <div v-if="paymentHistory.length === 0" class="modal-empty">
              <p>No payments yet.</p>
            </div>
            <div v-else class="history-list">
              <div
                v-for="p in paymentHistory"
                :key="p.payment_id"
                class="history-card"
              >
                <div class="history-row">
                  <span class="history-amount">₹{{ p.amount }}</span>
                  <span
                    class="history-status"
                    :class="p.status?.toLowerCase()"
                  >
                    {{ p.status }}
                  </span>
                </div>
                <div class="history-meta">
                  {{ p.driver_count }} drivers · {{ formatDate(p.payment_date) }}
                </div>
                <div v-if="p.transaction_id" class="history-txn">
                  {{ p.transaction_id }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

.history-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.history-btn:hover {
  background: #e2e8f0;
  color: #1e40af;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.header-titles {
  flex: 1;
  min-width: 200px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-content {
  background: #fff;
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #64748b;
  display: flex;
}
.close-btn:hover {
  color: #0f172a;
}
.modal-subtitle {
  padding: 12px 24px;
  font-size: 14px;
  color: #64748b;
  margin: 0;
  border-bottom: 1px solid #f1f5f9;
}
.modal-loading,
.modal-empty {
  padding: 48px 24px;
  text-align: center;
  color: #64748b;
}
.modal-loading .spin {
  animation: spin 1s linear infinite;
}
.modal-empty .hint {
  font-size: 13px;
  margin-top: 8px;
  color: #94a3b8;
}
.driver-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  max-height: 320px;
}
.driver-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.driver-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.driver-card.selected {
  border-color: #1e40af;
  background: #eff6ff;
}
.driver-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.driver-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.driver-name {
  font-weight: 600;
  color: #0f172a;
}
.driver-id,
.driver-mobile {
  font-size: 13px;
  color: #64748b;
}
.driver-check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.driver-check.checked {
  background: #1e40af;
  border-color: #1e40af;
}
.modal-actions {
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}
.btn-proceed {
  width: 100%;
  padding: 14px 24px;
  background: #1e40af;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}
.btn-proceed:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-proceed:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.history-list {
  padding: 16px;
  overflow-y: auto;
  max-height: 400px;
}
.history-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
}
.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.history-amount {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
.history-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}
.history-status.captured,
.history-status.verified {
  background: #dcfce7;
  color: #166534;
}
.history-status.pending {
  background: #fef3c7;
  color: #92400e;
}
.history-status.failed,
.history-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}
.history-meta {
  font-size: 13px;
  color: #64748b;
}
.history-txn {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  word-break: break-all;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Keep existing VerifyDriver styles - import from original */
.verify-master {
  padding: 40px;
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  padding-bottom: 120px;
}
.page-container {
  max-width: 1000px;
  margin: 0 auto;
}
.icon-back-btn {
  width: 44px;
  height: 44px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
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
.content-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.hero-section,
.info-card,
.checks-section,
.split-section,
.how-it-works,
.privacy-banner {
  animation: fadeInUp 0.6s ease-out backwards;
}
.info-card {
  animation-delay: 0.1s;
}
.checks-section {
  animation-delay: 0.2s;
}
.split-section {
  animation-delay: 0.3s;
}
.how-it-works {
  animation-delay: 0.4s;
}
.privacy-banner {
  animation-delay: 0.5s;
}
.hero-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #172554 100%);
  border-radius: 24px;
  padding: 56px 48px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.3);
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}
.hero-content h2 {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}
.hero-content p {
  font-size: 16px;
  color: #bfdbfe;
  line-height: 1.6;
  margin: 0;
}
.hero-pattern {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: radial-gradient(
    circle at 100% 0%,
    rgba(59, 130, 246, 0.2) 0%,
    transparent 60%
  );
  z-index: 1;
}
h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px 0;
}
.info-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}
.info-card p {
  color: #475569;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}
.checks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.check-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}
.check-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: transparent;
  transition: background 0.4s;
}
.check-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}
.check-card:hover::after {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}
.check-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.id-icon {
  background: #eff6ff;
  color: #2563eb;
}
.court-icon {
  background: #fdf4ff;
  color: #c026d3;
}
.address-icon {
  background: #f0fdf4;
  color: #16a34a;
}
.check-card h4 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px 0;
}
.divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 16px;
}
.req-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.check-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.check-card ul li {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  color: #334155;
  margin-bottom: 8px;
  line-height: 1.5;
}
.check-card ul li::before {
  content: '•';
  color: #94a3b8;
  position: absolute;
  left: 0;
  top: 0;
  font-size: 18px;
}
.split-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 32px;
  align-items: stretch;
}
@media (max-width: 768px) {
  .split-section {
    grid-template-columns: 1fr;
  }
}
.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.benefit-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.benefit-icon {
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 2px;
}
.benefit-list span {
  font-size: 15px;
  color: #334155;
  line-height: 1.5;
  font-weight: 500;
}
.pricing-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  border: 1px solid #bfdbfe;
  background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
  box-shadow: 0 10px 30px -5px rgba(37, 99, 235, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}
.pricing-card::before {
  content: 'Best Value';
  position: absolute;
  top: 16px;
  right: -32px;
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 32px;
  transform: rotate(45deg);
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.pricing-card h3 {
  text-align: center;
}
.price-amount {
  display: flex;
  justify-content: center;
  align-items: baseline;
  color: #0f172a;
  margin-bottom: 4px;
}
.currency {
  font-size: 24px;
  font-weight: 600;
}
.amount {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1px;
}
.gst {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  margin-left: 4px;
}
.price-desc {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
  margin: 0 0 16px 0;
}
.price-includes {
  font-size: 13px;
  color: #475569;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 24px;
}
.bulk-deal {
  border-top: 1px dashed #cbd5e1;
  padding-top: 20px;
}
.bulk-deal h5 {
  font-size: 14px;
  color: #0f172a;
  margin: 0 0 12px 0;
  font-weight: 600;
}
.sales-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}
.sales-link-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}
.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: #e2e8f0;
}
.step {
  display: flex;
  gap: 20px;
  position: relative;
}
.step-num {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  z-index: 2;
  box-shadow: 0 0 0 6px #f8fafc, 0 4px 10px rgba(37, 99, 235, 0.3);
}
.step-content {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 24px;
  border-radius: 16px;
  flex: 1;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s, box-shadow 0.3s;
}
.step-content:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}
.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}
.step-content p {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}
.privacy-banner {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: #f1f5f9;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}
.privacy-icon {
  color: #475569;
  flex-shrink: 0;
  margin-top: 4px;
}
.privacy-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}
.privacy-content p {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}
.action-footer {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  padding: 20px 40px;
  box-shadow: 0 -10px 30px -10px rgba(0, 0, 0, 0.05);
  z-index: 20;
}
@media (max-width: 768px) {
  .action-footer {
    left: 0;
    padding: 16px 24px;
  }
}
.footer-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}
.btn-secondary {
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
}
.btn-secondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}
.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  border: 1px solid transparent;
}
.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}
</style>
