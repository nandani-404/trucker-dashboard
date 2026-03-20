<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowLeft, Truck, User, 
  Settings, ShieldCheck, FileText, 
  CheckCircle2, 
  AlertCircle, Shield, CreditCard,
  Hash, Weight, Users, Droplets
} from 'lucide-vue-next'
import { END_POINTS, apiGet } from '../../../../../services/config/api'

const props = defineProps<{
  id: string
}>()

const emit = defineEmits(['back'])

// --- State ---
const vehicle = ref<any>(null)
const loading = ref(true)

onMounted(() => {
    fetchVehicle()
})

const fetchVehicle = async () => {
  try {
    loading.value = true
    const response: any = await apiGet(END_POINTS.TRUCKER_GET_VEHICLES)
    if (response?.status === 'success') {
      const data = response.data?.data || response.data || []
      const found = data.find((v: any) => String(v.registration_number || v.id) === String(props.id))
      vehicle.value = found || null
    }
  } catch (error) {
    console.error('Error fetching vehicle detail:', error)
  } finally {
    loading.value = false
  }
}

// --- Helpers from Provided Code ---
const formatDisplayDate = (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanStr ? cleanStr.split('-') : [];
    if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let year, monthNum, day;
        if (parts[0] && parts[0].length === 4) {
            year = parts[0];
            monthNum = Number(parts[1]);
            day = parts[2];
        } else {
            year = parts[2];
            monthNum = Number(parts[1]);
            day = parts[0];
        }
        const month = months[monthNum - 1];
        if (month) return `${String(day).padStart(2, '0')} ${month} ${year}`;
    }
    return cleanStr;
};

const isDocumentValidStr = (dateStr: string | null | undefined): boolean => {
    if (!dateStr || dateStr === 'N/A') return false;
    const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanStr ? cleanStr.split('-') : [];
    if (parts.length !== 3) return false;
    
    let year, month, day;
    if (parts[0] && parts[0].length === 4) {
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
    } else {
        year = Number(parts[2]);
        month = Number(parts[1]);
        day = Number(parts[0]);
    }
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    const dobj = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dobj.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff >= 5;
};

const getDaysLeftStr = (dateStr: string | null | undefined) => {
  if (!dateStr || dateStr === 'N/A') return 0;
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanStr ? cleanStr.split('-') : [];
  if (parts.length !== 3) return 0;
  let year, month, day;
  if (parts[0] && parts[0].length === 4) {
    year = Number(parts[0]);
    month = Number(parts[1]);
    day = Number(parts[2]);
  } else {
    year = Number(parts[2]);
    month = Number(parts[1]);
    day = Number(parts[0]);
  }
  const dobj = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((dobj.getTime() - today.getTime()) / (1000 * 3600 * 24));
}
</script>

