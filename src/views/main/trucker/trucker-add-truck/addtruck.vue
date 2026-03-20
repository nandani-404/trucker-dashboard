<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowLeft, Search, ShieldCheck, 
  Truck, Calendar, 
  Check, Loader2, Info,
  Shield, UserCheck, Settings
} from 'lucide-vue-next'
import { apiGet, apiPost, END_POINTS } from '../../../../services/config/api'

const emit = defineEmits(['back', 'save-success'])

// --- METHODS ---
const handleBack = () => emit('back')

// --- STATE MANAGEMENT ---
const isVerifying = ref(false)
const isVerified = ref(false)
const isSaving = ref(false)

// 1. Basic Info
const vehicleBody = ref('')
const vehicleType = ref('')
const vehicleNumber = ref('')
const txnId = ref('')

// 2. Owner Info
const ownerName = ref('')
const fatherName = ref('')
const permanentAddress = ref('')

// 3. Registration Details
const registrationDate = ref('')
const vehicleAge = ref('')
const vehicleCategory = ref('')
const vehicleClass = ref('')
const rtoName = ref('')

// 4. Vehicle Specifications
const manufacturer = ref('')
const model = ref('')
const fuelType = ref('')
const engineNumber = ref('')
const chassisNumber = ref('')
const color = ref('')
const seatingCapacity = ref('')
const standingCapacity = ref('')
const cubicCapacity = ref('')
const grossVehicleWeight = ref('')
const unladenWeight = ref('')
const bodyType = ref('')

// 5. Location Information
const locationState = ref('')
const locationDistrict = ref('')

// 6. Validity & Insurance
const fitnessValidUpto = ref('')
const insuranceCompany = ref('')
const insurancePolicyNumber = ref('')
const insuranceValidity = ref('')
const pollutionValidUpto = ref('')
const roadTaxPaidUpto = ref('')

// 7. Permit Information
const nationalPermitNumber = ref('')
const nationalPermitValidity = ref('')
const statePermitNumber = ref('')
const statePermitValidity = ref('')

// 8. Additional Information
const hypothecation = ref('')
const rcStatus = ref('')
const registrationValidUpto = ref('')
const makerModelDesc = ref('')

// --- DATA LISTS ---
const vehicleBodyList = ref<{ id: string; name: string }[]>([])
const vehicleTypeList = ref<{ id: string; length_label: string }[]>([])

// --- API FETCH OPTIONS ---
onMounted(async () => {
    try {
        const [bodyRes, typeRes]: any = await Promise.all([
            apiGet(END_POINTS.TRUCKER_VEHICLE_BODY_LIST),
            apiGet(END_POINTS.TRUCKER_VEHICLE_TYPE_LIST)
        ])
        if (bodyRes && bodyRes.status === 'success') vehicleBodyList.value = bodyRes.data
        if (typeRes && typeRes.status === 'success') vehicleTypeList.value = typeRes.data
    } catch (error) {
        console.error('Error fetching vehicle options:', error)
    }
})

// --- HELPERS ---
const safe = (val: any): string => (val != null ? String(val) : '')

const parseApiDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3 && parts[0] && parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}` // yyyy-mm-dd to dd-mm-yyyy
    }
    return dateStr
}

const toApiDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr === 'N/A') return null
    const parts = dateStr.split('-')
    if (parts.length === 3 && parts[2] && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}` // dd-mm-yyyy to yyyy-mm-dd
    }
    return dateStr
}

const isDocumentValid = (dateStr: string): boolean => {
    if (!dateStr || dateStr === 'N/A') return false
    const apiDate = toApiDate(dateStr)
    if (!apiDate) return false
    const d = new Date(apiDate)
    const today = new Date()
    today.setHours(0,0,0,0)
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return diff >= 5
}

