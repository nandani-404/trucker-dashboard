<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  User,
  Building2,
  MapPin,
  Truck,
  FileText,
  PhoneCall,
  Edit2,
  Loader2,
  Calendar,
  Briefcase
} from 'lucide-vue-next'
import { getProfileFull } from '../../../services/profile/profileApi'
import { BASE_URL } from '../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

const loading = ref(true)
const profileFull = ref<{
  user: Record<string, unknown> | null
  profile_completion?: string | number
  rank?: string
  star_rating?: number
  dashboard_status?: Record<string, unknown>
} | null>(null)

const user = computed(() => profileFull.value?.user ?? {})
const isTransporter = computed(() => (user.value?.role as string || '').toLowerCase() === 'transporter')

const STATE_ID_MAP: Record<string, string> = {
  '1': 'Andaman and Nicobar Islands', '2': 'Andhra Pradesh', '3': 'Arunachal Pradesh', '4': 'Assam',
  '5': 'Bihar', '6': 'Chandigarh', '7': 'Chhattisgarh', '8': 'Dadra and Nagar Haveli', '9': 'Delhi',
  '10': 'Goa', '11': 'Gujarat', '12': 'Haryana', '13': 'Himachal Pradesh', '14': 'Jammu and Kashmir',
  '15': 'Jharkhand', '16': 'Karnataka', '17': 'Kerala', '18': 'Ladakh', '19': 'Lakshadweep',
  '20': 'Madhya Pradesh', '21': 'Maharashtra', '22': 'Manipur', '23': 'Meghalaya', '24': 'Mizoram',
  '25': 'Nagaland', '26': 'Odisha', '27': 'Others', '28': 'Puducherry', '29': 'Punjab',
  '30': 'Rajasthan', '31': 'Sikkim', '32': 'Tamil Nadu', '33': 'Telangana', '34': 'Tripura',
  '35': 'Uttar Pradesh', '36': 'Uttarakhand', '37': 'West Bengal', '38': 'Daman and Diu',
}

const VEHICLE_TYPE_MAP: Record<string, string> = {
  '1': 'Container Trucks', '2': 'Heavy Commercial Vehicles', '3': 'Heavy Open Body Trucks',
  '4': 'Light Commercial Vehicles', '5': 'Light Open Body Trucks', '6': 'Medium Commercial Vehicles',
  '7': 'Multi-Axle Trucks', '8': 'Refrigerated Trucks', '9': 'Special Purpose Trucks', '10': 'Tankers',
  '11': 'Tippers', '13': 'Crane Mounted Lorries', '14': 'Curtainsiders', '15': 'Flatbeds',
  '16': 'Light Commercial Vehicles (LCVs)', '17': 'Medium and Heavy Commercial Vehicles (MHCVs)',
  '18': 'Mini Trucks', '19': 'Moffett Lorries', '20': 'Pickups', '21': 'Three-Wheelers',
  '22': 'Trailer Trucks', '23': 'Transporters', '24': 'Trucks', '25': 'Walking Floor Lorries', '26': 'Car Carrier',
}

const AVG_KM_MAP: Record<string, string> = {
  less_1000: '< 1000 km', '1000_3000': '1000 - 3000 km', '3000_5000': '3000 - 5000 km',
  '5000_10000': '5000 - 10000 km', '10000_plus': '10000+ km',
}

const YEAR_MAP: Record<string, string> = {
  '0': '< 1 year', '1': '1 year', '2': '2 years', '3': '3 years', '4': '4 years', '5': '5 years',
  '6-10': '6-10 years', '10+': '10+ years', '20': '20+ years',
}

function getStateName(val: string | number | undefined): string {
  if (!val) return 'Not Provided'
  const s = String(val).trim()
  return STATE_ID_MAP[s] || s
}

function formatVehicleTypes(val: unknown): string {
  if (!val) return 'Not Provided'
  const arr = Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',') : [val])
  const names = arr.map((v) => VEHICLE_TYPE_MAP[String(v).trim()] || String(v)).filter(Boolean)
  return names.length ? names.join(', ') : 'Not Provided'
}

function formatRoutes(val: unknown): string {
  if (!val) return 'Not Provided'
  const arr = Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',') : [val])
  return arr.map((v) => String(v).trim()).filter(Boolean).join(', ') || 'Not Provided'
}

function formatAvgKm(val: unknown): string {
  if (!val) return 'Not Provided'
  return AVG_KM_MAP[String(val)] || String(val)
}

function formatYears(val: unknown): string {
  if (!val) return 'Not Provided'
  return YEAR_MAP[String(val)] || String(val)
}

function getImageUrl(path: string | undefined): string {
  if (!path) return ''
  return path.startsWith('http') ? path : `${BASE_URL}public/${path}`
}

