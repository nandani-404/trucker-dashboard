<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ArrowLeft, PlusCircle, CheckCircle2, Briefcase, Truck, IndianRupee, FileText, Loader2 } from 'lucide-vue-next'
import { fetchSubscriptionDetails } from '../../../services/subscription/subscriptionCheck'
import { apiGet } from '../../../services/config/api'
import { END_POINTS } from '../../../services/config/api'
import { useJobStore } from '../../../stores/job'
import { cleanupRazorpayOverlay } from '../../../utils/razorpayCleanup'

const props = defineProps<{
  user?: { role?: string; id?: unknown } | null
}>()

const emit = defineEmits(['back', 'subscription-required', 'navigate'])
const jobStore = useJobStore()
const locationsList = ref<{ id?: number; name?: string }[]>([])
const pincodeAreas = ref<{ label: string; value: string }[]>([])
const pincodeLoading = ref(false)
const pincodeError = ref('')

onMounted(async () => {
  cleanupRazorpayOverlay()
  // Load draft if returning from Job Summary (Edit)
  const draft = jobStore.addJob
  if (draft) {
    form.value = {
      title: draft.title,
      location: draft.location,
      pincode: draft.pincode,
      area: draft.area,
      route: draft.route,
      vehicleType: draft.vehicleType,
      experience: draft.experience,
      license: draft.license,
      skills: [...(draft.skills || [])],
      salary: draft.salary,
      hasEsiPf: draft.hasEsiPf,
      hasFoodAllowance: draft.hasFoodAllowance,
      foodAllowanceAmount: draft.foodAllowanceAmount,
      hasTripIncentive: draft.hasTripIncentive,
      tripIncentiveAmount: draft.tripIncentiveAmount,
      hasAccommodation: draft.hasAccommodation,
      hasMileage: draft.hasMileage,
      mileageValue: draft.mileageValue,
      hasFastag: draft.hasFastag,
      fastagAmount: draft.fastagAmount,
      numberOfDrivers: draft.numberOfDrivers,
      description: draft.description,
      truckCondition: draft.truckCondition,
      deadline: draft.deadline,
      consent: draft.consent,
    }
    if (draft.pincode?.length === 6) {
      fetchPincodeAreas(draft.pincode)
    }
  }

  const r = (props.user?.role || '').toLowerCase()
  if (r !== 'transporter') return
  try {
    const res = await fetchSubscriptionDetails()
    if (res.showSubscriptionModel) {
      emit('subscription-required')
    }
  } catch {
    // Allow access on error
  }
  try {
    const locRes = await apiGet<{ status?: boolean; data?: { id?: number; name?: string }[] }>(END_POINTS.GETSTATES)
    if (locRes && (locRes as { status?: boolean }).status && Array.isArray((locRes as { data?: unknown[] }).data)) {
      locationsList.value = (locRes as { data: { id?: number; name?: string }[] }).data
    }
  } catch {
    locationsList.value = []
  }
})

const fetchPincodeAreas = async (pin: string) => {
  if (pin.length !== 6) {
    pincodeAreas.value = []
    pincodeError.value = ''
    return
  }
  pincodeLoading.value = true
  pincodeError.value = ''
  pincodeAreas.value = []
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
    const data = await res.json()
    if (data?.[0]?.Status === 'Success' && data[0].PostOffice) {
      pincodeAreas.value = data[0].PostOffice.map((po: { Name?: string }) => ({
        label: po.Name || '',
        value: po.Name || ''
      }))
    } else {
      pincodeError.value = 'Invalid pincode'
    }
  } catch {
    pincodeError.value = 'Error fetching areas'
  } finally {
    pincodeLoading.value = false
  }
}

// Form State
const form = ref({
  title: '',
  location: '',
  pincode: '',
  area: '',
  route: '',
  vehicleType: '',
  experience: '',
  license: '',
  skills: [] as string[],
  salary: '',
  
  hasEsiPf: null as boolean | null,
  
  hasFoodAllowance: null as boolean | null,
  foodAllowanceAmount: '',
  
  hasTripIncentive: null as boolean | null,
  tripIncentiveAmount: '',
  
  hasAccommodation: null as boolean | null,
  
  hasMileage: null as boolean | null,
  mileageValue: '',
  
  hasFastag: null as boolean | null,
  fastagAmount: '',
  
  numberOfDrivers: '',
  description: '',
  truckCondition: '',
  deadline: '',
  consent: true
})