// --- CORE METHODS ---
const handleVerifyRC = async () => {
    if (vehicleNumber.value.length < 5) {
        alert('Please enter a valid vehicle number (at least 5 characters)')
        return
    }
    const cleanRC = vehicleNumber.value.replace(/\s/g, '').toUpperCase()
    isVerifying.value = true
    try {
        const response: any = await apiPost(END_POINTS.TRUCKER_VERIFY_RC, {
            rc_number: cleanRC
        })
        
        if (response?.status === 'success' && response?.details) {
            const d = response.details || {}
            const r = d.data?.result || {}
            txnId.value = d.data?.txn_id || ''

            // Auto-fill form
            ownerName.value = safe(d.owner_name || r.user_name)
            fatherName.value = safe(d.father_name || r.father_name)
            permanentAddress.value = safe(d.permanent_address || r.user_permanent_address)
            
            registrationDate.value = parseApiDate(d.registration_date || r.registration_date)
            vehicleAge.value = safe(r.vehicle_age || d.vehicle_age)
            vehicleCategory.value = safe(d.vehicle_category || r.vehicle_category)
            vehicleClass.value = safe(d.vehicle_class || r.vehicle_class_description)
            rtoName.value = safe(d.rto_code || r.registration_location)

            manufacturer.value = safe(d.manufacturer || r.vehicle_maker_description)
            model.value = safe(d.model || r.vehicle_make_model)
            fuelType.value = safe(d.fuel_type || r.vehicle_fuel_description)
            engineNumber.value = safe(d.engine_number || r.engine_number)
            chassisNumber.value = safe(d.chassis_number || r.chassis_number)
            color.value = safe(d.vehicle_color || d.colour)
            
            seatingCapacity.value = safe(r.vehicle_seating_capacity || d.seating_capacity)
            standingCapacity.value = safe(r.vehicle_stand_capacity || d.standing_capacity)
            cubicCapacity.value = safe(r.vehicle_cubic_capacity || d.cubic_capacity)
            grossVehicleWeight.value = safe(r.vehicle_gross_weight || d.gross_vehicle_weight)
            unladenWeight.value = safe(r.vehicle_unladen_weight || d.unladden_weight)
            bodyType.value = safe(r.body_type_description || d.body_type)

            locationState.value = safe(r.state || d.state)
            locationDistrict.value = safe(r.city || d.registered_place)

            fitnessValidUpto.value = parseApiDate(r.fit_upto || d.fitness_upto)
            insuranceCompany.value = safe(d.insurance_company || r.insurance?.company)
            insurancePolicyNumber.value = safe(d.insurance_policy_number || r.insurance?.policy_number)
            insuranceValidity.value = parseApiDate(d.insurance_expiry_date || r.insurance?.expiry_date)
            pollutionValidUpto.value = parseApiDate(r.pucc_expiry_date || d.puc_valid_upto)
            roadTaxPaidUpto.value = parseApiDate(r.tax_upto || d.mv_tax_upto)

            const permitType = String(r.permit_type || d.permit_type || '').toUpperCase()
            if (permitType.includes('NATIONAL') || permitType.includes('ALL INDIA')) {
                nationalPermitNumber.value = safe(r.national_permit_number || d.permit_no)
                nationalPermitValidity.value = parseApiDate(r.national_permit_expiry_date || d.permit_validity_upto)
            } else {
                statePermitNumber.value = safe(r.permit_number || d.permit_no)
                statePermitValidity.value = parseApiDate(r.permit_expiry_date || d.permit_validity_upto)
            }

            hypothecation.value = r.vehicle_financed ? safe(r.financer) : 'Not Financed'
            rcStatus.value = safe(d.rc_status || r.status)
            registrationValidUpto.value = parseApiDate(d.expiry_date || r.expiry_date)
            makerModelDesc.value = safe(d.model || r.vehicle_make_model)

            isVerified.value = true
            alert('RC Verified successfully!')
        } else {
            alert(response?.message || 'Verification failed. Please check the vehicle number.')
        }
    } catch (error: any) {
        console.error('RC verify error:', error)
        const msg = error.response?.data?.message || error.message || 'Something went wrong while verifying RC.'
        alert(msg)
    } finally {
        isVerifying.value = false
    }
}