async function fetchProfile() {
  loading.value = true
  try {
    profileFull.value = await getProfileFull() as any
  } catch (e) {
    console.error('Profile overview fetch error', e)
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  emit('navigate', 'profile-edit')
}

onMounted(() => fetchProfile())
</script>

<template>
  <div class="profile-overview">
    <header class="overview-header">
      <button class="back-btn" @click="emit('back')">
        <ArrowLeft :size="22" />
      </button>
      <h1>Profile Overview</h1>
      <button class="edit-btn" @click="handleEdit">
        <Edit2 :size="18" />
        <span>Edit</span>
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="48" class="spin" />
      <p>Loading profile...</p>
    </div>

    <div v-else class="overview-content">
      <!-- Profile Photo -->
      <section class="field-card">
        <div class="card-header">
          <User :size="20" />
          <h3>Profile Photo</h3>
        </div>
        <div class="card-body">
          <div class="photo-preview">
            <img
              v-if="getImageUrl(user.images as string)"
              :src="getImageUrl(user.images as string)"
              alt="Profile"
              class="profile-photo-img"
            />
            <div v-else class="photo-placeholder">
              <User :size="40" />
            </div>
          </div>
        </div>
      </section>

      <!-- Personal Information -->
      <section class="field-card">
        <div class="card-header">
          <User :size="20" />
          <h3>Personal Information</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <span class="field-label">Full Name</span>
            <span class="field-value">{{ user.name || user.name_eng || 'Not Provided' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Email</span>
            <span class="field-value">{{ user.email || 'Not Provided' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Mobile</span>
            <span class="field-value">{{ user.mobile || 'Not Provided' }}</span>
          </div>
        </div>
      </section>

      <!-- Transporter: Transport Name -->
      <template v-if="isTransporter">
        <section class="field-card">
          <div class="card-header">
            <Building2 :size="20" />
            <h3>Company Details</h3>
          </div>
          <div class="card-body">
            <div class="field-row">
              <span class="field-label">Transport Name</span>
              <span class="field-value">{{ user.Transport_Name || user.transport_name || 'Not Provided' }}</span>
            </div>
          </div>
        </section>

        <section class="field-card">
          <div class="card-header">
            <Calendar :size="20" />
            <h3>Years of Operation</h3>
          </div>
          <div class="card-body">
            <div class="field-row">
              <span class="field-label">Years</span>
              <span class="field-value">{{ formatYears(user.Year_of_Establishment || user.year_of_exp) }}</span>
            </div>
          </div>
        </section>

        <section class="field-card">
          <div class="card-header">
            <Truck :size="20" />
            <h3>Fleet & Operations</h3>
          </div>
          <div class="card-body">
            <div class="field-row">
              <span class="field-label">Fleet Size</span>
              <span class="field-value">{{ user.Fleet_Size || user.fleet_size || 'Not Provided' }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Operational Segment</span>
              <span class="field-value">{{ user.Operational_Segment || user.operational_segment || user.Industry_Segment || 'Not Provided' }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Routes</span>
              <span class="field-value">{{ formatRoutes(user.routes || user.Routes) }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Average Km Run</span>
              <span class="field-value">{{ formatAvgKm(user.Average_KM || user.avg_km_run || user.average_km) }}</span>
            </div>
          </div>
        </section>

        <section class="field-card">
          <div class="card-header">
            <Truck :size="20" />
            <h3>Vehicle Types</h3>
          </div>
          <div class="card-body">
            <div class="field-row">
              <span class="field-label">Vehicle Type</span>
              <span class="field-value">{{ formatVehicleTypes(user.vehicle_type || user.Vehicle_Type) }}</span>
            </div>
          </div>
        </section>
      </template>

      <!-- Address -->
      <section class="field-card">
        <div class="card-header">
          <MapPin :size="20" />
          <h3>Address Information</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <span class="field-label">Address</span>
            <span class="field-value">{{ user.address || 'Not Provided' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">City</span>
            <span class="field-value">{{ user.city || 'Not Provided' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Pincode</span>
            <span class="field-value">{{ user.pincode || 'Not Provided' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">State</span>
            <span class="field-value">{{ getStateName(user.states || user.state) }}</span>
          </div>
        </div>
      </section>

      <!-- PAN & GST -->
      <section class="field-card">
        <div class="card-header">
          <FileText :size="20" />
          <h3>PAN & GST Documents</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <span class="field-label">PAN Number</span>
            <span class="field-value">{{ user.PAN_Number || user.pan || 'Not Provided' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">GST Number</span>
            <span class="field-value">{{ user.GST_Number || user.gst || 'Not Provided' }}</span>
          </div>
          <div v-if="getImageUrl(user.PAN_Image as string)" class="field-row img-row">
            <span class="field-label">PAN Image</span>
            <img :src="getImageUrl(user.PAN_Image as string)" alt="PAN" class="doc-thumb" />
          </div>
          <div v-if="getImageUrl(user.GST_Certificate as string)" class="field-row img-row">
            <span class="field-label">GST Certificate</span>
            <img :src="getImageUrl(user.GST_Certificate as string)" alt="GST" class="doc-thumb" />
          </div>
        </div>
      </section>

      <!-- POC -->
      <section class="field-card">
        <div class="card-header">
          <PhoneCall :size="20" />
          <h3>Emergency Contact (POC)</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <span class="field-label">Second Contact Name</span>
            <span class="field-value">{{ user.name_poc || 'Not Provided' }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Second Contact Mobile</span>
            <span class="field-value">{{ user.phone_poc || 'Not Provided' }}</span>
          </div>
        </div>
      </section>

      <!-- Profile Completion -->
      <section class="field-card completion-card">
        <div class="card-body">
          <div class="completion-row">
            <span class="field-label">Profile Completion</span>
            <span class="completion-value">{{ profileFull?.profile_completion ?? 0 }}%</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-overview {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', sans-serif;
}

.overview-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #eef0f2;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
}

.overview-header h1 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #64748b;
}

.overview-content {
  padding: 20px;
  padding-bottom: 40px;
}

.field-card {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.card-body {
  padding: 16px 20px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.field-row:last-child { border-bottom: none; }

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

.img-row { flex-direction: row; align-items: center; gap: 16px; }
.doc-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.photo-preview {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.profile-photo-img {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  object-fit: cover;
  border: 4px solid #f1f5f9;
}

.photo-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.completion-card .completion-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completion-value {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