<template>
  <div class="detail-view">
    <!-- STICKY HEADER -->
    <header class="detail-header">
      <div class="header-content">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-titles">
          <span class="sub">Vehicle Details</span>
          <h1 v-if="vehicle">{{ vehicle.registration_number }}</h1>
          <div v-else class="skeleton h-24 w-120"></div>
        </div>
        <div class="header-actions">
          <!-- Buttons Removed -->
        </div>
      </div>
    </header>

    <main class="detail-main" v-if="!loading && vehicle">
      <!-- TOP OVERVIEW SECTION -->
      <section class="overview-section">
        <div class="identity-card">
          <div class="id-icon">
            <Truck :size="48" />
          </div>
          <div class="id-info">
            <h2>{{ vehicle.manufacturer }} {{ vehicle.model }}</h2>
            <div class="id-badges">
              <span class="badge blue">{{ vehicle.body_type }}</span>
              <span class="badge gray">{{ vehicle.fuel_type }}</span>
              <span class="badge status active">RC {{ vehicle.rc_status }}</span>
              <span class="badge color-tag">
                <div class="color-dot" :style="{ background: vehicle.color?.toLowerCase() }"></div>
                {{ vehicle.color }}
              </span>
            </div>
          </div>
        </div>

        <div class="quick-stats">
          <div class="q-stat">
            <label>Registration Date</label>
            <p>{{ formatDisplayDate(vehicle.registration_date) }}</p>
          </div>
          <div class="q-stat">
            <label>Insurance Upto</label>
            <p :class="{ 'text-danger': !isDocumentValidStr(vehicle.insurance_validity) }">
                {{ formatDisplayDate(vehicle.insurance_validity) }}
            </p>
          </div>
          <div class="q-stat">
            <label>Permit Valid</label>
            <p>{{ formatDisplayDate(vehicle.national_permit_validity) }}</p>
          </div>
        </div>
      </section>

      <!-- DETAIL GRIDS -->
      <div class="details-grid">
        
        <!-- OWNER INFO -->
        <div class="detail-card animate-in-1 border-blue">
          <div class="card-title bg-blue-subtle">
            <User :size="18" class="color-blue" />
            <h3 class="color-blue-dark">Owner Details</h3>
          </div>
          <div class="card-body">
            <div class="info-row">
              <label>Owner Name</label>
              <p>{{ vehicle.owner_name }}</p>
            </div>
            <div class="info-row">
              <label>Father / Care Of</label>
              <p>{{ vehicle.father_name }}</p>
            </div>
            <div class="info-row">
              <label>Address</label>
              <p class="address">{{ vehicle.permanent_address }}</p>
            </div>
            <div class="info-row">
              <label>Hypothecation</label>
              <p class="accent">{{ vehicle.hypothecation }}</p>
            </div>
          </div>
        </div>

        <!-- REGISTRATION DETAILS -->
        <div class="detail-card animate-in-2 border-emerald">
          <div class="card-title bg-emerald-subtle">
            <FileText :size="18" class="color-emerald" />
            <h3 class="color-emerald-dark">Registration</h3>
          </div>
          <div class="card-body">
            <div class="info-row">
              <label>RTO Name</label>
              <p>{{ vehicle.rto_name }}</p>
            </div>
            <div class="info-row">
              <label>RC Status</label>
              <p class="status-active">{{ vehicle.rc_status }}</p>
            </div>
            <div class="info-row">
              <label>Valid Upto</label>
              <p>{{ formatDisplayDate(vehicle.registration_valid_upto) }}</p>
            </div>
            <div class="info-row">
              <label>Vehicle Class</label>
              <p>{{ vehicle.vehicle_class }}</p>
            </div>
          </div>
        </div>

        <!-- SPECIFICATIONS -->
        <div class="detail-card animate-in-3 border-indigo">
          <div class="card-title bg-indigo-subtle">
            <Settings :size="18" class="color-indigo" />
            <h3 class="color-indigo-dark">Specifications</h3>
          </div>
          <div class="card-body triple-row">
            <div class="info-item">
              <Hash :size="14" />
              <div>
                <label>Chassis No.</label>
                <p>{{ vehicle.chassis_number }}</p>
              </div>
            </div>
            <div class="info-item">
              <Settings :size="14" />
              <div>
                <label>Engine No.</label>
                <p>{{ vehicle.engine_number }}</p>
              </div>
            </div>
            <div class="info-item">
              <Droplets :size="14" />
              <div>
                <label>Cubic Capacity</label>
                <p>{{ vehicle.cubic_capacity }}</p>
              </div>
            </div>
            <div class="info-item">
              <Weight :size="14" />
              <div>
                <label>GVW</label>
                <p>{{ vehicle.gross_vehicle_weight }} kg</p>
              </div>
            </div>
            <div class="info-item">
              <Weight :size="14" />
              <div>
                <label>Unladen Weight</label>
                <p>{{ vehicle.unladen_weight }} kg</p>
              </div>
            </div>
            <div class="info-item">
              <Users :size="14" />
              <div>
                <label>Seating</label>
                <p>{{ vehicle.seating_capacity }} Person</p>
              </div>
            </div>
          </div>
        </div>

        <!-- DOCUMENT VALIDITY -->
        <div class="detail-card validity-card animate-in-4 border-rose">
          <div class="card-title bg-rose-subtle">
            <ShieldCheck :size="18" class="color-rose" />
            <h3 class="color-rose-dark">Document Validity</h3>
          </div>
          <div class="card-body">
            <div class="validity-row" v-for="doc in [
              { label: 'Fitness', date: vehicle.fitness_valid_upto },
              { label: 'Road Tax', date: vehicle.road_tax_paid_upto },
              { label: 'Insurance', date: vehicle.insurance_validity },
              { label: 'PUCC (Emission)', date: vehicle.pollution_valid_upto },
              { label: 'State Permit', date: vehicle.state_permit_validity },
              { label: 'National Permit', date: vehicle.national_permit_validity }
            ]" :key="doc.label">
              <div class="doc-info">
                <CheckCircle2 v-if="isDocumentValidStr(doc.date)" :size="16" class="v-icon icon-success" />
                <AlertCircle v-else :size="16" class="v-icon icon-danger" />
                <span>{{ doc.label }}</span>
              </div>
              <div class="doc-date">
                <p :class="{ 'date-danger': !isDocumentValidStr(doc.date) }">{{ formatDisplayDate(doc.date) }}</p>
                <small v-if="isDocumentValidStr(doc.date)">Expires in {{ getDaysLeftStr(doc.date) }} days</small>
                <small v-else class="expired">EXPIRED</small>
              </div>
            </div>
          </div>
        </div>

        <!-- INSURANCE & PERMITS -->
        <div class="detail-card animate-in-5 span-2 border-amber">
            <div class="split-card">
                <div class="split-side">
                    <div class="card-title bg-amber-subtle"><Shield :size="18" class="color-amber" /><h3 class="color-amber-dark">Insurance Info</h3></div>
                    <div class="card-body p-16">
                        <div class="info-row">
                            <label>Provider</label>
                            <p>{{ vehicle.insurance_company }}</p>
                        </div>
                        <div class="info-row">
                            <label>Policy Number</label>
                            <p class="mono">{{ vehicle.insurance_policy_number }}</p>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="split-side">
                    <div class="card-title bg-amber-subtle">
                        <CreditCard :size="18" class="color-amber" />
                        <h3 class="color-amber-dark">Permit Details</h3>
                    </div>
                    <div class="card-body p-16">
                        <div class="info-row">
                            <label>National Permit No.</label>
                            <p class="mono">{{ vehicle.national_permit_number }}</p>
                        </div>
                        <div class="info-row">
                            <label>State Permit No.</label>
                            <p class="mono">{{ vehicle.state_permit_number }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>

    <!-- LOADING STATE -->
    <main v-else class="detail-main">
        <div class="skeleton-loader">
            <div class="skeleton h-300 w-full mb-32"></div>
            <div class="skeleton-grid">
                <div v-for="i in 4" :key="i" class="skeleton h-200 w-full"></div>
            </div>
        </div>
    </main>
  </div>
</template>

<style scoped>
.detail-view {
  min-height: 100vh;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
}

/* Header */
.detail-header {
  height: 80px; background: white; border-bottom: 1px solid #e2e8f0;
  position: sticky; top: 0; z-index: 100; display: flex; align-items: center;
}
.header-content {
  max-width: 1400px; margin: 0 auto; width: 100%; padding: 0 40px;
  display: flex; align-items: center; gap: 24px;
}
.btn-back {
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s; background: white;
}
.btn-back:hover { background: #f1f5f9; transform: translateX(-2px); }
.header-titles .sub { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.header-titles h1 { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }

.header-actions { margin-left: auto; display: flex; gap: 12px; }
.btn-outline {
  height: 44px; padding: 0 20px; border-radius: 12px; border: 1px solid #2563eb;
  color: #2563eb; font-weight: 700; background: transparent; cursor: pointer; transition: all 0.2s;
}
.btn-outline:hover { background: #eff6ff; }
.btn-primary {
  height: 44px; padding: 0 20px; border-radius: 12px; border: none;
  background: #2563eb; color: white; font-weight: 700; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
.btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); }

/* Main Content */
.detail-main { max-width: 1400px; margin: 0 auto; padding: 40px; }

/* Overview Section */
.overview-section {
  display: flex; align-items: center; justify-content: space-between;
  background: white; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0;
  margin-bottom: 32px; animation: slideDown 0.5s ease-out;
}
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

.identity-card { display: flex; align-items: center; gap: 24px; }
.id-icon {
  width: 80px; height: 80px; background: #eff6ff; color: #2563eb;
  border-radius: 20px; display: flex; align-items: center; justify-content: center;
}
.id-info h2 { font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.id-badges { display: flex; gap: 8px; margin-top: 8px; }
.badge { padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; }
.badge.blue { background: #eff6ff; color: #2563eb; }
.badge.gray { background: #f1f5f9; color: #475569; }
.badge.status.active { background: #ecfdf5; color: #10b981; }
.badge.color-tag { background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 6px; }
.color-dot { width: 8px; height: 8px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

.quick-stats { display: flex; gap: 40px; border-left: 1px solid #f1f5f9; padding-left: 40px; }
.q-stat label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
.q-stat p { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
.text-danger { color: #ef4444 !important; }

/* Details Grid */
.details-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
}
.span-2 { grid-column: span 2; }

.detail-card {
  background: white; border-radius: 20px; border: 1px solid #e2e8f0;
  display: flex; flex-direction: column; overflow: hidden; transition: all 0.3s;
}
.detail-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

.card-title { display: flex; align-items: center; gap: 10px; padding: 16px 24px; }
.card-title h3 { font-size: 15px; font-weight: 800; letter-spacing: -0.2px; }

.card-body { display: flex; flex-direction: column; gap: 16px; padding: 24px; }
.card-body.p-16 { padding: 16px 24px; }

/* Colors */
.color-blue { color: #2563eb; }
.color-blue-dark { color: #1e3a8a; }
.bg-blue-subtle { background: #eff6ff; }
.border-blue { border-color: #dbeafe !important; }

.color-emerald { color: #059669; }
.color-emerald-dark { color: #064e3b; }
.bg-emerald-subtle { background: #ecfdf5; }
.border-emerald { border-color: #d1fae5 !important; }

.color-indigo { color: #4f46e5; }
.color-indigo-dark { color: #312e81; }
.bg-indigo-subtle { background: #eef2ff; }
.border-indigo { border-color: #e0e7ff !important; }

.color-rose { color: #e11d48; }
.color-rose-dark { color: #881337; }
.bg-rose-subtle { background: #fff1f2; }
.border-rose { border-color: #ffe4e6 !important; }

.color-amber { color: #d97706; }
.color-amber-dark { color: #78350f; }
.bg-amber-subtle { background: #fffbeb; }
.border-amber { border-color: #fef3c7 !important; }

.info-row { display: flex; justify-content: space-between; align-items: flex-start; }
.info-row label { font-size: 13px; color: #64748b; font-weight: 500; }
.info-row p { font-size: 14px; font-weight: 700; color: #1e293b; text-align: right; }
.info-row p.address { max-width: 200px; line-height: 1.4; color: #475569; font-weight: 600; }
.info-row p.accent { color: #2563eb; }
.info-row p.mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.5px; }

/* Triple Row Specs */
.triple-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.info-item { display: flex; align-items: flex-start; gap: 12px; }
.info-item svg { color: #94a3b8; margin-top: 2px; }
.info-item label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; display: block; }
.info-item p { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 2px; }

/* Validity Card */
.validity-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: #f8fafc; border-radius: 12px;
}
.doc-info { display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 14px; }
.doc-date { text-align: right; }
.doc-date p { font-size: 14px; font-weight: 700; }
.doc-date small { font-size: 11px; color: #10b981; font-weight: 700; }
.doc-date small.expired { color: #ef4444; }
.date-danger { color: #ef4444; }
.icon-success { color: #10b981; }
.icon-danger { color: #ef4444; }

/* Split Card */
.split-card { display: flex; gap: 40px; height: 100%; }
.split-side { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.divider { width: 1px; background: #f1f5f9; }

/* Animations */
.animate-in-1 { animation: fadeInScale 0.4s ease-out both; animation-delay: 0.1s; }
.animate-in-2 { animation: fadeInScale 0.4s ease-out both; animation-delay: 0.2s; }
.animate-in-3 { animation: fadeInScale 0.4s ease-out both; animation-delay: 0.3s; }
.animate-in-4 { animation: fadeInScale 0.4s ease-out both; animation-delay: 0.4s; }
.animate-in-5 { animation: fadeInScale 0.4s ease-out both; animation-delay: 0.5s; }

@keyframes fadeInScale {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Skeleton */
.skeleton { background: #e2e8f0; border-radius: 12px; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
.h-24 { height: 24px; }
.w-120 { width: 120px; }
.h-300 { height: 300px; }
.h-200 { height: 200px; }
.w-full { width: 100%; }
.mb-32 { margin-bottom: 32px; }
.skeleton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }

@media (max-width: 1024px) {
  .details-grid { grid-template-columns: 1fr 1fr; }
  .span-2 { grid-column: span 2; }
}
@media (max-width: 768px) {
  .overview-section { flex-direction: column; align-items: flex-start; gap: 32px; }
  .quick-stats { border-left: none; padding-left: 0; border-top: 1px solid #f1f5f9; padding-top: 24px; width: 100%; justify-content: space-between; }
  .details-grid { grid-template-columns: 1fr; }
  .span-2 { grid-column: span 1; }
  .split-card { flex-direction: column; }
  .divider { height: 1px; width: 100%; }
}
</style>