const handleSubmit = async () => {
    if (!vehicleBody.value || !vehicleType.value) {
        alert('Please select vehicle body and type')
        return
    }

    if (!isDocumentValid(insuranceValidity.value) || !isDocumentValid(pollutionValidUpto.value)) {
        alert('Insurance or PUC is expired or expiring within 5 days')
        return
    }

    isSaving.value = true
    try {
        const bodyObj = vehicleBodyList.value.find(b => b.name === vehicleBody.value)
        const typeObj = vehicleTypeList.value.find(t => t.length_label === vehicleType.value)

        const payload = {
            vehicle_body: bodyObj?.id,
            vehicle_type: typeObj?.id,
            registration_number: vehicleNumber.value.replace(/\s/g, '').toUpperCase(),
            txn_id: txnId.value,
            owner_name: ownerName.value,
            father_name: fatherName.value,
            permanent_address: permanentAddress.value,
            registration_date: toApiDate(registrationDate.value),
            vehicle_class: vehicleClass.value,
            vehicle_category: vehicleCategory.value,
            rto_name: rtoName.value,
            manufacturer: manufacturer.value,
            model: model.value,
            fuel_type: fuelType.value,
            engine_number: engineNumber.value,
            chassis_number: chassisNumber.value,
            color: color.value,
            seating_capacity: seatingCapacity.value,
            standing_capacity: standingCapacity.value,
            cubic_capacity: cubicCapacity.value,
            gross_vehicle_weight: grossVehicleWeight.value,
            unladen_weight: unladenWeight.value,
            body_type: bodyType.value,
            vehicle_location_state: locationState.value,
            vehicle_location_district: locationDistrict.value,
            fitness_valid_upto: toApiDate(fitnessValidUpto.value),
            insurance_company: insuranceCompany.value,
            insurance_policy_number: insurancePolicyNumber.value,
            insurance_validity: toApiDate(insuranceValidity.value),
            pollution_valid_upto: toApiDate(pollutionValidUpto.value),
            road_tax_paid_upto: toApiDate(roadTaxPaidUpto.value),
            national_permit_number: nationalPermitNumber.value,
            national_permit_validity: toApiDate(nationalPermitValidity.value),
            state_permit_number: statePermitNumber.value,
            state_permit_validity: toApiDate(statePermitValidity.value),
            hypothecation: hypothecation.value,
            rc_status: rcStatus.value,
            registration_valid_upto: toApiDate(registrationValidUpto.value),
            vehicle_age: vehicleAge.value
        }

        const res: any = await apiPost(END_POINTS.TRUCKER_ADD_VEHICLE, payload)
        if (res?.status === 'success') {
            alert('Vehicle added successfully')
            emit('save-success')
        }
    } catch (error: any) {
        alert(error.message || 'Failed to add vehicle')
    } finally {
        isSaving.value = false
    }
}

const formatDateDisplay = (date: string) => {
  if (!date) return 'N/A'
  return date
}
</script>

