<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft, User, Building2, MapPin, Truck, FileText,
  PhoneCall, Edit2, Loader2, CheckCircle2
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

const handleEdit = () => emit('navigate', 'profile-edit')
const openDocument = (url: string) => {
  if (url) window.open(url, '_blank')
}

onMounted(() => fetchProfile())
</script>

<template>
  <div class="refined-overview-app">
    <!-- Premium Header -->
    <header class="top-util-nav">
      <div class="nav-brand">
        <button class="sq-back-btn" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <span>Profile Overview</span>
      </div>
      <button class="btn-edit-header" @click="handleEdit">
        <Edit2 :size="16" />
        <span>Edit Profile</span>
      </button>
    </header>

    <div v-if="loading" class="loader-state">
      <Loader2 :size="40" class="spin-icon" />
      <p>Synchronizing profile data...</p>
    </div>

    <main v-else class="viewport-flow">
      <div class="overview-grid">
        <!-- LEFT COLUMN: Identity Brief -->
        <aside class="identity-panel">
          <div class="sticky-id-card">
            <div class="hero-photo-wrap">
              <img v-if="getImageUrl(user.images as string)" :src="getImageUrl(user.images as string)" alt="Profile" />
              <div v-else class="photo-placeholder"><User :size="48" /></div>
            </div>
            
            <div class="hero-base-info">
              <h2>{{ user.name || user.name_eng || 'Account Holder' }}</h2>
              <p class="h-id-tag">{{ user.unique_id }}</p>
              <div class="h-role-pill">Transporter</div>
            </div>

            <div class="completion-track">
              <div class="track-header">
                <span>Profile Completion</span>
                <span class="pct">{{ profileFull?.profile_completion ?? 0 }}%</span>
              </div>
              <div class="track-bar">
                <div class="track-fill" :style="{ width: (profileFull?.profile_completion ?? 0) + '%' }"></div>
              </div>
            </div>
            
            <button class="btn-edit-full" @click="handleEdit">
              <Edit2 :size="16" />
              <span>Modify Details</span>
            </button>
          </div>
        </aside>

        <!-- RIGHT COLUMN: Detailed Data -->
        <div class="data-panel">
          <!-- BASIC INFO -->
          <section class="info-section">
            <div class="section-title">
              <User :size="18" />
              <span>Personal Information</span>
            </div>
            <div class="info-card">
              <div class="data-group">
                <label>Legal Name</label>
                <p>{{ user.name || user.name_eng || 'Not Provided' }}</p>
              </div>
              <div class="data-group">
                <label>Primary E-mail</label>
                <p>{{ user.email || 'Not Provided' }}</p>
              </div>
              <div class="data-group">
                <label>Phone Number</label>
                <p>{{ user.mobile || 'Not Provided' }}</p>
              </div>
            </div>
          </section>

          <!-- COMPANY INFO (Transporter Only) -->
          <template v-if="isTransporter">
            <section class="info-section">
              <div class="section-title">
                <Building2 :size="18" />
                <span>Enterprise Details</span>
              </div>
              <div class="info-card">
                <div class="data-group">
                  <label>Transport Name</label>
                  <p>{{ user.Transport_Name || user.transport_name || 'Not Provided' }}</p>
                </div>
                <div class="data-group">
                  <label>Operations Scale</label>
                  <p>{{ formatYears(user.Year_of_Establishment || user.year_of_exp) }} Experience</p>
                </div>
              </div>
            </section>

            <section class="info-section">
              <div class="section-title">
                <Truck :size="18" />
                <span>Logistics & Capacity</span>
              </div>
              <div class="info-card">
                <div class="data-box-grid">
                  <div class="data-group">
                    <label>Fleet Size</label>
                    <p>{{ user.Fleet_Size || user.fleet_size || 'Not Provided' }}</p>
                  </div>
                  <div class="data-group">
                    <label>Operational Segment</label>
                    <p>{{ user.Operational_Segment || user.operational_segment || user.Industry_Segment || 'Not Provided' }}</p>
                  </div>
                </div>
                <div class="data-group border-top">
                  <label>Routes Covered</label>
                  <p>{{ formatRoutes(user.routes || user.Routes) }}</p>
                </div>
                <div class="data-group border-top">
                  <label>Vehicle Specialization</label>
                  <p>{{ formatVehicleTypes(user.vehicle_type || user.Vehicle_Type) }}</p>
                </div>
                <div class="data-group border-top">
                  <label>Average Kilometer Run</label>
                  <p>{{ formatAvgKm(user.Average_KM || user.avg_km_run || user.average_km) }}</p>
                </div>
              </div>
            </section>
          </template>

          <!-- ADDRESS -->
          <section class="info-section">
            <div class="section-title">
              <MapPin :size="18" />
              <span>Operational Base</span>
            </div>
            <div class="info-card">
              <div class="data-group">
                <label>Full Mailing Address</label>
                <p>{{ user.address || 'Not Provided' }}</p>
              </div>
              <div class="data-box-grid">
                <div class="data-group">
                  <label>City / Region</label>
                  <p>{{ user.city || 'Not Provided' }}</p>
                </div>
                <div class="data-group">
                  <label>State & PIN</label>
                  <p>{{ getStateName((user.states || user.state) as any) }} - {{ user.pincode || 'XXXXXX' }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- DOCUMENTS -->
          <section class="info-section">
            <div class="section-title">
              <FileText :size="18" />
              <span>Regulatory Identifiers</span>
            </div>
            <div class="info-card">
              <div class="data-box-grid">
                <div class="data-group">
                  <label>Permanent Account Number (PAN)</label>
                  <p class="mono-id">{{ user.PAN_Number || user.pan || 'Not Provided' }}</p>
                  <div v-if="getImageUrl(user.PAN_Image as string)" class="doc-link" @click="openDocument(getImageUrl(user.PAN_Image as string))">
                    <CheckCircle2 :size="14" /> <span>View Document</span>
                  </div>
                </div>
                <div class="data-group">
                  <label>GST Identity Number</label>
                  <p class="mono-id">{{ user.GST_Number || user.gst || 'Not Provided' }}</p>
                  <div v-if="getImageUrl(user.GST_Certificate as string)" class="doc-link" @click="openDocument(getImageUrl(user.GST_Certificate as string))">
                    <CheckCircle2 :size="14" /> <span>View Certificate</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- POC -->
          <section class="info-section">
            <div class="section-title">
              <PhoneCall :size="18" />
              <span>Emergency Liaison (POC)</span>
            </div>
            <div class="info-card bg-highlight">
              <div class="data-box-grid">
                <div class="data-group">
                  <label>Contact Name</label>
                  <p>{{ user.name_poc || 'Not Provided' }}</p>
                </div>
                <div class="data-group">
                  <label>Contact Number</label>
                  <p>{{ user.phone_poc || 'Not Provided' }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.refined-overview-app {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
}

/* -- Header -- */
.top-util-nav {
  height: 72px; padding: 0 40px;
  background: white; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
}
.nav-brand { display: flex; align-items: center; gap: 16px; font-weight: 700; font-size: 18px; color: #0f172a; }
.sq-back-btn {
  width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: white; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s; color: #64748b;
}
.sq-back-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #0f172a; }

.btn-edit-header {
  display: flex; align-items: center; gap: 8px; padding: 10px 20px;
  border-radius: 10px; background: #0f172a; color: white; border: none;
  font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s;
}
.btn-edit-header:hover { background: #1e293b; transform: translateY(-1px); }

/* -- Loader -- */
.loader-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 20px; color: #64748b; }
.spin-icon { animation: spin 1s linear infinite; margin-bottom: 16px; color: #3b82f6; }
@keyframes spin { to { transform: rotate(360deg); } }

/* -- Viewport Layout -- */
.viewport-flow { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.overview-grid { display: grid; grid-template-columns: 320px 1fr; gap: 40px; align-items: flex-start; }

/* -- Identity Panel (STicky Sidebar) -- */
.identity-panel { position: sticky; top: 112px; }
.sticky-id-card {
  background: white; border-radius: 24px; border: 1px solid #e2e8f0; padding: 32px;
  text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}
.hero-photo-wrap {
  width: 140px; height: 140px; margin: 0 auto 24px; border-radius: 50%; padding: 6px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}
.hero-photo-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid white; background: #f1f5f9; }
.photo-placeholder { width: 100%; height: 100%; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #cbd5e1; border: 4px solid white; }

.hero-base-info h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
.h-id-tag { font-family: monospace; font-size: 14px; color: #64748b; margin: 0 0 16px 0; letter-spacing: 0.5px; }
.h-role-pill { 
  display: inline-block; padding: 4px 12px; border-radius: 20px; background: #eff6ff;
  color: #3b82f6; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #dbeafe;
}

.completion-track { margin: 32px 0; text-align: left; }
.track-header { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
.pct { color: #10b981; }
.track-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
.track-fill { height: 100%; background: #10b981; border-radius: 10px; transition: width 0.5s ease; }

.btn-edit-full {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px; border-radius: 14px; background: white; border: 1px solid #e2e8f0;
  color: #0f172a; font-weight: 700; font-size: 14px; cursor: pointer; transition: 0.2s;
}
.btn-edit-full:hover { background: #f8fafc; border-color: #cbd5e1; transform: scale(1.02); }

/* -- Data Panel Sections -- */
.data-panel { display: flex; flex-direction: column; gap: 40px; }
.info-section { display: flex; flex-direction: column; gap: 20px; }
.section-title { display: flex; align-items: center; gap: 10px; color: #64748b; padding-left: 4px; }
.section-title span { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }

.info-card { background: white; border-radius: 24px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.01); }
.info-card.bg-highlight { background: #fdf2f8; border-color: #fce7f3; }

.data-group { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; }
.data-group:first-child { padding-top: 0; }
.data-group:last-child { padding-bottom: 0; }
.data-group.border-top { border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 8px; }

.data-group label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
.data-group p { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0; }
.mono-id { font-family: monospace; letter-spacing: 1px; color: #0f172a !important; }

.data-box-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }

.doc-link { 
  display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px;
  font-weight: 700; color: #3b82f6; cursor: pointer; transition: 0.2s;
}
.doc-link:hover { color: #2563eb; text-decoration: underline; }

@media (max-width: 992px) {
  .overview-grid { grid-template-columns: 1fr; }
  .identity-panel { position: relative; top: 0; }
  .top-util-nav { padding: 0 20px; }
}

@media (max-width: 640px) {
  .data-box-grid { grid-template-columns: 1fr; }
  .info-card { padding: 24px; }
}
</style>