const consentModalVisible = ref(false)
const consentModalContent = ref('')
const consentModalLoading = ref(false)

const openConsentModal = async () => {
  consentModalVisible.value = true
  consentModalLoading.value = true
  try {
    const res: any = await apiGet(END_POINTS.TRANSPORTER_CONSENT)
    const html = typeof res?.data === 'string' ? res.data : res?.data?.content
    if (res?.status && html) {
      consentModalContent.value = html
    } else {
      consentModalContent.value = '<p>Failed to load consent. Please try again.</p>'
    }
  } catch (err) {
    consentModalContent.value = '<p>Something went wrong loading consent.</p>'
  } finally {
    consentModalLoading.value = false
  }
}

const closeConsentModal = () => {
  consentModalVisible.value = false
  setTimeout(() => {
    consentModalContent.value = ''
  }, 300)
}

const vehicleTypes = [
  'Cargo Truck (Open)', 'Container Truck', 'Tipper Trucks', 
  'Trailer/Semi-Trailer', 'Tanker', 'Car Carriers', 
  'Light Commercial Vehicle', 'Reefer Trucks'
]
const experienceOptions = ['1-5 years', '5-10 years', '10-15 years', '15-20 years', '20+ years']
const licenseTypes = ['LMV (Light)', 'HMV (Heavy)', 'HGMV (Goods)', 'HPMV/HTV']
const skillOptions = [
  'E-Commerce', 'White Goods', 'Livestock', 'Perishable', 
  'Oversized', 'Fuel Tanker', 'Automobile Carrier', 'Construction', 
  'Refrigerator Vehicle', 'Others'
]
const salaryOptions = [
  '20000-25000', '25000-30000', '30000-35000', '35000-40000', 
  '40000-45000', '45000-50000', '50000-55000', '55000-60000'
]
const conditionOptions = ['Excellent', 'Good', 'Average', 'Old but running', 'Made Road Ready']

const locations = computed(() =>
  locationsList.value.length > 0
    ? locationsList.value.map((l) => l.name || '').filter(Boolean)
    : ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
)

const toggleSkill = (skill: string) => {
  if (form.value.skills.includes(skill)) {
    form.value.skills = form.value.skills.filter(s => s !== skill)
  } else {
    form.value.skills.push(skill)
  }
}

const goToSummary = () => {
  if (!form.value.consent) {
    alert('Please agree to term and contidition')
    return
  }
  if (!form.value.title?.trim()) {
    alert('Please enter job title.')
    return
  }
  if (!form.value.location) {
    alert('Please select location.')
    return
  }
  if (!form.value.vehicleType) {
    alert('Please select vehicle type.')
    return
  }
  if (!form.value.experience) {
    alert('Please select experience.')
    return
  }
  if (!form.value.license) {
    alert('Please select license type.')
    return
  }
  if (!form.value.salary) {
    alert('Please select salary range.')
    return
  }
  if (!form.value.numberOfDrivers || parseInt(form.value.numberOfDrivers) < 1) {
    alert('Please enter number of drivers.')
    return
  }
  if (!form.value.deadline) {
    alert('Please select application deadline.')
    return
  }
  if (!form.value.description?.trim()) {
    alert('Please enter job description.')
    return
  }
  jobStore.setAddJob({
    title: form.value.title,
    location: form.value.location,
    pincode: form.value.pincode,
    area: form.value.area,
    route: form.value.route,
    vehicleType: form.value.vehicleType,
    experience: form.value.experience,
    license: form.value.license,
    skills: [...form.value.skills],
    salary: form.value.salary,
    hasEsiPf: form.value.hasEsiPf,
    hasFoodAllowance: form.value.hasFoodAllowance,
    foodAllowanceAmount: form.value.foodAllowanceAmount,
    hasTripIncentive: form.value.hasTripIncentive,
    tripIncentiveAmount: form.value.tripIncentiveAmount,
    hasAccommodation: form.value.hasAccommodation,
    hasMileage: form.value.hasMileage,
    mileageValue: form.value.mileageValue,
    hasFastag: form.value.hasFastag,
    fastagAmount: form.value.fastagAmount,
    numberOfDrivers: form.value.numberOfDrivers,
    description: form.value.description,
    truckCondition: form.value.truckCondition,
    deadline: form.value.deadline,
    consent: form.value.consent,
  })
  emit('navigate', 'job-summary')
}

</script>

