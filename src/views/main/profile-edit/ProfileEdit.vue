<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  User,
  Building2,
  MapPin,
  Truck,
  FileText,
  PhoneCall,
  ArrowLeft,
  Camera,
  Upload,
  Info,
  Loader2
} from 'lucide-vue-next'
import { getProfile, getStates, updateProfile } from '../../../services/profile/profileApi'
import { BASE_URL } from '../../../services/config/api'
import { useUserStore } from '../../../stores/user'

// Truck images from assets (same as profile_completion)
import openCargoImg from '../../../assets/images/trucks/open_cargo.png'
import closeCargoImg from '../../../assets/images/trucks/close_cargo.png'
import tripperImg from '../../../assets/images/trucks/tripper.png'
import trailerImg from '../../../assets/images/trucks/tailer.png'
import tankerImg from '../../../assets/images/trucks/tainkers.png'
import carCarrierImg from '../../../assets/images/trucks/car_carrier.png'
import containerImg from '../../../assets/images/trucks/container.png'
import reeferImg from '../../../assets/images/trucks/refregerator.png'
import pickupImg from '../../../assets/images/trucks/pickup_truck.png'

const TRUCK_VEHICLE_TYPES = [
  { id: '1', name: 'Container Trucks', image: containerImg },
  { id: '3', name: 'Cargo Truck (Open)', image: openCargoImg },
  { id: '4', name: 'Cargo Truck (Closed)', image: closeCargoImg },
  { id: '8', name: 'Reefer Trucks', image: reeferImg },
  { id: '9', name: 'Car Carriers', image: carCarrierImg },
  { id: '10', name: 'Tankers', image: tankerImg },
  { id: '11', name: 'Tipper Trucks', image: tripperImg },
  { id: '20', name: 'Pickup / LCV', image: pickupImg },
  { id: '22', name: 'Trailer Trucks', image: trailerImg },
]

const props = defineProps<{
  user: {
    id: string
    unique_id: string
    name: string
    mobile: string
    email: string
    role: string
    images?: string
    state?: string
    states?: string
    city?: string
    address?: string
    pincode?: string
    Transport_Name?: string
    transport_name?: string
    PAN_Number?: string
    pan?: string
    GST_Number?: string
    gst?: string
    [key: string]: any
  }
}>()

const emit = defineEmits(['back', 'save'])

const userStore = useUserStore()
const isTransporter = computed(() => (props.user?.role || '').toLowerCase() === 'transporter')

// API data
const profileData = ref<Record<string, unknown> | null>(null)
const states = ref<{ id: string; name: string }[]>([])
const loading = ref(true)
const saving = ref(false)
const toastMsg = ref('')

// Form - transporter fields (same as app profile-edit-new)
const form = ref({
  name: '',
  email: '',
  mobile: '',
  transport_name: '',
  company_registration_type: '',
  address: '',
  city: '',
  pincode: '',
  state_id: '',
  year_of_exp: '',
  fleet_size: '',
  industry_segment: '',
  routes: '',
  avg_km_run: '',
  vehicle_type: '' as string,
  pan_number: '',
  gst_number: '',
  name_poc: '',
  phone_poc: '',
})

// File refs
const profileFile = ref<File | null>(null)
const panFile = ref<File | null>(null)
const gstFile = ref<File | null>(null)

// Options (same as app)
const companyTypeOptions = [
  { label: 'Sole Proprietorship', value: '1' },
  { label: 'One Person Company', value: '2' },
  { label: 'Partnership Firm', value: '3' },
  { label: 'Limited Liability Partnership (LLP)', value: '4' },
  { label: 'Section 8 Company', value: '5' },
  { label: 'Public Company', value: '6' },
  { label: 'Private Company', value: '7' },
]

const fleetSizeOptions = [
  { label: '0-9', value: '0-9' },
  { label: '10-50', value: '10-50' },
  { label: '51-100', value: '51-100' },
  { label: '100+', value: '100+' },
]

const yearOptions = Array.from({ length: 25 }, (_, i) => ({
  label: i === 0 ? '< 1 year' : i === 24 ? '20+ years' : `${i} year${i > 1 ? 's' : ''}`,
  value: String(i === 0 ? 0 : i === 24 ? 20 : i),
}))

const industryOptions = [
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'White Goods', value: 'white_goods' },
  { label: 'Livestock', value: 'livestock' },
  { label: 'Perishable', value: 'perishable' },
  { label: 'Oversized', value: 'oversized' },
  { label: 'Fuel Tanker', value: 'fuel_tanker' },
  { label: 'Automobile Carrier', value: 'automobile_carrier' },
  { label: 'Construction', value: 'construction' },
  { label: 'Refrigerator', value: 'refrigerator' },
  { label: 'Others', value: 'others' },
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
  { label: '1000 - 3000 km', value: '1000_3000' },
  { label: '3000 - 5000 km', value: '3000_5000' },
  { label: '5000 - 10000 km', value: '5000_10000' },
  { label: '10000+ km', value: '10000_plus' },
]

