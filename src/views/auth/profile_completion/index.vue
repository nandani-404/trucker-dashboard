<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  END_POINTS,
  apiGet,
  apiPostForm,
  getUser,
} from '../../../services/config/api'

// Truck images from assets (same as RN app)
import openCargoImg from '../../../assets/images/trucks/open_cargo.png'

import tripperImg from '../../../assets/images/trucks/tripper.png'
import trailerImg from '../../../assets/images/trucks/tailer.png'
import tankerImg from '../../../assets/images/trucks/tainkers.png'
import carCarrierImg from '../../../assets/images/trucks/car_carrier.png'
import containerImg from '../../../assets/images/trucks/container.png'
import reeferImg from '../../../assets/images/trucks/refregerator.png'
import pickupImg from '../../../assets/images/trucks/pickup_truck.png'

const TRUCK_VEHICLE_TYPES = [
  { id: 3, name: 'Cargo Truck (Open)', image: openCargoImg },
  { id: 1, name: 'Container Trucks', image: containerImg },
  { id: 11, name: 'Tipper Trucks', image: tripperImg },
  { id: 22, name: 'Trailer Trucks', image: trailerImg },
  { id: 10, name: 'Tankers', image: tankerImg },
  { id: 9, name: 'Car Carriers', image: carCarrierImg },
  { id: 4, name: 'Pickup / LCV', image: pickupImg },
  { id: 8, name: 'Reefer Trucks', image: reeferImg },
]

const props = defineProps<{
  user: { name?: string; mobile?: string; email?: string; role?: string; [key: string]: unknown }
}>()

const emit = defineEmits<{
  complete: []
}>()

const userRole = computed(() =>
  ['transporter', 'foreman', 'association', 'dhaba', 'puncture_shop', 'shipper'].includes(
    String(props.user?.role || '').toLowerCase()
  )
    ? 'transporter'
    : 'driver'
)

const currentPage = ref(0)
const loading = ref(false)
const formData = ref({
  DOB: '',
  Sex: '',
  education: '',
  vehicle_type: '',
  Type_of_License: '',
  endorsement: '',
  Driving_Experience: '',
  current_salary: '',
  expected_salary: '',
  License_Number: '',
  Expiry_date_of_License: '',
  truck_ownership: '',
  profileFile: null as File | null,
  year_of_exp: '',
  fleet_size: '',
  industry_segment: '',
  avg_km_run: '',
  operational_segment: '',
  pan: '',
  gst: '',
  address: '',
  city: '',
  pincode: '',
  states: '',
})

const statesList = ref<{ id: number; name: string }[]>([])

const PAGES = 3
const progress = computed(() => ((currentPage.value + 1) / PAGES) * 100)