<template>
  <div class="addjob-wrapper">
    <!-- Header -->
    <div class="dash-header-area">
      <button class="back-btn" @click="emit('back')" title="Back">
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>

      <div class="page-title-row">
        <div class="page-title-icon">
          <PlusCircle :size="24" color="#1e40af" />
        </div>
        <div>
          <h2 class="page-title">Post a New Job</h2>
          <p class="page-subtitle">Fill in the details below to hire the perfect driver</p>
        </div>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="goToSummary" class="job-form">
        
        <!-- Job Basics Card -->
        <div class="form-section-card">
          <div class="section-header">
            <Briefcase :size="20" color="#3b82f6" />
            <h3 class="section-title">Job Basics</h3>
          </div>
          
          <div class="form-grid">
            <div class="input-group">
              <label>Job Title <span class="req">*</span></label>
              <input type="text" v-model="form.title" placeholder="e.g. Heavy Driver for Trailer" required />
            </div>
            
            <div class="input-group">
              <label>Job Location <span class="req">*</span></label>
              <select v-model="form.location" required>
                <option value="" disabled>Select Location</option>
                <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
              </select>
            </div>

            <div class="input-group">
              <label>Pincode</label>
              <input
                type="text"
                v-model="form.pincode"
                placeholder="Enter 6 digit pincode"
                maxlength="6"
                @input="(e) => { form.pincode = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0,6); if (form.pincode.length === 6) fetchPincodeAreas(form.pincode); }"
              />
              <span v-if="pincodeLoading" class="hint">Fetching areas...</span>
              <span v-if="pincodeError" class="err">{{ pincodeError }}</span>
            </div>

            <div class="input-group slide-in" v-if="pincodeAreas.length > 0">
              <label>Select Area</label>
              <select v-model="form.area">
                <option value="">Select Area</option>
                <option v-for="a in pincodeAreas" :key="a.value" :value="a.value">{{ a.label }}</option>
              </select>
            </div>
            <div class="input-group slide-in" v-else-if="form.pincode.length === 6">
              <label>Area</label>
              <input type="text" v-model="form.area" placeholder="Enter Area / Neighborhood" />
            </div>

            <div class="input-group">
              <label>Route</label>
              <input type="text" v-model="form.route" placeholder="e.g. Delhi to Mumbai" />
            </div>
          </div>
        </div>

        <!-- Vehicle & License Info Card -->
        <div class="form-section-card">
          <div class="section-header">
            <Truck :size="20" color="#8b5cf6" />
            <h3 class="section-title">Vehicle & Driver Requirements</h3>
          </div>
          
          <div class="field-block compact-block">
            <label class="block-label">Vehicle Type <span class="req">*</span></label>
            <div class="chip-grid compact-chips">
              <button 
                type="button" 
                class="chip-btn" 
                v-for="vType in vehicleTypes" :key="vType"
                :class="{ selected: form.vehicleType === vType }"
                @click="form.vehicleType = vType"
              >
                {{ vType }}
              </button>
            </div>
          </div>

          <div class="form-grid compact-grid">
            <div class="input-group">
              <label>Experience Needed <span class="req">*</span></label>
              <select v-model="form.experience" required>
                <option value="" disabled>Select Experience</option>
                <option v-for="exp in experienceOptions" :key="exp" :value="exp">{{ exp }}</option>
              </select>
            </div>

            <div class="input-group">
              <label>Type of License <span class="req">*</span></label>
              <select v-model="form.license" required>
                <option value="" disabled>Select License Type</option>
                <option v-for="lic in licenseTypes" :key="lic" :value="lic">{{ lic }}</option>
              </select>
            </div>
          </div>

          <div class="field-block compact-block" style="margin-top:20px;">
            <label class="block-label">Preferred Skills</label>
            <div class="chip-grid compact-chips">
              <button 
                type="button" 
                class="chip-btn skill-chip" 
                v-for="skill in skillOptions" :key="skill"
                :class="{ selected: form.skills.includes(skill) }"
                @click="toggleSkill(skill)"
              >
                {{ skill }} <span class="plus-icon">{{ form.skills.includes(skill) ? '✓' : '+' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Compensation and Benefits Card -->
        <div class="form-section-card">
          <div class="section-header">
            <IndianRupee :size="20" color="#10b981" />
            <h3 class="section-title">Compensation & Facilities</h3>
          </div>

          <div class="form-grid">
            <div class="input-group full-width">
              <label>Fixed Salary <span class="req">*</span></label>
              <select v-model="form.salary" required>
                <option value="" disabled>Select Salary Range</option>
                <option v-for="sal in salaryOptions" :key="sal" :value="sal">₹{{ sal }}</option>
              </select>
            </div>
          </div>

          <!-- Toggles Array -->
          <div class="toggles-container wide-grid">
            <!-- ESI/PF -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">ESI/PF Benefits</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasEsiPf" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasEsiPf" :value="false" /> No
                  </label>
                </div>
              </div>
            </div>

            <!-- Food Allowance -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Food Allowance</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFoodAllowance" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFoodAllowance" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasFoodAllowance">
                <input type="number" v-model="form.foodAllowanceAmount" placeholder="Enter Amount (₹)" />
              </div>
            </div>

            <!-- Trip Incentive -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Trip Incentive</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasTripIncentive" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasTripIncentive" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasTripIncentive">
                <input type="number" v-model="form.tripIncentiveAmount" placeholder="Enter Amount (₹)" />
              </div>
            </div>

            <!-- Accommodation -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Accommodation Facility</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasAccommodation" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasAccommodation" :value="false" /> No
                  </label>
                </div>
              </div>
            </div>

            <!-- Mileage -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Mileage</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasMileage" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasMileage" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasMileage">
                <input type="number" v-model="form.mileageValue" placeholder="Expected Mileage (km per 1 liter)" />
              </div>
            </div>

            <!-- Fastag/Road Karcha -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Fastag / Road Karcha</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFastag" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFastag" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasFastag">
                <input type="number" v-model="form.fastagAmount" placeholder="Enter Amount (₹)" />
              </div>
            </div>
            
          </div>
        </div>

        <!-- Additional Information Card -->
        <div class="form-section-card">
          <div class="section-header">
            <FileText :size="20" color="#f59e0b" />
            <h3 class="section-title">Additional Details</h3>
          </div>
        
          <div class="form-grid">
            <div class="input-group">
              <label>Number of Drivers Required <span class="req">*</span></label>
              <input type="number" v-model="form.numberOfDrivers" placeholder="e.g. 2" required min="1" />
            </div>

            <div class="input-group">
              <label>Application Deadline <span class="req">*</span></label>
              <input type="date" v-model="form.deadline" @click="($event.target as HTMLInputElement).showPicker()" required />
            </div>
          </div>

          <div class="field-block" style="margin-top:20px;">
            <label class="block-label">Overall Truck Condition</label>
            <div class="chip-grid">
              <button 
                type="button" 
                class="chip-btn" 
                v-for="cond in conditionOptions" :key="cond"
                :class="{ selected: form.truckCondition === cond }"
                @click="form.truckCondition = cond"
              >
                {{ cond }}
              </button>
            </div>
          </div>

          <div class="input-group full-width" style="margin-top: 20px;">
            <label>Job Description</label>
            <textarea v-model="form.description" rows="4" placeholder="Briefly describe the responsibilities, schedule, etc."></textarea>
          </div>
        </div>

        <!-- Consent -->
        <div class="consent-block">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.consent" />
            <span class="checkmark"></span>
            <span class="consent-text">
              I agree to the <a href="#" class="link" @click.prevent="openConsentModal">Truckmitr Transporter consent for job posting & data sharing</a> which will be visible to drivers.
            </span>
          </label>
        </div>

        <div class="submit-action">
          <button type="submit" class="submit-btn">
            <CheckCircle2 :size="18" style="margin-right:8px;" />
            Review Job
          </button>
        </div>
      </form>
    </div>

    <!-- Consent Modal -->
    <Teleport to="body">
      <div v-if="consentModalVisible" class="policy-overlay" @click.self="closeConsentModal">
        <div class="policy-modal">
          <div class="policy-header">
            <h3>Consent & Terms</h3>
            <button class="close-btn" @click="closeConsentModal">✕</button>
          </div>
          <div class="policy-body">
            <div v-if="consentModalLoading" class="loading-state">
              <Loader2 class="spin" :size="32" />
              <p>Loading...</p>
            </div>
            <div v-else class="policy-html" v-html="consentModalContent"></div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.link { color: #3b82f6; text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; color: #1d4ed8; }

/* Modal Styles */
.policy-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}
.policy-modal {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2);
  overflow: hidden;
  animation: modalEnter 0.3s ease-out;
}
@keyframes modalEnter {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.policy-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.policy-header h3 { margin: 0; font-size: 18px; color: #0f172a; font-weight: 700; }
.close-btn { background: none; border: none; font-size: 20px; color: #64748b; cursor: pointer; padding: 4px; }
.close-btn:hover { color: #0f172a; }
.policy-body { padding: 24px; overflow-y: auto; flex: 1; -webkit-overflow-scrolling: touch; }
.policy-html { font-size: 14px; line-height: 1.6; color: #334155; }
.policy-html :deep(h1), .policy-html :deep(h2), .policy-html :deep(h3) { margin-top: 24px; margin-bottom: 12px; color: #0f172a; }
.policy-html :deep(p) { margin-bottom: 16px; }
.policy-html :deep(ul) { margin-bottom: 16px; padding-left: 20px; }
.spin { animation: spin 1s linear infinite; color: #3b82f6; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #64748b;
}

.addjob-wrapper {
  padding: 32px 40px 64px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: fadeSlideIn 0.4s ease-out;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  background-color: #f8fafc; /* Provides subtle contrast against the floating white section cards */
  min-height: 100vh;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Header */
.dash-header-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  transform: translateX(-2px);
}

.page-title-icon {
  width: 50px;
  height: 50px;
  background: #eff6ff;
  border-radius: 14px;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* Success Block */
.success-block {
  text-align: center;
  padding: 60px 24px;
}
.success-block h2 { margin: 16px 0 8px; font-size: 22px; color: #10b981; }
.success-block p { color: #64748b; font-size: 14px; }

/* Summary Card */
.summary-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e2e8f0;
}
.summary-card h3 { margin: 0 0 24px; font-size: 20px; }
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  margin-bottom: 28px;
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-item strong { font-size: 12px; color: #64748b; text-transform: uppercase; }
.summary-item span { font-size: 15px; font-weight: 600; }
.summary-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}
.btn-secondary {
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}
.btn-secondary:hover { background: #f8fafc; }

/* Pincode hint/error */
.input-group .hint { font-size: 12px; color: #64748b; margin-top: 4px; }
.input-group .err { font-size: 12px; color: #ef4444; margin-top: 4px; }

/* Modern Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Individual Floating Cards */
.form-section-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 24px -6px rgba(15, 23, 42, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.form-section-card:hover {
  box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.job-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.3px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: flex-start;
}

.compact-grid {
  gap: 16px;
}

/* Inputs & Selects */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

.input-group label, .block-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.req {
  color: #ef4444;
}

input[type="text"],
input[type="number"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%228%22%20viewBox%3D%220%200%2014%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201L7%207L13%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
  cursor: pointer;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: 0.2s;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

input:focus, select:focus, textarea:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
  transform: translateY(-1px);
}

textarea {
  resize: vertical;
}

/* Chips/Badges for array options */
.field-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn:hover {
  background: #e2e8f0;
}

.chip-btn.selected {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #3b82f6;
  font-weight: 600;
}

/* Compact rules for messy sections */
.compact-chips {
  gap: 10px;
  margin-top: 6px;
}
.compact-chips .chip-btn {
  padding: 8px 16px;
  font-size: 13.5px;
  border-radius: 8px;
  font-weight: 500;
  border-color: #e2e8f0;
}
.compact-block {
  gap: 4px;
  margin-bottom: 24px;
}

.skill-chip span.plus-icon {
  margin-left: 4px;
  color: inherit;
  font-weight: bold;
}

/* Toggles / Radios */
.toggles-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 28px;
}

.toggles-container.wide-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 640px) {
  .toggles-container.wide-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

.toggle-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 18px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  height: 100%;
}

.toggle-row:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.toggle-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.toggle-options {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
}

.radio-label:has(input:checked) {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
  transform: translateY(-1px);
}

.radio-label input[type="radio"] {
  display: none;
}

/* Animations */
.slide-in {
  animation: expandIn 0.3s ease-out;
  transform-origin: top;
}

@keyframes expandIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.nested-input {
  margin-top: -6px;
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 2px solid #3b82f6;
}

/* Consent Block */
.consent-block {
  margin-top: 24px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 16px 20px;
  border-radius: 12px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s;
}

.checkbox-label:hover input ~ .checkmark {
  border-color: #3b82f6;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: "";
  display: none;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

.consent-text {
  font-size: 13px;
  color: #1e3a8a;
  line-height: 1.5;
  font-weight: 500;
}

/* Submit Action */
.submit-action {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #ffffff;
  border: none;
  padding: 16px 40px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 24px -6px rgba(59, 130, 246, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 14px 32px -8px rgba(59, 130, 246, 0.6);
}
</style>