const profileImageUrl = computed(() => {
  if (profileFile.value) return URL.createObjectURL(profileFile.value)
  const img = String(profileData.value?.images ?? props.user?.images ?? '')
  if (!img) return 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
  return img.startsWith('http') ? img : `${BASE_URL}public/${img}`
})

const panImageUrl = computed(() => {
  if (panFile.value) return URL.createObjectURL(panFile.value)
  const img = String(profileData.value?.PAN_Image ?? profileData.value?.pan_image ?? '')
  if (!img) return ''
  return img.startsWith('http') ? img : `${BASE_URL}public/${img}`
})

const gstImageUrl = computed(() => {
  if (gstFile.value) return URL.createObjectURL(gstFile.value)
  const img = String(profileData.value?.GST_Certificate ?? profileData.value?.gst_certificate ?? '')
  if (!img) return ''
  return img.startsWith('http') ? img : `${BASE_URL}public/${img}`
})

function showToast(msg: string) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

function parseVehicleType(val: unknown): string {
  if (!val) return ''
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean).join(',')
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? parsed.map((v: unknown) => String(v).trim()).filter(Boolean).join(',') : val
    } catch {
      return val.split(',').map((v) => v.trim()).filter(Boolean).join(',')
    }
  }
  return String(val)
}

function initFormFromProfile(p: Record<string, unknown>) {
  form.value = {
    name: String(p.name ?? p.name_eng ?? props.user?.name ?? ''),
    email: String(p.email ?? props.user?.email ?? ''),
    mobile: String(p.mobile ?? props.user?.mobile ?? ''),
    transport_name: String(p.Transport_Name ?? p.transport_name ?? ''),
    company_registration_type: String(p.company_registration_type ?? ''),
    address: String(p.address ?? ''),
    city: String(p.city ?? ''),
    pincode: String(p.pincode ?? ''),
    state_id: String(p.state_id ?? p.states ?? p.state ?? ''),
    year_of_exp: String(p.Year_of_Exp ?? p.year_of_exp ?? p.year_of_establishment ?? p.establishment_year ?? ''),
    fleet_size: String(p.Fleet_Size ?? p.fleet_size ?? ''),
    industry_segment: String(p.Operational_Segment ?? p.Industry_Segment ?? p.industry_segment ?? p.operational_segment ?? ''),
    routes: String(p.routes ?? p.Routes ?? ''),
    avg_km_run: String(p.Average_KM ?? p.Average_Km ?? p.avg_km_run ?? p.average_km ?? p.average_run ?? ''),
    vehicle_type: parseVehicleType(p.vehicle_type ?? p.Vehicle_Type ?? ''),
    pan_number: String(p.PAN_Number ?? p.pan ?? p.pan_number ?? ''),
    gst_number: String(p.GST_Number ?? p.gst ?? p.gst_number ?? ''),
    name_poc: String(p.name_poc ?? ''),
    phone_poc: String(p.phone_poc ?? ''),
  }
}

async function fetchData() {
  loading.value = true
  try {
    const [profile, statesRes] = await Promise.all([
      getProfile(),
      getStates(),
    ])
    profileData.value = profile as Record<string, unknown>
    states.value = statesRes
    if (profile) initFormFromProfile(profile as Record<string, unknown>)
    else {
      form.value.name = String(props.user?.name ?? '')
      form.value.email = String(props.user?.email ?? '')
      form.value.mobile = String(props.user?.mobile ?? '')
      form.value.transport_name = String(props.user?.Transport_Name ?? props.user?.transport_name ?? '')
    }
  } catch (e) {
    console.error('Profile edit fetch error', e)
    showToast('Failed to load profile')
  } finally {
    loading.value = false
  }
}

function onProfileFile(e: Event) {
  const input = e.target as HTMLInputElement
  profileFile.value = input.files?.[0] ?? null
}

function onPanFile(e: Event) {
  const input = e.target as HTMLInputElement
  panFile.value = input.files?.[0] ?? null
}

function onGstFile(e: Event) {
  const input = e.target as HTMLInputElement
  gstFile.value = input.files?.[0] ?? null
}

function toggleVehicleType(id: string) {
  const current = form.value.vehicle_type.split(',').filter(Boolean)
  const idx = current.indexOf(id)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(id)
  form.value.vehicle_type = current.join(',')
}