const educationOptions = [
  { label: 'No Formal Education', value: 'No Formal Education' },
  { label: 'Primary School', value: 'Primary School' },
  { label: 'Middle School', value: 'Middle School' },
  { label: 'High School', value: 'High School' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Graduate', value: 'Graduate' },
  { label: 'Post Graduate', value: 'Post Graduate' },
]

const experienceOptions = [
  { label: '< 1 Year', value: '0-1' },
  { label: '1-2 Years', value: '1-2' },
  { label: '3-5 Years', value: '3-5' },
  { label: '6-10 Years', value: '6-10' },
  { label: '10+ Years', value: '10+' },
]

const licenseOptions = [
  { label: 'LMV (Light)', value: 'LMV' },
  { label: 'HMV (Heavy)', value: 'HMV' },
  { label: 'HGMV (Goods)', value: 'HGMV' },
  { label: 'HPMV/HTV', value: 'HPMV/HTV' },
]

const salaryRanges = [
  '15000-20000', '20000-25000', '25000-30000', '30000-35000',
  '35000-40000', '40000-45000', '45000-50000', '50000-55000', '55000-60000',
]

const fleetSizes = [
  { label: '0-9', value: '0-9' },
  { label: '10-50', value: '10-50' },
  { label: '51-100', value: '51-100' },
  { label: '100+', value: '100+' },
]

const industrySegments = [
  'E-commerce', 'White Goods', 'Livestock', 'Perishable', 'Oversized',
  'Fuel Tanker', 'Automobile Carrier', 'Construction', 'Refrigerator', 'Others',
]

const routeOptions = [
  { label: 'Local Delivery', value: 'Local Delivery' },
  { label: 'Intracity', value: 'Intracity' },
  { label: 'Intercity', value: 'Intercity' },
  { label: 'Interstate', value: 'Interstate' },
  { label: 'All India', value: 'All India' },
]

const avgKmOptions = [
  { label: '< 1000 km', value: 'less_1000' },
  { label: '1000-3000 km', value: '1000_3000' },
  { label: '3000-5000 km', value: '3000_5000' },
  { label: '5000-10000 km', value: '5000_10000' },
  { label: '10000+ km', value: '10000_plus' },
]

const endorsementOptions = [
  { label: 'Hill Driving', value: 'Hill Driving' },
  { label: 'Hazardous Goods', value: 'Hazardous Goods' },
  { label: 'Road Roller', value: 'Road Roller' },
  { label: 'Tractor-Trailer', value: 'Tractor-Trailer (Commercial)' },
  { label: 'Forklift / MHE', value: 'Forklift / MHE' },
  { label: 'Other', value: 'Other' },
]

const formatDate = (d: string) => {
  if (!d) return ''
  const parts = d.split('-')
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}` // DD-MM-YYYY for API
  return d
}

onMounted(async () => {
  try {
    const statesRes = await apiGet<{ status?: boolean; data?: { id: number; name: string }[] }>(END_POINTS.GETSTATES)
    if (statesRes?.status && statesRes?.data) statesList.value = statesRes.data
  } catch {
    // States fallback handled by empty list
  }
})

const toggleMulti = (field: string, value: string) => {
  const current = (formData.value[field as keyof typeof formData.value] as string)?.split(',').filter(Boolean) || []
  const next = current.includes(value)
    ? current.filter((x) => x !== value)
    : [...current, value]
  ;(formData.value as Record<string, unknown>)[field] = next.join(',')
}

const isSelected = (field: string, value: string) => {
  const v = (formData.value as Record<string, unknown>)[field] as string
  return v?.split(',').includes(value) ?? false
}

const profilePreviewUrl = ref<string | null>(null)

const handleProfileFile = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (profilePreviewUrl.value) {
    URL.revokeObjectURL(profilePreviewUrl.value)
    profilePreviewUrl.value = null
  }
  const file = input.files?.[0] ?? null
  formData.value.profileFile = file
  if (file) {
    profilePreviewUrl.value = URL.createObjectURL(file)
  }
}

watch(() => formData.value.profileFile, (file) => {
  if (!file && profilePreviewUrl.value) {
    URL.revokeObjectURL(profilePreviewUrl.value)
    profilePreviewUrl.value = null
  }
})

onBeforeUnmount(() => {
  if (profilePreviewUrl.value) {
    URL.revokeObjectURL(profilePreviewUrl.value)
  }
})

const submitProfile = async () => {
  loading.value = true
  try {
    const fd = new FormData()
    const u = props.user || getUser() || {}
    fd.append('name', String(u.name || ''))
    fd.append('email', String(u.email || ''))
    fd.append('mobile', String(u.mobile || ''))
    fd.append('dob', formatDate(formData.value.DOB))
    fd.append('sex', formData.value.Sex)
    fd.append('highest_education', formData.value.education)
    fd.append('type_of_license', formData.value.Type_of_License)
    fd.append('driving_experience', formData.value.Driving_Experience || '0')
    fd.append('current_monthly_income', formData.value.current_salary)
    fd.append('expected_monthly_income', formData.value.expected_salary)
    fd.append('license_number', formData.value.License_Number)
    fd.append('expiry_date_of_license', formatDate(formData.value.Expiry_date_of_License) || '01-01-2030')
    fd.append('pan_number', formData.value.pan)
    fd.append('gst_number', formData.value.gst)
    fd.append('address', formData.value.address)
    fd.append('city', formData.value.city)
    fd.append('pincode', formData.value.pincode)
    fd.append('states', formData.value.states)
    fd.append('state', formData.value.states)

    const endorsements = formData.value.endorsement?.split(',').filter(Boolean) || []
    endorsements.forEach((e) => fd.append('licence_endorsement[]', e))

    const vTypes = formData.value.vehicle_type?.split(',').filter(Boolean) || []
    vTypes.forEach((v) => fd.append('vehicle_type[]', v))

    if (formData.value.truck_ownership) {
      const val =
        formData.value.truck_ownership === 'own'
          ? 'I drive my own truck'
          : "I drive someone else's (owner's) truck"
      fd.append('truck_ownership', val)
    }

    if (userRole.value === 'transporter') {
      fd.append('transport_name', String(u.name || ''))
      fd.append('year_of_exp', formData.value.year_of_exp)
      fd.append('year_of_establishment', formData.value.year_of_exp)
      fd.append('fleet_size', formData.value.fleet_size)
      fd.append('average_km', formData.value.avg_km_run)
      const opSeg = formData.value.industry_segment?.split(',').filter(Boolean) || []
      opSeg.forEach((s) => fd.append('operational_segment[]', s))
      const routes = formData.value.operational_segment?.split(',').filter(Boolean) || []
      routes.forEach((r) => fd.append('routes[]', r))
    }

    if (formData.value.profileFile) {
      fd.append('images', formData.value.profileFile)
    }

    const res = await apiPostForm<{ status?: boolean; message?: string }>(
      END_POINTS.EDIT_PROFILE,
      fd
    )
    if (res?.status) {
      localStorage.removeItem('signup_incomplete')
      emit('complete')
    } else {
      alert(res?.message || 'Profile update failed')
    }
  } catch (err) {
    alert((err as Error).message || 'Failed to save profile')
  } finally {
    loading.value = false
  }
}

const isStepValid = computed(() => {
  const page = currentPage.value
  const fd = formData.value

  if (userRole.value === 'driver') {
    if (page === 0) {
      return !!(fd.DOB?.trim() && fd.Sex?.trim() && fd.education?.trim())
    }
    if (page === 1) {
      return !!(
        fd.vehicle_type?.trim() &&
        fd.Driving_Experience?.trim() &&
        fd.Type_of_License?.trim() &&
        fd.current_salary?.trim() &&
        fd.expected_salary?.trim() &&
        fd.truck_ownership?.trim()
      )
    }
    if (page === 2) {
      return !!(
        fd.profileFile &&
        fd.License_Number?.trim() &&
        fd.Expiry_date_of_License?.trim() &&
        fd.states?.trim()
      )
    }
  } else {
    // transporter
    if (page === 0) {
      return !!(fd.year_of_exp?.trim() && fd.fleet_size?.trim())
    }
    if (page === 1) {
      return !!(
        fd.industry_segment?.trim() &&
        fd.avg_km_run?.trim() &&
        fd.vehicle_type?.trim() &&
        fd.operational_segment?.trim()
      )
    }
    if (page === 2) {
      return !!fd.pan?.trim()
    }
  }
  return false
})

const handleNext = () => {
  if (!isStepValid.value && currentPage.value < PAGES - 1) return
  if (currentPage.value < PAGES - 1) {
    currentPage.value++
  } else {
    submitProfile()
  }
}

const handleBack = () => {
  if (currentPage.value > 0) currentPage.value--
}
</script>

<template>
  <div class="profile-completion">
    <header class="header">
      <div class="header-inner">
        <button v-if="currentPage > 0" type="button" class="back-btn" @click="handleBack">← Back</button>
        <div v-else class="back-btn"></div>
        <div class="header-center">
          <h2>Profile</h2>
          <p>Step {{ currentPage + 1 }} of {{ PAGES }}</p>
        </div>
        <div class="back-btn"></div>
      </div>
    </header>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <main class="content">
      <div class="content-inner">
      <!-- Page 1: Basic Info -->
      <div v-show="currentPage === 0" class="page">
        <h3>{{ userRole === 'driver' ? 'Basic Information' : 'Business Overview' }}</h3>

        <template v-if="userRole === 'driver'">
          <div class="field">
            <label>Date of Birth *</label>
            <input v-model="formData.DOB" type="date" />
          </div>
          <div class="field">
            <label>Gender *</label>
            <div class="radio-row">
              <label class="radio"><input v-model="formData.Sex" type="radio" value="Male" /> Male</label>
              <label class="radio"><input v-model="formData.Sex" type="radio" value="Female" /> Female</label>
              <label class="radio"><input v-model="formData.Sex" type="radio" value="Other" /> Other</label>
            </div>
          </div>
          <div class="field">
            <label>Highest Education *</label>
            <select v-model="formData.education">
              <option value="">Select</option>
              <option v-for="o in educationOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </template>

        <template v-else>
          <div class="field">
            <label>Years of Operation *</label>
            <div class="chip-row">
              <button
                v-for="o in experienceOptions"
                :key="o.value"
                type="button"
                class="chip"
                :class="{ selected: formData.year_of_exp === o.value }"
                @click="formData.year_of_exp = o.value"
              >
                {{ o.label }}
              </button>
            </div>
          </div>
          <div class="field">
            <label>Fleet Size *</label>
            <div class="chip-row">
              <button
                v-for="f in fleetSizes"
                :key="f.value"
                type="button"
                class="chip"
                :class="{ selected: formData.fleet_size === f.value }"
                @click="formData.fleet_size = f.value"
              >
                {{ f.label }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Page 2: Professional -->
      <div v-show="currentPage === 1" class="page">
        <h3>{{ userRole === 'driver' ? 'Driving Details' : 'Operations' }}</h3>

        <template v-if="userRole === 'driver'">
          <div class="field">
            <label>Vehicle Type *</label>
            <p class="field-hint">Select all that apply</p>
            <div class="vehicle-grid">
              <button
                v-for="v in TRUCK_VEHICLE_TYPES"
                :key="v.name"
                type="button"
                class="vehicle-tile"
                :class="{ selected: isSelected('vehicle_type', String(v.id)) }"
                @click="toggleMulti('vehicle_type', String(v.id))"
              >
                <img :src="v.image" :alt="v.name" class="vehicle-image" />
                <span class="vehicle-label">{{ v.name }}</span>
                <span v-if="isSelected('vehicle_type', String(v.id))" class="vehicle-check">✓</span>
              </button>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Driving Experience *</label>
              <select v-model="formData.Driving_Experience">
                <option value="">Select</option>
                <option v-for="o in experienceOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
            <div class="field">
              <label>License Type *</label>
              <select v-model="formData.Type_of_License">
                <option value="">Select</option>
                <option v-for="o in licenseOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>License Endorsement</label>
            <div class="chip-row">
              <button
                v-for="o in endorsementOptions"
                :key="o.value"
                type="button"
                class="chip"
                :class="{ selected: isSelected('endorsement', o.value) }"
                @click="toggleMulti('endorsement', o.value)"
              >
                {{ o.label }}
              </button>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Current Salary *</label>
              <select v-model="formData.current_salary">
                <option value="">Select</option>
                <option v-for="s in salaryRanges" :key="s" :value="s">₹{{ s }}</option>
              </select>
            </div>
            <div class="field">
              <label>Expected Salary *</label>
              <select v-model="formData.expected_salary">
                <option value="">Select</option>
                <option v-for="s in salaryRanges" :key="s" :value="s">₹{{ s }}</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label>Truck Ownership *</label>
            <div class="radio-row">
              <label class="radio">
                <input v-model="formData.truck_ownership" type="radio" value="own" /> I drive my own truck
              </label>
              <label class="radio">
                <input v-model="formData.truck_ownership" type="radio" value="transporter" /> I drive a transporter's truck
              </label>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="field">
            <label>Industry Segment *</label>
            <div class="chip-row">
              <button
                v-for="s in industrySegments"
                :key="s"
                type="button"
                class="chip"
                :class="{ selected: isSelected('industry_segment', s) }"
                @click="toggleMulti('industry_segment', s)"
              >
                {{ s }}
              </button>
            </div>
          </div>
          <div class="field">
            <label>Avg Km Run (Monthly) *</label>
            <select v-model="formData.avg_km_run">
              <option value="">Select</option>
              <option v-for="o in avgKmOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
          <div class="field">
            <label>Vehicle Type *</label>
            <p class="field-hint">Select all that apply</p>
            <div class="vehicle-grid">
              <button
                v-for="v in TRUCK_VEHICLE_TYPES"
                :key="v.name"
                type="button"
                class="vehicle-tile"
                :class="{ selected: isSelected('vehicle_type', String(v.id)) }"
                @click="toggleMulti('vehicle_type', String(v.id))"
              >
                <img :src="v.image" :alt="v.name" class="vehicle-image" />
                <span class="vehicle-label">{{ v.name }}</span>
                <span v-if="isSelected('vehicle_type', String(v.id))" class="vehicle-check">✓</span>
              </button>
            </div>
          </div>
          <div class="field">
            <label>Routes *</label>
            <div class="chip-row">
              <button
                v-for="r in routeOptions"
                :key="r.value"
                type="button"
                class="chip"
                :class="{ selected: isSelected('operational_segment', r.value) }"
                @click="toggleMulti('operational_segment', r.value)"
              >
                {{ r.label }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Page 3: Documents & Address (driver) | PAN & GST only (transporter) -->
      <div v-show="currentPage === 2" class="page">
        <h3>{{ userRole === 'transporter' ? 'Business Documents' : 'Documents & Address' }}</h3>

        <template v-if="userRole === 'driver'">
          <div class="field">
            <label>Profile Photo *</label>
            <div class="profile-photo-upload">
              <div v-if="profilePreviewUrl" class="photo-preview">
                <img :src="profilePreviewUrl" alt="Profile preview" class="photo-preview-img" />
              </div>
              <div class="file-upload">
                <input type="file" accept="image/*" @change="handleProfileFile" />
                <span>{{ formData.profileFile?.name || 'Choose file' }}</span>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>License Number *</label>
              <input v-model="formData.License_Number" type="text" placeholder="e.g. MH0120230000000" maxlength="16" />
            </div>
            <div class="field">
              <label>License Expiry *</label>
              <input v-model="formData.Expiry_date_of_License" type="date" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>State *</label>
              <select v-model="formData.states">
                <option value="">Select state</option>
                <option v-for="s in statesList" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>City</label>
              <input v-model="formData.city" type="text" placeholder="City" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Pincode</label>
              <input v-model="formData.pincode" type="text" placeholder="Pincode" maxlength="6" />
            </div>
            <div class="field">
              <label>Address</label>
              <input v-model="formData.address" type="text" placeholder="Address" />
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Transporter: only PAN and GST -->
          <div class="form-row">
            <div class="field">
              <label>PAN Number *</label>
              <input v-model="formData.pan" type="text" placeholder="e.g. ABCDE1234F" maxlength="10" />
            </div>
            <div class="field">
              <label>GST Number</label>
              <input v-model="formData.gst" type="text" placeholder="Optional" maxlength="15" />
            </div>
          </div>
        </template>
      </div>
      </div>
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <button
          type="button"
          class="next-btn"
          :disabled="loading || !isStepValid"
          @click="handleNext"
        >
          <span v-if="!loading">{{ currentPage === PAGES - 1 ? 'Finish' : 'Next' }}</span>
          <span v-else class="spinner"></span>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.profile-completion {
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-image: url('../../../assets/images/login-bg/bgprofile.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
}

.profile-completion::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(105deg, rgba(255, 255, 255, 0.9) 0%, rgba(219, 234, 254, 0.9) 55%, transparent 55.1%, transparent 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  -webkit-mask-image: linear-gradient(105deg, black 0%, black 55%, transparent 55.1%, transparent 100%);
  mask-image: linear-gradient(105deg, black 0%, black 55%, transparent 55.1%, transparent 100%);
  z-index: 0;
  pointer-events: none;
}

/* Header */
.header {
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 10;
  position: relative;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
  max-width: 100%;
}

.back-btn {
  min-width: 80px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #ffffff;
  color: #1e293b;
  transform: translateY(-1px);
}

.header-center {
  text-align: center;
}

.header-center h2 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 2px 0;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.header-center p {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.progress-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.05);
  z-index: 10;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 4px 4px 0;
}

/* Content */
.content {
  flex: 1;
  min-height: 0;
  padding: 40px 6vw 140px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 10;
  position: relative;
}

.content-inner {
  max-width: 480px;
  margin: 0;
  background: transparent;
  border: none;
  padding: 0 0 40px 0;
  box-shadow: none;
}

.page h3 {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 32px 0;
  color: #1e293b;
  letter-spacing: -0.5px;
}

/* Form fields */
.field {
  margin-bottom: 24px;
}

.field label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 10px;
}

.field input,
.field select {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
}

.field input:focus,
.field select:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.field input::placeholder,
.field select::placeholder {
  color: #94a3b8;
}

.radio-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  padding: 16px 20px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.radio:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.radio:has(input:checked) {
  border-color: #3b82f6;
  background: rgba(239, 246, 255, 0.8);
  color: #1e3a8a;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.chip {
  padding: 12px 20px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  transform: translateY(-1px);
}

.chip.selected {
  border-color: #3b82f6;
  background: rgba(239, 246, 255, 0.8);
  color: #1e3a8a;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.field-hint {
  font-size: 14px;
  color: #64748b;
  margin: -6px 0 16px 0;
}

/* Vehicle grid */
.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.vehicle-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.vehicle-tile:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.vehicle-tile.selected {
  border-color: #3b82f6;
  background: rgba(239, 246, 255, 0.8);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.vehicle-image {
  width: 100%;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
}

.vehicle-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-align: center;
  line-height: 1.4;
}

.vehicle-tile.selected .vehicle-label {
  color: #1e3a8a;
}

.vehicle-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

/* File upload */
.profile-photo-upload {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.photo-preview {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e2e8f0;
  flex-shrink: 0;
}

.photo-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-upload {
  position: relative;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  background: rgba(248, 250, 252, 0.6);
  transition: all 0.2s;
}

.file-upload:hover {
  border-color: #3b82f6;
  background: #ffffff;
}

.file-upload input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.file-upload span {
  font-size: 14px;
  color: #64748b;
}

/* Footer */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 55%;
  padding: 32px 0;
  background: transparent;
  border: none;
  box-shadow: none;
  z-index: 20;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

.footer-inner {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  pointer-events: auto;
  padding: 0 24px;
}

.next-btn {
  width: 100%;
  padding: 18px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
}

.next-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

.next-btn:active:not(:disabled) {
  transform: translateY(0);
}

.next-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tablet */
@media (min-width: 640px) {
  .vehicle-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .radio-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .radio {
    flex: 1;
    min-width: 180px;
  }
}

/* Desktop */
@media (min-width: 768px) {
  .header-inner {
    padding: 20px 32px;
  }

  .header-center h2 {
    font-size: 20px;
  }

  .content {
    padding: 40px 32px 140px;
  }

  .content-inner {
    padding: 40px 40px;
    border-radius: 20px;
  }

  .page h3 {
    font-size: 22px;
    margin-bottom: 28px;
  }

  .vehicle-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .vehicle-image {
    height: 80px;
  }

  .footer-inner {
    padding: 0;
  }

  .next-btn {
    max-width: 320px;
    margin: 0 auto;
    display: block;
  }
}

/* Large desktop */
@media (min-width: 1024px) {
  .content-inner {
    max-width: 800px;
  }

  .header-inner,
  .footer-inner {
    max-width: 800px;
  }

  .vehicle-grid {
    grid-template-columns: repeat(4, 1fr);
  }

}

/* Form row - two columns on desktop */
.form-row {
  margin-bottom: 20px;
}

.form-row .field {
  margin-bottom: 20px;
}

.form-row .field:last-child {
  margin-bottom: 0;
}

@media (min-width: 768px) {
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-row .field {
    margin-bottom: 0;
  }
}
</style>