<template>
  <div class="add-truck-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <button class="btn-back" @click="handleBack">
          <ArrowLeft :size="20" />
        </button>
        <div class="title-section">
          <h1>Add New Vehicle</h1>
          <p>Register your truck to start receiving loads</p>
        </div>
      </div>
    </header>

    <main class="form-container">
      <div class="form-grid">
        <!-- Left Column: Basic Info & RC Verification -->
        <div class="fields-column primary">
          <div class="form-card main-card">
            <div class="card-header">
              <div class="icon-box blue">
                <Truck :size="20" />
              </div>
              <div class="header-text">
                <h3>Vehicle Identification</h3>
                <p>Start by verifying your RC number</p>
              </div>
            </div>

            <div class="card-body">
              <div class="input-grid">
                <div class="form-group">
                  <label>Vehicle Number</label>
                  <div class="input-with-action">
                    <input 
                      v-model="vehicleNumber" 
                      type="text" 
                      placeholder="e.g. MH 12 AB 1234"
                      class="main-input highlight"
                      @keyup.enter="handleVerifyRC"
                    />
                    <button 
                      class="btn-verify" 
                      :disabled="isVerifying || isVerified || vehicleNumber.length < 5"
                      @click="handleVerifyRC"
                    >
                      <Loader2 v-if="isVerifying" class="spin" :size="16" />
                      <Check v-else-if="isVerified" :size="16" />
                      <Search v-else :size="16" />
                      <span>{{ isVerified ? 'Verified' : (isVerifying ? 'Verifying...' : 'Verify RC') }}</span>
                    </button>
                  </div>
                </div>

                <div class="row-2-col">
                  <div class="form-group">
                    <label>Vehicle Body</label>
                    <select v-model="vehicleBody" class="main-select">
                      <option value="" disabled>Select Body Type</option>
                      <option v-for="item in vehicleBodyList" :key="item.id" :value="item.name">{{ item.name }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Vehicle Type</label>
                    <select v-model="vehicleType" class="main-select">
                      <option value="" disabled>Select Type</option>
                      <option v-for="item in vehicleTypeList" :key="item.id" :value="item.length_label">{{ item.length_label }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Verification Details (Only shown if verified) -->
              <transition name="expand">
                <div v-if="isVerified" class="verification-summary">
                  <div class="summary-badge">
                    <ShieldCheck :size="14" />
                    <span>Government Records Fetched</span>
                  </div>
                  <div class="summary-details">
                    <div class="summary-item">
                      <span class="s-label">Owner</span>
                      <span class="s-value">{{ ownerName }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="s-label">RC Status</span>
                      <span class="s-value status-active">{{ rcStatus }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="s-label">Registered At</span>
                      <span class="s-value">{{ rtoName }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Documentation Warning -->
          <div v-if="isVerified" class="info-banner warning" :class="{ success: isVerified }">
            <Info :size="18" />
            <p>Documents (PUC, Insurance) must be valid for at least the next 5 days to proceed.</p>
          </div>
        </div>

        <!-- Right Column: Auto-filled Details & Additional Info -->
        <div class="fields-column secondary">
          <transition name="fade-slide">
            <div v-if="isVerified" class="details-stack">
              <!-- Section Loop -->
              <div class="form-card">
                <div class="card-header tiny">
                  <UserCheck :size="16" />
                  <h4>Owner Information</h4>
                </div>
                <div class="card-body">
                  <div class="input-grid">
                    <div class="form-group">
                      <label>Father/Guardian Name</label>
                      <input v-model="fatherName" readonly class="main-input readonly" />
                    </div>
                    <div class="form-group">
                      <label>Permanent Address</label>
                      <textarea v-model="permanentAddress" readonly class="main-input readonly text-area"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-card">
                <div class="card-header tiny">
                  <Settings :size="16" />
                  <h4>Vehicle Specifications</h4>
                </div>
                <div class="card-body">
                  <div class="row-2-col">
                    <div class="form-group">
                      <label>Manufacturer</label>
                      <input v-model="manufacturer" readonly class="main-input readonly" />
                    </div>
                    <div class="form-group">
                      <label>Model</label>
                      <input v-model="model" readonly class="main-input readonly" />
                    </div>
                  </div>
                  <div class="row-2-col">
                    <div class="form-group">
                      <label>Fuel Type</label>
                      <input v-model="fuelType" readonly class="main-input readonly" />
                    </div>
                    <div class="form-group">
                      <label>Color</label>
                      <input v-model="color" readonly class="main-input readonly" />
                    </div>
                  </div>
                  <div class="row-2-col">
                    <div class="form-group">
                      <label>Engine Number</label>
                      <input v-model="engineNumber" readonly class="main-input readonly" />
                    </div>
                    <div class="form-group">
                      <label>Chassis Number</label>
                      <input v-model="chassisNumber" readonly class="main-input readonly" />
                    </div>
                  </div>
                  <div class="row-2-col">
                    <div class="form-group">
                      <label>Gross Weight (kg)</label>
                      <input v-model="grossVehicleWeight" readonly class="main-input readonly" />
                    </div>
                    <div class="form-group">
                      <label>Unladen Weight (kg)</label>
                      <input v-model="unladenWeight" readonly class="main-input readonly" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-card">
                <div class="card-header tiny">
                   <Shield :size="16" />
                   <h4>Compliance & Validity</h4>
                </div>
                <div class="card-body">
                   <div class="row-2-col">
                    <div class="form-group">
                      <label>Insurance Valid Upto</label>
                      <div class="date-display">
                        <Calendar :size="14" />
                        <span>{{ formatDateDisplay(insuranceValidity) }}</span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Pollution (PUC) Valid Upto</label>
                      <div class="date-display">
                        <Calendar :size="14" />
                        <span>{{ formatDateDisplay(pollutionValidUpto) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Footer Button -->
              <div class="form-actions">
                <button 
                  class="btn-submit-full" 
                  :disabled="isSaving"
                  @click="handleSubmit"
                >
                  <Loader2 v-if="isSaving" class="spin" :size="20" />
                  <span v-else>Confirm & Register Truck</span>
                </button>
              </div>
            </div>
            <!-- Blank State -->
            <div v-else class="empty-state">
              <div class="illustration">
                <div class="truck-outline"><Truck :size="64" /></div>
                <div class="search-pulse"><Search :size="48" /></div>
              </div>
              <h3>Waiting for Verification</h3>
              <p>Enter your vehicle number on the left to pull official records from the transport authority.</p>
            </div>
          </transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.add-truck-page {
  min-height: 100vh;
  background: #ffffff;
  color: #0f172a;
}

/* Header */
.page-header {
  padding: 40px 0 20px 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-back {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.btn-back:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateX(-4px);
}

.title-section h1 {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.title-section p {
  color: #64748b;
  font-size: 15px;
}

/* Layout */
.form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.form-grid {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 40px;
  align-items: start;
}

/* Cards */
.form-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.card-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header.tiny {
  padding: 16px 24px;
  background: #f8fafc;
  gap: 10px;
}

.card-header h3 { font-size: 18px; font-weight: 700; }
.card-header p { font-size: 13px; color: #64748b; }
.card-header h4 { font-size: 14px; font-weight: 700; color: #475569; }

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box.blue { background: #eff6ff; color: #2563eb; }

.card-body {
  padding: 24px;
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.main-input, .main-select {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
}

.main-input:focus, .main-select:focus {
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.05);
}

.main-input.highlight {
  font-family: monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #2563eb;
}

.main-input.readonly {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
  cursor: default;
}

.text-area {
  height: 80px;
  padding: 12px 16px;
  line-height: 1.5;
  resize: none;
}

.row-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-with-action {
  position: relative;
  display: flex;
  gap: 12px;
}

/* Verification */
.btn-verify {
  height: 48px;
  padding: 0 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-verify:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-verify:not(:disabled):hover {
  background: #1e40af;
  transform: translateY(-1px);
}

.verification-summary {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px dashed #e2e8f0;
}

.summary-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 16px;
}

.summary-details {
  display: grid;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.s-label { color: #64748b; }
.s-value { font-weight: 700; color: #1e293b; }
.s-value.status-active { color: #16a34a; }

/* Date Display */
.date-display {
  padding: 12px 16px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

/* Banners */
.info-banner {
  padding: 16px;
  border-radius: 16px;
  display: flex;
  gap: 12px;
  font-size: 13px;
  line-height: 1.5;
}

.info-banner.warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fef3c7;
}

.info-banner.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #dcfce7;
}

/* Empty State */
.empty-state {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.illustration {
  position: relative;
  margin-bottom: 32px;
}

.truck-outline {
  color: #e2e8f0;
}

.search-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #2563eb;
  opacity: 0.2;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.2; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.2; }
}

.empty-state h3 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
.empty-state p { color: #64748b; font-size: 15px; max-width: 320px; }

/* Submit Button */
.btn-submit-full {
  width: 100%;
  height: 60px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-submit-full:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.2);
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Animations */
.expand-enter-active, .expand-leave-active { transition: all 0.3s ease; max-height: 500px; overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; }

.fade-slide-enter-active { transition: all 0.4s ease-out; }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }
</style>
