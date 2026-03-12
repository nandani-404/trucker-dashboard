<script setup lang="ts">
import { computed } from 'vue'
import { 
  ArrowLeft, CheckCircle2, Car, FileText, Settings, 
  Calendar, ShieldCheck, Receipt, Banknote, MapPin, AlertCircle 
} from 'lucide-vue-next'
import { useAppStore } from '../../../stores/app'
import { normalizeRcData } from '../../../services/rc/normalizeRcData'
import type { UnifiedRcData } from '../../../services/rc/normalizeRcData'

const emit = defineEmits(['back', 'navigate'])
const appStore = useAppStore()

const rcNumber = computed(() => appStore.rcVerificationNumber)
const rcData = computed(() => appStore.rcVerificationData)

const result = computed<UnifiedRcData | null>(() => 
  normalizeRcData(rcData.value, rcNumber.value)
)

const isAlreadyVerified = computed(() => 
  (rcData.value?.message as string)?.toLowerCase?.().includes('already verified') ?? false
)

function isDateExpired(dateStr: string | null | undefined): boolean {
  if (!dateStr || dateStr.toLowerCase() === 'lifetime') return false
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return d < new Date()
  } catch {
    return false
  }
}

const isFitnessExpired = computed(() => {
  if (!result.value) return false
  const dateStr = result.value.fitnessValidUpto || result.value.expiryDate
  if (dateStr) return isDateExpired(dateStr)
  const apiVal = (result.value.fitnessExpired || '').toUpperCase()
  return apiVal === 'Y' || apiVal === 'YES' || apiVal === '1'
})

const isInsuranceExpired = computed(() => {
  if (!result.value) return false
  const dateStr = result.value.insuranceExpiry
  if (dateStr) return isDateExpired(dateStr)
  const apiVal = (result.value.insuranceExpired || '').toUpperCase()
  return apiVal === 'Y' || apiVal === 'YES' || apiVal === '1'
})

const handleCheckAnother = () => emit('back')
</script>