function isVehicleSelected(id: string): boolean {
  return form.value.vehicle_type.split(',').includes(id)
}

function toggleIndustry(value: string) {
  const current = form.value.industry_segment.split(',').filter(Boolean)
  const idx = current.indexOf(value)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(value)
  form.value.industry_segment = current.join(',')
}

function toggleRoute(value: string) {
  const current = form.value.routes.split(',').filter(Boolean)
  const idx = current.indexOf(value)
  if (idx >= 0) current.splice(idx, 1)
  else current.push(value)
  form.value.routes = current.join(',')
}

async function handleSave() {
  if (!isTransporter.value) {
    emit('back')
    return
  }
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('name', form.value.name)
    fd.append('email', form.value.email)
    fd.append('mobile', form.value.mobile)
    fd.append('address', form.value.address)
    fd.append('city', form.value.city)
    fd.append('pincode', form.value.pincode)
    const stateVal = form.value.state_id
    fd.append('states', stateVal)
    fd.append('state', stateVal)

    // Transporter fields (same as app)
    fd.append('transport_name', form.value.transport_name)
    fd.append('company_registration_type', form.value.company_registration_type)
    fd.append('year_of_exp', form.value.year_of_exp)
    fd.append('year_of_establishment', form.value.year_of_exp)
    fd.append('fleet_size', form.value.fleet_size)
    fd.append('operational_segment', form.value.industry_segment)
    form.value.routes.split(',').filter(Boolean).forEach((r) => fd.append('routes[]', r.trim()))
    fd.append('average_km', form.value.avg_km_run)
    form.value.vehicle_type.split(',').filter(Boolean).forEach((vt) => fd.append('vehicle_type[]', vt.trim()))
    fd.append('pan_number', form.value.pan_number)
    fd.append('gst_number', form.value.gst_number)
    fd.append('name_poc', form.value.name_poc)
    fd.append('phone_poc', form.value.phone_poc)

    if (profileFile.value) fd.append('images', profileFile.value)
    if (panFile.value) fd.append('pan_image', panFile.value)
    if (gstFile.value) fd.append('gst_certificate', gstFile.value)

    const res = await updateProfile(fd)
    if (res?.status) {
      showToast(res.message || 'Profile updated')
      const fresh = await getProfile()
      if (fresh) userStore.setUser({ ...userStore.user, ...fresh } as any)
      emit('save')
      emit('back')
    } else {
      showToast(res?.message || 'Update failed')
    }
  } catch (e) {
    showToast((e as Error).message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchData())
watch(() => props.user, () => initFormFromProfile({ ...props.user }), { deep: true })
</script>

<template>
  <div class="profile-edit-page">
    <header class="edit-header">
      <div class="header-inner">
        <button class="back-btn" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-text">
          <h1>Edit Profile</h1>
          <p>Update your professional identification</p>
        </div>
        <button class="save-btn-top" :disabled="saving" @click="handleSave">
          <Loader2 v-if="saving" :size="18" class="spin" />
          <span v-else>Save Changes</span>
        </button>
      </div>
    </header>

    <div v-if="!isTransporter" class="edit-content">
      <p class="non-transporter-msg">Profile edit is available for transporters. Please use the app for driver profile edit.</p>
      <button class="back-action-btn" @click="emit('back')">Go Back</button>
    </div>

    <div v-else-if="loading" class="edit-content loading-state">
      <Loader2 :size="48" class="spin" />
      <p>Loading profile...</p>
    </div>

    <div v-else class="edit-content">
      <!-- Profile Photo -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #3b82f615; color: #3b82f6;"><User :size="20" /></div>
          <h3>Profile Photo</h3>
        </div>
        <div class="photo-edit-container">
          <div class="photo-preview">
            <img :src="profileImageUrl" alt="Profile" />
            <label class="photo-overlay">
              <Camera :size="20" />
              <input type="file" accept="image/*" class="hidden-input" @change="onProfileFile" />
            </label>
          </div>
          <div class="photo-info">
            <h4>Your Professional Avatar</h4>
            <p>Upload a clear face photo to build trust.</p>
            <label class="upload-btn">
              <Upload :size="16" />
              <span>Change Image</span>
              <input type="file" accept="image/*" class="hidden-input" @change="onProfileFile" />
            </label>
          </div>
        </div>
      </section>

      <!-- Personal Info -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #10b98115; color: #10b981;"><Info :size="20" /></div>
          <h3>Personal Information</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Full Name</label>
            <input v-model="form.name" type="text" placeholder="Enter Full Name" />
          </div>
          <div class="input-group">
            <label>E-mail</label>
            <input v-model="form.email" type="email" placeholder="Enter Email" />
          </div>
          <div class="input-group">
            <label>Mobile Number</label>
            <input v-model="form.mobile" type="text" readonly disabled />
            <span class="input-note">Mobile cannot be changed</span>
          </div>
        </div>
      </section>

      <!-- Company Info -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #6366f115; color: #6366f1;"><Building2 :size="20" /></div>
          <h3>Company Details</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Transport Name *</label>
            <input v-model="form.transport_name" type="text" placeholder="Enter Transport Name" />
          </div>
          <div class="input-group">
            <label>Company Registration Type</label>
            <select v-model="form.company_registration_type">
              <option value="">Select</option>
              <option v-for="opt in companyTypeOptions" :key="String(opt.value)" :value="String(opt.value)">{{ opt.label }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Address -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #ef444415; color: #ef4444;"><MapPin :size="20" /></div>
          <h3>Address Information</h3>
        </div>
        <div class="input-grid">
          <div class="input-group full">
            <label>Full Address</label>
            <input v-model="form.address" type="text" placeholder="Enter Address" />
          </div>
          <div class="input-group">
            <label>City</label>
            <input v-model="form.city" type="text" placeholder="Enter City" />
          </div>
          <div class="input-group">
            <label>Pincode</label>
            <input v-model="form.pincode" type="text" placeholder="Enter Pincode" maxlength="6" />
          </div>
          <div class="input-group">
            <label>State</label>
            <select v-model="form.state_id">
              <option value="">Select State</option>
              <option v-for="s in states" :key="String(s.id)" :value="String(s.id)">{{ s.name }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Operation Details -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #f59e0b15; color: #f59e0b;"><Truck :size="20" /></div>
          <h3>Operation Details</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Years of Operation</label>
            <select v-model="form.year_of_exp">
              <option value="">Select</option>
              <option v-for="opt in yearOptions" :key="String(opt.value)" :value="String(opt.value)">{{ opt.label }}</option>
            </select>
          </div>
          <div class="input-group">
            <label>Fleet Size</label>
            <select v-model="form.fleet_size">
              <option value="">Select</option>
              <option v-for="opt in fleetSizeOptions" :key="String(opt.value)" :value="String(opt.value)">{{ opt.label }}</option>
            </select>
          </div>
          <div class="input-group">
            <label>Average Km Run</label>
            <select v-model="form.avg_km_run">
              <option value="">Select</option>
              <option v-for="opt in avgKmOptions" :key="String(opt.value)" :value="String(opt.value)">{{ opt.label }}</option>
            </select>
          </div>
        </div>
        <div class="chip-section">
          <label>Operational Segment (Industry)</label>
          <div class="chip-grid">
            <button
              v-for="opt in industryOptions"
              :key="opt.value"
              type="button"
              class="chip"
              :class="{ selected: form.industry_segment.split(',').includes(opt.value) }"
              @click="toggleIndustry(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div class="chip-section">
          <label>Routes</label>
          <div class="chip-grid">
            <button
              v-for="opt in routeOptions"
              :key="opt.value"
              type="button"
              class="chip"
              :class="{ selected: form.routes.split(',').includes(opt.value) }"
              @click="toggleRoute(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div class="chip-section vehicle-section">
          <label>Vehicle Types</label>
          <p class="field-hint">Select all that apply</p>
          <div class="vehicle-grid">
            <button
              v-for="v in TRUCK_VEHICLE_TYPES"
              :key="v.id"
              type="button"
              class="vehicle-tile"
              :class="{ selected: isVehicleSelected(v.id) }"
              @click="toggleVehicleType(v.id)"
            >
              <img :src="v.image" :alt="v.name" class="vehicle-image" />
              <span class="vehicle-label">{{ v.name }}</span>
              <span v-if="isVehicleSelected(v.id)" class="vehicle-check">✓</span>
            </button>
          </div>
        </div>
      </section>

      <!-- PAN & GST -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #8b5cf615; color: #8b5cf6;"><FileText :size="20" /></div>
          <h3>PAN & GST Documents</h3>
        </div>
        <div class="document-grid">
          <div class="doc-item">
            <div class="input-group">
              <label>PAN Number</label>
              <input v-model="form.pan_number" type="text" placeholder="ABCDE1234F" maxlength="10" style="text-transform: uppercase" />
            </div>
            <div class="doc-upload-box">
              <img v-if="panImageUrl" :src="panImageUrl" class="doc-placeholder" alt="PAN" />
              <span v-else class="doc-placeholder-text">PAN Document</span>
              <label class="doc-edit-btn">
                <Camera :size="16" />
                <input type="file" accept="image/*" class="hidden-input" @change="onPanFile" />
              </label>
            </div>
          </div>
          <div class="doc-item">
            <div class="input-group">
              <label>GST Number</label>
              <input v-model="form.gst_number" type="text" placeholder="22AAAAA0000A1Z5" maxlength="15" style="text-transform: uppercase" />
            </div>
            <div class="doc-upload-box">
              <img v-if="gstImageUrl" :src="gstImageUrl" class="doc-placeholder" alt="GST" />
              <span v-else class="doc-placeholder-text">GST Certificate</span>
              <label class="doc-edit-btn">
                <Camera :size="16" />
                <input type="file" accept="image/*" class="hidden-input" @change="onGstFile" />
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- Emergency Contact -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #0ea5e915; color: #0ea5e9;"><PhoneCall :size="20" /></div>
          <h3>Emergency Contact (POC)</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Second Contact Name</label>
            <input v-model="form.name_poc" type="text" placeholder="Enter Name" />
          </div>
          <div class="input-group">
            <label>Second Contact Mobile</label>
            <input v-model="form.phone_poc" type="text" placeholder="Enter Mobile" maxlength="10" />
          </div>
        </div>
      </section>
    </div>

    <div v-if="toastMsg" class="profile-toast">{{ toastMsg }}</div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.profile-edit-page {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
}

.edit-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eef0f2;
  padding: 16px 32px;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.header-text { flex: 1; }
.header-text h1 { font-size: 20px; font-weight: 700; margin: 0; color: #0f172a; }
.header-text p { font-size: 13px; color: #64748b; margin: 2px 0 0 0; }

.save-btn-top {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.save-btn-top:disabled { opacity: 0.7; cursor: not-allowed; }

.edit-content {
  max-width: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.loading-state {
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #64748b;
}

.non-transporter-msg {
  color: #64748b;
  font-size: 15px;
  margin-bottom: 16px;
}

.back-action-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}

.edit-section {
  border: 1px solid #eef0f2;
  border-radius: 24px;
  padding: 28px;
  background: #ffffff;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-header h3 { font-size: 18px; font-weight: 700; margin: 0; color: #0f172a; }

.photo-edit-container {
  display: flex;
  align-items: center;
  gap: 32px;
}

.photo-preview {
  position: relative;
  width: 120px;
  height: 120px;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  object-fit: cover;
  border: 4px solid #f8fafc;
}

.photo-overlay {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  background: #3b82f6;
  color: white;
  border: 4px solid white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.hidden-input { display: none; }

.photo-info h4 { font-size: 16px; font-weight: 700; margin: 0 0 6px 0; }
.photo-info p { font-size: 14px; color: #64748b; max-width: 400px; margin: 0 0 16px 0; }
.upload-btn {
  background: white;
  border: 1px solid #eef0f2;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group.full { grid-column: 1 / -1; }
.input-group label { font-size: 13px; font-weight: 700; color: #64748b; }
.input-group input, .input-group select {
  height: 52px;
  border: 1px solid #eef0f2;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 15px;
  background: #f8fafc;
  color: #0f172a;
}
.input-group input:disabled { opacity: 0.6; background: #f1f5f9; }
.input-note { font-size: 11px; color: #94a3b8; }

.chip-section { margin-top: 20px; }
.chip-section label { display: block; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 12px; }
.chip-section.vehicle-section { margin-top: 24px; }
.field-hint { font-size: 12px; color: #94a3b8; margin: -4px 0 12px 0; }
.chip-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.vehicle-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.vehicle-tile:hover { border-color: #adb5bd; }
.vehicle-tile.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}
.vehicle-image {
  width: 100%;
  height: 72px;
  object-fit: contain;
  margin-bottom: 8px;
}
.vehicle-label {
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  text-align: center;
  line-height: 1.2;
}
.vehicle-tile.selected .vehicle-label { color: #3b82f6; }
.vehicle-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.chip.selected { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }

.document-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.doc-item { display: flex; flex-direction: column; gap: 16px; }
.doc-upload-box {
  position: relative;
  height: 200px;
  background: #f8fafc;
  border: 2px dashed #eef0f2;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.doc-placeholder { max-width: 90%; max-height: 90%; object-fit: contain; }
.doc-placeholder-text { font-size: 14px; color: #94a3b8; }
.doc-edit-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #eef0f2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.profile-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30,41,59,0.95);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  z-index: 3000;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .input-grid { grid-template-columns: 1fr; }
  .document-grid { grid-template-columns: 1fr; }
  .photo-edit-container { flex-direction: column; }
}
</style>