<template>
  <div class="rc-result-page">
    <template v-if="!result">
      <header class="app-header">
        <div class="header-container">
          <button class="back-btn" @click="emit('back')">
            <ArrowLeft :size="20" />
          </button>
          <div class="header-text">
            <h1>RC Details</h1>
            <p>No verification data available.</p>
          </div>
        </div>
      </header>
      <div class="content-wrapper">
        <div class="empty-state">
          <AlertCircle :size="48" />
          <h3>No RC data found</h3>
          <p>Please go back and verify a vehicle number.</p>
          <button class="action-btn primary-btn" @click="handleCheckAnother">Check Another RC</button>
        </div>
      </div>
    </template>

    <template v-else>
    <!-- Top Navigation Header -->
    <header class="app-header">
      <div class="header-container">
        <button class="back-btn" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-text">
          <h1>RC Details</h1>
          <p>Detailed verified information from RTO databases.</p>
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      
      <!-- Premium Status Banner -->
      <div class="premium-status-banner" :class="{ 'is-active': result.status === 'ACTIVE' }">
        <div class="status-glow"></div>
        <div class="status-icon">
          <CheckCircle2 v-if="result.status === 'ACTIVE'" :size="40" />
          <AlertCircle v-else :size="40" />
        </div>
        <div class="status-info">
          <h2>{{ result.status === 'ACTIVE' ? 'Verified & Active' : 'Inactive / Expired' }}</h2>
          <p>{{ isAlreadyVerified ? 'Vehicle already verified in our records' : 'Vehicle details verified successfully' }}</p>
        </div>
      </div>

      <!-- Main Two-Column Layout -->
      <div class="bento-grid">
        
        <!-- Left Column -->
        <div class="bento-col">
          
          <!-- Vehicle Information -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box blue"><Car :size="18" /></div>
              <h3>Vehicle Information</h3>
            </div>
            <div class="card-body list-view">
              <div class="list-item primary-item">
                <span class="label">Vehicle Number</span>
                <span class="value vehicle-badge">{{ result.registrationNumber }}</span>
              </div>
              <div class="list-item"><span class="label">Owner Name</span><span class="value strong">{{ result.ownerName }}</span></div>
              <div class="list-item"><span class="label">Father Name</span><span class="value">{{ result.fatherName }}</span></div>
              <div class="list-item"><span class="label">Make & Model</span><span class="value strong">{{ result.vehicleMakeModel }}</span></div>
              <div class="list-item"><span class="label">Manufacturer</span><span class="value">{{ result.manufacturer }}</span></div>
              <div class="list-item"><span class="label">Vehicle Class</span><span class="value">{{ result.vehicleClass }}</span></div>
              <div class="list-item"><span class="label">Body Type</span><span class="value">{{ result.bodyType }}</span></div>
              <div class="list-item"><span class="label">Color</span><span class="value">{{ result.vehicleColor }}</span></div>
              <div class="list-item"><span class="label">Fuel Type</span><span class="value">{{ result.fuelType }}</span></div>
            </div>
          </div>

          <!-- Registration Details -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box indigo"><FileText :size="18" /></div>
              <h3>Registration Details</h3>
            </div>
            <div class="card-body list-view">
              <div class="list-item"><span class="label">Registration Date</span><span class="value">{{ result.registrationDate }}</span></div>
              <div class="list-item"><span class="label">Location</span><span class="value">{{ result.registrationLocation }}</span></div>
              <div class="list-item"><span class="label">State</span><span class="value">{{ result.state }} ({{ result.stateCode }})</span></div>
              <div class="list-item"><span class="label">RTO Code</span><span class="value">{{ result.rtoCode }}</span></div>
              <div class="list-item"><span class="label">Vehicle Age</span><span class="value">{{ result.vehicleAge }}</span></div>
            </div>
          </div>

          <!-- Insurance Details -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box amber"><ShieldCheck :size="18" /></div>
              <h3>Insurance Details</h3>
            </div>
            <div class="card-body list-view">
              <div class="list-item primary-item"><span class="label">Company</span><span class="value strong">{{ result.insuranceCompany }}</span></div>
              <div class="list-item"><span class="label">Policy Number</span><span class="value mono">{{ result.policyNumber }}</span></div>
              <div class="list-item"><span class="label">Expiry Date</span><span class="value">{{ result.insuranceExpiry }}</span></div>
              <div class="list-item"><span class="label">Remaining</span><span class="value">{{ result.remainingValidity }}</span></div>
              <div class="list-item tag-item">
                <span class="label">Expired?</span>
                <span class="tag" :class="!isInsuranceExpired ? 'tag-green' : 'tag-red'">
                  {{ isInsuranceExpired ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Permit Details -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box purple"><Receipt :size="18" /></div>
              <h3>Permit Details</h3>
            </div>
            <div class="card-body list-view">
              <div class="list-item"><span class="label">Permit Number</span><span class="value mono">{{ result.permitNumber }}</span></div>
              <div class="list-item"><span class="label">Permit Type</span><span class="value">{{ result.permitType }}</span></div>
              <div class="list-item"><span class="label">Permit Expiry</span><span class="value">{{ result.permitExpiryDate }}</span></div>
              <div v-if="result.nationalPermitNumber" class="list-item"><span class="label">NP Number</span><span class="value mono">{{ result.nationalPermitNumber }}</span></div>
              <div v-if="result.nationalPermitNumber" class="list-item"><span class="label">NP Expiry</span><span class="value">{{ result.nationalPermitExpiry }}</span></div>
            </div>
          </div>

        </div>

        <!-- Right Column -->
        <div class="bento-col">
          
          <!-- Technical Details -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box slate"><Settings :size="18" /></div>
              <h3>Technical Details</h3>
            </div>
            <div class="card-body list-view">
              <div class="list-item"><span class="label">Chassis Number</span><span class="value mono">{{ result.chassisNumber }}</span></div>
              <div class="list-item"><span class="label">Engine Number</span><span class="value mono">{{ result.engineNumber }}</span></div>
              <div class="list-item"><span class="label">Cubic Capacity</span><span class="value">{{ result.cubicCapacity }}</span></div>
              <div class="list-item"><span class="label">Cylinders</span><span class="value">{{ result.cylinders }}</span></div>
              <div class="list-item"><span class="label">Gross Weight</span><span class="value">{{ result.grossWeight }}</span></div>
              <div class="list-item"><span class="label">Unladen Weight</span><span class="value">{{ result.unladenWeight }}</span></div>
              <div class="list-item"><span class="label">Wheelbase</span><span class="value">{{ result.wheelbase }}</span></div>
              <div class="list-item"><span class="label">Capacity</span><span class="value">{{ result.seatingCapacity }} Seats</span></div>
              <div class="list-item"><span class="label">Emission Norms</span><span class="value">{{ result.emissionNorms }}</span></div>
              <div class="list-item"><span class="label">Manufactured</span><span class="value">{{ result.manufacturedDate }}</span></div>
            </div>
          </div>

          <!-- Validity Details -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box teal"><Calendar :size="18" /></div>
              <h3>Validity & Compliance</h3>
            </div>
            <div class="card-body list-view">
              <div class="list-item"><span class="label">Fitness Valid Upto</span><span class="value">{{ result.fitnessValidUpto }}</span></div>
              <div class="list-item"><span class="label">Tax Valid Upto</span><span class="value">{{ result.taxValidUpto }}</span></div>
              <div class="list-item"><span class="label">General Expiry</span><span class="value">{{ result.expiryDate }}</span></div>
              <div class="list-item"><span class="label">PUCC Expiry</span><span class="value">{{ result.puccExpiryDate }}</span></div>
              <div class="list-item tag-item">
                <span class="label">Fitness Expired?</span>
                <span class="tag" :class="!isFitnessExpired ? 'tag-green' : 'tag-red'">
                  {{ isFitnessExpired ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Finance Details -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box emerald"><Banknote :size="18" /></div>
              <h3>Finance Details</h3>
            </div>
            <div class="card-body list-view">
              <div class="list-item tag-item">
                <span class="label">Vehicle Financed?</span>
                <span class="tag" :class="result.vehicleFinanced ? 'tag-warn' : 'tag-gray'">
                  {{ result.vehicleFinanced ? 'Yes' : 'No' }}
                </span>
              </div>
              <div v-if="result.vehicleFinanced" class="list-item">
                <span class="label">Financer</span><span class="value strong">{{ result.financer }}</span>
              </div>
            </div>
          </div>

          <!-- Other & Address Details -->
          <div class="bento-card">
            <div class="card-header">
              <div class="icon-box rose"><MapPin :size="18" /></div>
              <h3>Address & Other</h3>
            </div>
            <div class="card-body list-view">
              <div class="address-block list-item">
                <span class="label">Present Address</span>
                <span class="value text-block">{{ result.presentAddress }}</span>
              </div>
              <div class="address-block list-item">
                <span class="label">Permanent Address</span>
                <span class="value text-block">{{ result.permanentAddress }}</span>
              </div>
              <div class="list-item tag-item">
                <span class="label">Blacklist Status</span>
                <span class="tag" :class="result.blacklistStatus === 'NA' ? 'tag-green' : 'tag-red'">
                  {{ result.blacklistStatus === 'NA' ? 'Clear' : result.blacklistStatus }}
                </span>
              </div>
              <div class="list-item"><span class="label">NOC Details</span><span class="value">{{ result.nocDetails }}</span></div>
            </div>
          </div>

        </div>
      </div>

      <!-- Action Footer -->
      <div class="page-actions">
        <button class="action-btn primary-btn" @click="handleCheckAnother">
          Check Another RC
        </button>
      </div>

    </div>
    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

.rc-result-page {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  padding-bottom: 60px;
}

/* Header */
.app-header {
  background: #ffffff;
  padding: 24px 40px;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  width: 44px; height: 44px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.header-text h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-text p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Content */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  animation: fadeUp 0.5s ease-out;
}

/* Premium Status Banner */
.premium-status-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 40px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px -4px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.premium-status-banner.is-active {
  border: 1px solid #dcfce7;
}

.status-glow {
  position: absolute;
  top: 0; left: 0; bottom: 0; width: 6px;
  background: #cbd5e1;
}

.is-active .status-glow {
  background: #22c55e;
}

.status-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #64748b;
  background: #f1f5f9;
}

.is-active .status-icon {
  color: #16a34a;
  background: #dcfce7;
}

.status-info h2 {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.is-active .status-info h2 {
  color: #166534;
}

.status-info p {
  margin: 0;
  color: #475569;
  font-size: 16px;
  font-weight: 500;
}

/* Bento Grid */
.bento-grid {
  display: flex;
  gap: 32px;
  align-items: stretch;
}

.bento-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Beautiful Cards */
.bento-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 30px rgba(0,0,0,0.02);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.bento-card:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #f8fafc;
}

.icon-box {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

.icon-box.blue { background: #eff6ff; color: #2563eb; }
.icon-box.indigo { background: #eef2ff; color: #4f46e5; }
.icon-box.slate { background: #f1f5f9; color: #475569; }
.icon-box.amber { background: #fffbeb; color: #d97706; }
.icon-box.purple { background: #faf5ff; color: #9333ea; }
.icon-box.teal { background: #f0fdfa; color: #0d9488; }
.icon-box.emerald { background: #ecfdf5; color: #059669; }
.icon-box.rose { background: #fff1f2; color: #e11d48; }

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

/* List View Inside Cards */
.list-view {
  padding: 0 24px 24px 24px;
}

.list-item {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  gap: 16px;
}

.list-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.list-item .label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  width: 140px;
  flex-shrink: 0;
}

.list-item .value {
  color: #334155;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  flex: 1;
  word-break: break-word;
}

.list-item .strong {
  font-weight: 600;
  color: #0f172a;
}

.list-item .mono {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  letter-spacing: 0px;
}

.primary-item {
  background: #f8fafc;
  margin: 8px -16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9 !important;
}

.vehicle-badge {
  background: #2563eb;
  color: white !important;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 15px;
  letter-spacing: 1px;
  font-weight: 700 !important;
}

.address-block {
  flex-direction: column;
}

.address-block .label { margin-bottom: 6px; }
.address-block .text-block { text-align: left; line-height: 1.5; width: 100%; color: #334155; }

/* Tags */
.tag-item {
  align-items: center;
}

.tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.tag-green { background: #dcfce7; color: #166534; }
.tag-red { background: #fee2e2; color: #991b1b; }
.tag-warn { background: #fef3c7; color: #92400e; }
.tag-gray { background: #f1f5f9; color: #475569; }

/* Page Actions */
.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
}

.action-btn {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.primary-btn {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.primary-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.secondary-btn {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.secondary-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  color: #64748b;
}
.empty-state svg { color: #94a3b8; margin-bottom: 16px; }
.empty-state h3 { margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #0f172a; }
.empty-state p { margin: 0 0 24px 0; font-size: 15px; }
.empty-state .action-btn { margin-top: 8px; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 992px) {
  .bento-grid { flex-direction: column; }
}

@media (max-width: 768px) {
  .app-header { padding: 20px; }
  .content-wrapper { padding: 20px; }
  .premium-status-banner { flex-direction: column; text-align: center; padding: 32px 24px; gap: 16px; }
  .page-actions { flex-direction: column-reverse; }
  .action-btn { width: 100%; }
}
</style>
