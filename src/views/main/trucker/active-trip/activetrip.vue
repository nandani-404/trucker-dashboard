<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ArrowLeft, Truck, MapPin, Phone, 
  FileText, CheckCircle2, Circle, Clock,
  Upload, Wallet,
  ShieldCheck, ExternalLink, HelpCircle,
  AlertCircle, User, Loader2
} from 'lucide-vue-next'
import { apiGet, apiPost, apiPostForm, END_POINTS, BASE_URL } from '../../../../services/config/api'

const props = defineProps<{
  loadId?: string
}>()

const emit = defineEmits(['back', 'complete', 'navigate'])

// --- Status Master ---
const statuses = [
  { id: 0, label: 'Load Accepted', sub: 'Awaiting vehicle & driver assignment' },
  { id: 1, label: 'Vehicle Assigned', sub: 'Truck is ready for pickup' },
  { id: 2, label: 'Reached Pickup', sub: 'Vehicle has arrived at origin' },
  { id: 3, label: 'Loaded', sub: 'Goods loaded and ready for departure' },
  { id: 4, label: 'In Transit', sub: 'On the way to destination' },
  { id: 5, label: 'Reached Destination', sub: 'Vehicle at drop-off location' },
  { id: 6, label: 'Delivered', sub: 'Trip completed successfully' }
]

// --- State ---
const isLoading = ref(true)
const currentStatus = ref(0)
const tripStarted = ref(false)
const showUploadModal = ref(false)
const currentModalType = ref<'bility' | 'pod'>('bility')
const uploadingDocument = ref(false)

// Vehicle Assignment State
const showAssignModal = ref(false)
const vehicles = ref<any[]>([])
const drivers = ref<any[]>([])
const selectedVehicle = ref('')
const driverName = ref('')
const driverPhone = ref('')
const driverDL = ref('')
const isAssigning = ref(false)

const trip = ref<any>({
  id: props.loadId || 'N/A',
  origin: 'Loading...',
  destination: 'Loading...',
  vehicle: 'Not Assigned',
  driver: { name: 'Not Assigned', phone: '', dl: '' },
  agent: { name: 'Support Team', phone: '' },
  payment: '0',
  advance: '0',
  material: '',
  weight: '',
  bility_path: null,
  pod_path: null,
  origin_lat: null,
  origin_lon: null,
  destination_lat: null,
  destination_lon: null,
  driver_id: null,
  trucker_shown_intrest: 0,
  received_amount: 0,
  trucker_id: null,
  shipper_id: null
})

const fetchTripDetails = async () => {
    try {
        if (!props.loadId) return
        isLoading.value = true
        const response: any = await apiGet(END_POINTS.TRUCKER_TRACKING(props.loadId))
        
        if (response?.status === 'success') {
            const data = response.data
            trip.value = {
                id: data.load_id,
                trucker_id: data.trucker_id,
                shipper_id: data.shipper_id,
                origin: data.origin,
                destination: data.destination,
                vehicle: data.vehicle_number || 'Not Assigned',
                payment: data.payment_amount,
                advance: data.trucker_received_amount || '0',
                agent: {
                    name: data.tracking_agent?.name || 'Support Team',
                    phone: data.tracking_agent?.phone || ''
                },
                driver: {
                    name: data.driver_name || 'Not Assigned',
                    phone: data.driver_phone || '',
                    dl: data.dl_number || ''
                },
                material: data.material_name,
                weight: data.material_weight,
                bility_path: data.builty_path || null,
                pod_path: data.pod_path || null,
                origin_lat: data.origin_lat || null,
                origin_lon: data.origin_lon || null,
                destination_lat: data.destination_lat || null,
                destination_lon: data.destination_lon || null,
                driver_id: data.driver_id || null,
                trucker_shown_intrest: Number(data.trucker_shown_intrest) || 0,
                received_amount: parseFloat(data.trucker_received_amount) || 0,
            }
            tripStarted.value = data.trip_started || data.trip_status === 'active' || false
            const statusCode = parseInt(data.current_status_code, 10)
            if (!isNaN(statusCode)) {
                currentStatus.value = statusCode
            }
        }
    } catch (error) {
        console.error('Error fetching trip details:', error)
    } finally {
        isLoading.value = false
    }
}

const fetchVehicles = async () => {
    try {
        const response: any = await apiGet(END_POINTS.TRUCKER_GET_VEHICLES)
        if (response?.status === 'success') {
            const list = response.data?.data || response.data || []
            vehicles.value = Array.isArray(list) ? list : []
        }
    } catch (error) {
        console.error('Error fetching vehicles:', error)
    }
}

const fetchDrivers = async () => {
    try {
        const response: any = await apiGet(END_POINTS.TRUCKER_GET_DRIVERS)
        if (response?.status === 'success') {
            const list = response.data?.drivers || []
            drivers.value = Array.isArray(list) ? list : []
        }
    } catch (error) {
        console.error('Error fetching drivers:', error)
    }
}

const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
           return resolve({ latitude: 0, longitude: 0 })
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve({ latitude: 0, longitude: 0 }),
            { enableHighAccuracy: false, timeout: 5000 }
        )
    })
}

const updateStatusWithAPI = async (newStatusCode: number) => {
    try {
        const loc = await getCurrentLocation()
        const payload = {
            load_id: props.loadId,
            status_code: newStatusCode,
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
            latitude: loc.latitude,
            longitude: loc.longitude,
        }
        const response: any = await apiPost(END_POINTS.TRUCKER_UPDATE_STATUS, payload)
        if (response?.status === 'success') {
            currentStatus.value = newStatusCode
            await fetchTripDetails()
        }
    } catch (error) {
        console.error('Error updating status:', error)
    }
}

onMounted(() => {
  fetchTripDetails()
  fetchVehicles()
  fetchDrivers()
})

// --- Computed ---
const activeStatusPercent = computed(() => (currentStatus.value / (statuses.length - 1)) * 100)
const nextActionLabel = computed(() => {
  if (currentStatus.value === 0) return 'Assign Vehicle & Driver'
  if (currentStatus.value === 1 && !tripStarted.value) return 'Start Trip'
  if (currentStatus.value === 1 && tripStarted.value) return 'Reached Pickup'
  if (currentStatus.value === 2) return 'Mark Loaded'
  if (currentStatus.value === 3) return 'Upload Bility & Transit'
  if (currentStatus.value === 4) return 'Reached Destination'
  if (currentStatus.value === 5) return 'Upload POD & Complete'
  return 'Trip Completed'
})

// --- Actions ---
const handleAction = async () => {
  if (currentStatus.value === 0) {
    showAssignModal.value = true
    return
  }

  if (currentStatus.value === 1 && !tripStarted.value) {
    if (trip.value.received_amount <= 0) {
      alert('Advance payment is pending to start trip.')
      return
    }
    await startTrip()
    return
  }

  if (currentStatus.value === 3) {
    currentModalType.value = 'bility'
    showUploadModal.value = true
    return
  }

  if (currentStatus.value === 5) {
    currentModalType.value = 'pod'
    showUploadModal.value = true
    return
  }

  if (currentStatus.value < 6) {
    await updateStatusWithAPI(currentStatus.value + 1)
  }
}

const startTrip = async () => {
    try {
        await getCurrentLocation()
        const payload = {
            driver_id: trip.value.driver_id || trip.value.trucker_id,
            load_id: props.loadId,
            source_lat: parseFloat(trip.value.origin_lat),
            source_lng: parseFloat(trip.value.origin_lon),
            destination_lat: parseFloat(trip.value.destination_lat),
            destination_lng: parseFloat(trip.value.destination_lon),
        }
        const response: any = await apiPost(END_POINTS.TRUCKER_START_TRIP, payload)
        if (response?.status === true || response?.status === 'success') {
            tripStarted.value = true
            await fetchTripDetails()
        }
    } catch (error) {
        console.error('Error starting trip:', error)
    }
}

const assignVehicle = async () => {
    if (!selectedVehicle.value || !driverName.value || !driverPhone.value) return
    try {
        isAssigning.value = true
        const payload = {
            load_id: props.loadId,
            trucker_id: trip.value.trucker_id,
            shipper_id: trip.value.shipper_id,
            vehicle_number: selectedVehicle.value,
            driver_name: driverName.value,
            dl_number: driverDL.value,
            driver_phone: driverPhone.value
        }
        const response: any = await apiPost(END_POINTS.TRUCKER_UPDATE_VEHICLE_NUMBER, payload)
        if (response?.status === 'success') {
            await updateStatusWithAPI(1)
            showAssignModal.value = false
        }
    } catch (error) {
        console.error('Error assigning vehicle:', error)
    } finally {
        isAssigning.value = false
    }
}

const submitDocument = async () => {
  if (!fileInput.value?.files?.[0]) return
  
  try {
    uploadingDocument.value = true
    const file = fileInput.value.files[0]
    const formData = new FormData()
    formData.append('load_id', props.loadId!)
    formData.append('shipper_id', trip.value.shipper_id)
    formData.append('trucker_id', trip.value.trucker_id)
    
    if (currentModalType.value === 'bility') {
      formData.append('builty', file)
      const response: any = await apiPostForm(END_POINTS.TRUCKER_UPLOAD_BUILTY, formData)
      if (response?.status === 'success') {
        await updateStatusWithAPI(4)
      }
    } else {
      formData.append('pod', file)
      const response: any = await apiPostForm(END_POINTS.TRUCKER_UPLOAD_POD, formData)
      if (response?.status === 'success') {
        await updateStatusWithAPI(6)
        emit('complete')
      }
    }
    showUploadModal.value = false
  } catch (error) {
    console.error('Error uploading document:', error)
  } finally {
    uploadingDocument.value = false
  }
}

const downloadBility = () => {
    if (trip.value.bility_path) {
        const url = `${BASE_URL}public/${trip.value.bility_path}`
        window.open(url, '_blank')
    }
}

const downloadPOD = () => {
    if (trip.value.pod_path) {
        const url = `${BASE_URL}public/${trip.value.pod_path}`
        window.open(url, '_blank')
    }
}

const callDriver = () => {
  if (trip.value.driver?.phone) {
    window.location.href = `tel:${trip.value.driver.phone}`
  }
}

const openLiveTracking = () => {
  emit('navigate', 'live-tracking/' + trip.value.id)
}

const openNavigation = () => {
  emit('navigate', 'map-navigation/' + trip.value.id)
}
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    submitDocument()
  }
}

</script>

<template>
  <div class="active-trip-view">
    <!-- TOP NAV BAR -->
    <nav class="tracking-nav">
      <div class="nav-left">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="18" />
        </button>
        <div class="nav-info">
          <h2 class="nav-id">{{ trip.id }}</h2>
        </div>
      </div>

      <div class="nav-right">
        <button class="btn-support">
          <HelpCircle :size="18" />
          <span>Need Help?</span>
        </button>
      </div>
    </nav>

    <div v-if="isLoading" class="trip-skeleton">
      <div class="sk-main"></div>
      <div class="sk-side"></div>
    </div>

    <main v-else class="trip-layout">
      <!-- LEFT: MAIN OPERATIONAL CONSOLE -->
      <section class="trip-primary">
        
        <!-- 1. HERO ACTION HEADER (CURRENT STATUS) -->
        <div class="hero-status-card" :class="`state-${currentStatus}`">
          <div class="hero-content">
            <div class="hero-meta">
              <span class="meta-badge"><Truck :size="12" /> {{ trip.vehicle }}</span>
              <span class="meta-badge"><Wallet :size="12" /> {{ trip.payment }}</span>
            </div>
            <h1 class="hero-title">{{ statuses[currentStatus]?.label }}</h1>
            <p class="hero-sub">{{ statuses[currentStatus]?.sub }}</p>
            
            <div class="hero-controls">
              <button 
                class="btn-primary" 
                @click="handleAction"
                :disabled="currentStatus === 6"
              >
                <Truck v-if="currentStatus < 4" :size="20" />
                <FileText v-else :size="20" />
                <span>{{ nextActionLabel }}</span>
              </button>
              
              <button v-if="tripStarted" class="btn-secondary" @click="openLiveTracking">
                <MapPin :size="20" />
                <span>Live Tracking</span>
              </button>
            </div>
          </div>
          
          <div class="hero-viz">
             <div class="pulse-ring"></div>
             <Truck class="viz-truck" :size="64" />
          </div>
        </div>

        <!-- 2. SHIPPING ROUTE CARD -->
        <div class="route-card">
          <div class="card-header">
            <div class="header-left">
              <MapPin :size="20" class="c-blue" />
              <h3>Shipping Route</h3>
            </div>
            <button class="btn-navigate" @click="openNavigation">
              <ExternalLink :size="14" />
              <span>Navigate</span>
            </button>
          </div>
          
          <div class="route-viz-container">
            <div class="route-loc origin">
              <p class="loc-tag">PICKUP</p>
              <h4>{{ trip.origin }}</h4>
              <p class="loc-sub">Reporting at Gate 02</p>
            </div>
            
            <div class="route-line-wrap">
              <div class="route-line-base"></div>
              <div class="route-line-progress" :style="{ width: activeStatusPercent + '%' }"></div>
              <div class="truck-carrier" :style="{ left: activeStatusPercent + '%' }">
                <Truck :size="18" />
              </div>
            </div>
            
            <div class="route-loc destination">
              <p class="loc-tag">DELIVERY</p>
              <h4>{{ trip.destination }}</h4>
              <p class="loc-sub">Warehouse Section B</p>
            </div>
          </div>
        </div>

        <!-- 3. VEHICLE INFORMATION -->
        <div class="info-card">
          <div class="card-header">
            <div class="header-left">
              <ShieldCheck :size="20" class="c-purple" />
              <h3>Vehicle Information</h3>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-block">
              <div class="block-icon"><Truck :size="20" /></div>
              <div class="block-data">
                <p class="block-label">VEHICLE NUMBER</p>
                <h4 class="block-value">{{ trip.vehicle }}</h4>
              </div>
            </div>
            
            <div class="info-block">
              <div class="block-icon"><User :size="20" /></div>
              <div class="block-data">
                <p class="block-label">ASSIGNED DRIVER</p>
                <h4 class="block-value">{{ trip.driver.name }}</h4>
                <p class="block-sub">{{ trip.driver.phone }}</p>
              </div>
              <button class="btn-call-mini" @click="callDriver">
                <Phone :size="14" />
                <span>Call</span>
              </button>
            </div>
          </div>
        </div>

      </section>

      <!-- RIGHT SIDEBAR: JOURNEY LOG & DOCUMENTS -->
      <aside class="trip-sidebar">
        
        <!-- 5. LOAD STATUS & JOURNEY LOG -->
        <div class="side-card">
          <h3 class="side-title">Load Status & Journey</h3>
          <div class="history-list">
            <div 
              v-for="(s, i) in statuses" 
              :key="i" 
              class="history-item"
              :class="{ completed: i <= currentStatus }"
            >
              <div class="h-line"></div>
              <div class="h-dot">
                <CheckCircle2 v-if="i < currentStatus" :size="16" />
                <Clock v-else-if="i === currentStatus" :size="16" />
                <Circle v-else :size="16" />
              </div>
              <div class="h-txt">
                <h4>{{ s.label }}</h4>
                <p v-if="i <= currentStatus">Updated just now</p>
                <p v-else>Pending</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. DOCUMENT MANAGEMENT -->
        <div class="side-card doc-card">
           <h3 class="side-title">Required Documents</h3>
           <div class="doc-links">
             <div class="doc-row" :class="{ empty: !trip.bility_path }">
                <div class="d-icon"><FileText :size="20" /></div>
                <div class="d-txt">
                   <h4>Bility / LR</h4>
                   <p v-if="trip.bility_path">Verified & Uploaded</p>
                   <p v-else>Pending Upload</p>
                </div>
                 <button v-if="trip.bility_path" class="view-btn" @click="downloadBility">
                    <ExternalLink :size="14" />
                 </button>
                <button v-else class="sign-btn" @click="handleAction">Upload</button>
             </div>

              <div v-if="trip.pod_path" class="doc-row">
                 <div class="d-icon"><FileText :size="20" /></div>
                 <div class="d-txt">
                    <h4>POD Document</h4>
                    <p>Trip Completed & Verified</p>
                 </div>
                 <button class="view-btn" @click="downloadPOD">
                    <ExternalLink :size="14" />
                 </button>
              </div>
           </div>
        </div>

      </aside>
    </main>

    <!-- ASSIGN VEHICLE MODAL -->
    <Transition name="fade">
      <div v-if="showAssignModal" class="modal-overlay" @click.self="showAssignModal = false">
        <div class="modal-sheet">
          <div class="m-header">
            <h3>Assign Vehicle & Driver</h3>
            <button class="m-close" @click="showAssignModal = false">×</button>
          </div>
          
          <div class="m-body">
            <div class="form-group">
              <label>Select Vehicle</label>
              <select v-model="selectedVehicle" class="select-input">
                <option value="">Choose a vehicle</option>
                <option v-for="v in vehicles" :key="v.id || v" :value="v.registration_number || v.vehicle_number || v">
                  {{ v.registration_number || v.vehicle_number || v }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Select Driver</label>
              <select 
                class="select-input"
                @change="(e: any) => {
                  const d = drivers.find(d => d.id == e.target.value)
                  if (d) {
                    driverName = d.name
                    driverPhone = d.mobile || d.phone
                    driverDL = d.License_Number || d.dl_number
                  }
                }"
              >
                <option value="">Choose a driver</option>
                <option v-for="d in drivers" :key="d.id" :value="d.id">{{ d.name }} ({{ d.mobile || d.phone }})</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Driver Name</label>
                <input v-model="driverName" type="text" placeholder="Enter name" />
              </div>
              <div class="form-group">
                <label>Driver Phone</label>
                <input v-model="driverPhone" type="text" placeholder="Enter phone" />
              </div>
            </div>
            
            <div class="form-group">
              <label>DL Number</label>
              <input v-model="driverDL" type="text" placeholder="Enter DL number" />
            </div>
          </div>

          <div class="m-footer">
            <button class="btn-cancel" @click="showAssignModal = false">Cancel</button>
            <button class="btn-submit" @click="assignVehicle" :disabled="isAssigning">
              <Loader2 v-if="isAssigning" class="spin" :size="18" />
              <span>{{ isAssigning ? 'Assigning...' : 'Assign & Confirm' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- UPLOAD MODAL -->
    <Transition name="fade">
      <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
        <div class="modal-sheet">
          <div class="m-header">
            <h3>Upload {{ currentModalType === 'bility' ? 'Bility' : 'POD' }}</h3>
            <button class="m-close" @click="showUploadModal = false">×</button>
          </div>
          <div class="m-body">
            <div class="upload-zone" @click="triggerFileInput">
               <Upload :size="48" />
               <p>Drag and drop or click to upload</p>
               <label>Supports JPG, PNG or PDF (Max 5MB)</label>
               <input 
                 type="file" 
                 ref="fileInput" 
                 class="hidden-file-input" 
                 @change="handleFileChange"
                 accept=".jpg,.png,.pdf"
               />
            </div>
            

            <div v-if="currentModalType === 'bility'" class="ocr-alert">
               <AlertCircle :size="16" />
               <p>Our system will automatically extract trip details from your LR.</p>
            </div>
          </div>
          <div class="m-footer">
            <button class="btn-cancel" @click="showUploadModal = false">Cancel</button>
            <button class="btn-submit" @click="submitDocument">Finalize & Continue</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.active-trip-view {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  padding-bottom: 60px;
}

/* TOP NAV BAR */
.tracking-nav {
  height: 72px; background: white; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; position: sticky; top: 0; z-index: 100;
}
.nav-left { display: flex; align-items: center; gap: 20px; }
.btn-back {
  width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: #f1f5f9; border-color: #cbd5e1; }
.nav-info .nav-id { font-size: 20px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.5px; }

.nav-right { flex-shrink: 0; }
.btn-support {
  display: flex; align-items: center; gap: 8px;
  background: #f8fafc; border: 1px solid #e2e8f0; color: #475569;
  padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer;
}

/* LAYOUT STRUCTURE */
.trip-layout {
  display: grid; grid-template-columns: 1fr 380px; gap: 32px;
  padding: 32px 40px; max-width: 1600px; margin: 0 auto;
}
.trip-primary { display: flex; flex-direction: column; gap: 24px; }
.trip-sidebar { display: flex; flex-direction: column; gap: 24px; }

/* SHARED CARD SYSTEM (PROPER CLASSIC) */
.info-card, .side-card, .route-card, .doc-card {
  background: white; border-radius: 20px; padding: 24px;
  border: 1px solid #e2e8f0; box-shadow: none !important; margin: 0;
}
.card-header { 
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px; 
}
.header-left { display: flex; align-items: center; gap: 12px; }
.card-header h3 { 
  font-size: 14px; font-weight: 800; color: #64748b; 
  text-transform: uppercase; letter-spacing: 0.1em; margin: 0;
}

.btn-navigate {
  display: flex; align-items: center; gap: 6px; padding: 6px 14px;
  border-radius: 10px; border: none; background: #3b82f6;
  color: white; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}
.btn-navigate:hover { background: #2563eb; transform: translateY(-1px); }

/* 1. HERO STATUS CARD (COMPACT & PROMINENT) */
.hero-status-card {
  padding: 30px 40px; border-radius: 28px; color: white;
  display: flex; align-items: center; justify-content: space-between;
  position: relative; overflow: hidden; box-shadow: none !important;
}
.hero-status-card.state-0, .hero-status-card.state-1 { background: linear-gradient(135deg, #2563eb, #1e40af); }
.hero-status-card.state-2, .hero-status-card.state-3 { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.hero-status-card.state-4, .hero-status-card.state-5 { background: linear-gradient(135deg, #10b981, #059669); }
.hero-status-card.state-6 { background: linear-gradient(135deg, #475569, #1e293b); }

.hero-content { z-index: 2; flex: 1; }
.hero-meta { display: flex; gap: 8px; margin-bottom: 12px; }
.meta-badge {
  background: white; color: #1e3a8a; 
  padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.hero-title { font-size: 34px; font-weight: 900; margin-bottom: 4px; letter-spacing: -1px; }
.hero-sub { font-size: 16px; opacity: 0.95; margin-bottom: 24px; font-weight: 500; }

.hero-controls { display: flex; gap: 16px; }
.btn-primary {
  background: white; color: #1e3a8a; border: none; padding: 12px 24px;
  border-radius: 12px; font-size: 15px; font-weight: 800;
  display: flex; align-items: center; gap: 10px; cursor: pointer;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
.btn-secondary {
  background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3);
  padding: 12px 24px; border-radius: 12px; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; gap: 10px; backdrop-filter: blur(10px);
}

.hero-viz { position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; opacity: 0.8; }
.viz-truck { z-index: 2; color: rgba(255,255,255,0.95); }
.pulse-ring {
  position: absolute; width: 100%; height: 100%; border: 2px solid rgba(255,255,255,0.2);
  border-radius: 50%; animation: ring-pulse 2s infinite;
}
@keyframes ring-pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }

/* 2. SHIPPING ROUTE VIZ */
.route-viz-container { display: flex; align-items: center; gap: 32px; padding: 10px 0; }
.route-loc { flex: 0 0 200px; }
.loc-tag { font-size: 10px; font-weight: 800; color: #94a3b8; margin-bottom: 6px; }
.route-loc h4 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
.loc-sub { font-size: 12px; color: #64748b; margin-top: 4px; }

.route-line-wrap { flex: 1; position: relative; height: 4px; }
.route-line-base { position: absolute; inset: 0; background: #f1f5f9; border-radius: 2px; }
.route-line-progress { position: absolute; left: 0; top: 0; bottom: 0; background: #3b82f6; border-radius: 2px; }
.truck-carrier { 
  position: absolute; top: 50%; width: 34px; height: 34px; background: white; 
  border: 2px solid #3b82f6; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  transform: translate(-50%, -50%); color: #3b82f6; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* 3. VEHICLE & DRIVER GRID */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.info-block { display: flex; gap: 16px; align-items: flex-start; }
.block-icon { 
  width: 48px; height: 48px; border-radius: 14px; background: #f8fafc; 
  display: flex; align-items: center; justify-content: center; color: #64748b; 
}
.block-label { font-size: 10px; font-weight: 800; color: #94a3b8; margin-bottom: 6px; }
.block-value { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
.block-sub { font-size: 13px; color: #64748b; margin-top: 4px; }
.v-tag { font-size: 11px; font-weight: 700; color: #3b82f6; margin-top: 6px; display: block; }

.btn-call-mini {
  margin-left: auto; display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 10px; background: #ecfdf5; border: 1px solid #d1fae5;
  color: #059669; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-call-mini:hover { background: #dcfce7; }

/* 4. CARGO & PAYMENT DETAILS */
.cargo-payment-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }
.cargo-specs { display: flex; gap: 32px; }
.spec-item .item-label { font-size: 10px; font-weight: 800; color: #94a3b8; margin-bottom: 6px; }
.spec-item .item-val { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0; }

.payment-summary { 
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #f1f5f9;
}
.pay-item p { font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 6px; }
.pay-item h3 { font-size: 22px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.5px; }
.pay-item.total h3 { color: #2563eb; }
.pay-item.advance h3 { color: #10b981; }

/* SIDEBAR: JOURNEY & DOCS */
.side-title { font-size: 16px; font-weight: 800; margin-bottom: 24px; color: #1e293b; }

.history-list { display: flex; flex-direction: column; }
.history-item { display: flex; gap: 16px; position: relative; padding-bottom: 32px; }
.h-line { position: absolute; left: 8px; top: 18px; bottom: 0; width: 2px; background: #f1f5f9; }
.completed .h-line { background: #dcfce7; }
.history-item:last-child .h-line { display: none; }

.h-dot { position: relative; z-index: 2; background: white; color: #cbd5e1; height: 18px; }
.completed .h-dot { color: #10b981; }

.h-txt h4 { font-size: 14px; font-weight: 700; color: #64748b; margin: 0; }
.completed .h-txt h4 { color: #1e293b; }
.h-txt p { font-size: 12px; color: #94a3b8; margin-top: 4px; }

/* Documents Manager */
.doc-links { display: flex; flex-direction: column; gap: 16px; }
.doc-row {
  display: flex; align-items: center; gap: 16px; padding: 16px;
  border-radius: 16px; background: #fcfcfc; border: 1px solid #f1f5f9;
}
.doc-row.empty { opacity: 0.6; background: #fdfdfd; }
.d-icon { color: #3b82f6; }
.d-txt { flex: 1; }
.d-txt h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }
.d-txt p { font-size: 11px; color: #94a3b8; margin-top: 2px; }

.sign-btn {
  padding: 8px 16px; border-radius: 10px; background: #3b82f6; color: white;
  border: none; font-size: 12px; font-weight: 800; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}
.sign-btn:hover { background: #2563eb; transform: scale(1.05); }
.view-btn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer;
}

/* MODAL SYSTEMS */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); 
  backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-sheet {
  background: white; width: 520px; border-radius: 32px; padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes modal-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

.m-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.m-header h3 { font-size: 20px; font-weight: 850; color: #0f172a; margin: 0; }
.m-close { background: none; border: none; font-size: 28px; color: #94a3b8; cursor: pointer; line-height: 1; }

.upload-zone {
  height: 220px; border: 2px dashed #e2e8f0; border-radius: 20px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; background: #f8fafc; cursor: pointer; transition: all 0.2s;
}
.upload-zone:hover { background: #f1f5f9; border-color: #3b82f6; }
.upload-zone p { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
.upload-zone label { font-size: 12px; color: #94a3b8; }
.hidden-file-input { display: none; }

.ocr-alert {
  margin-top: 16px; padding: 12px 16px; border-radius: 12px; background: #fffbeb; 
  display: flex; gap: 10px; color: #92400e; font-size: 12px; line-height: 1.4;
}

.m-footer { display: flex; gap: 12px; margin-top: 32px; }
.btn-cancel { flex: 1; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0; font-weight: 700; cursor: pointer; }
.btn-submit { 
  flex: 2; padding: 16px; border-radius: 14px; background: #2563eb; color: white; 
  border: none; font-weight: 800; cursor: pointer; transition: all 0.2s;
}
.btn-submit:hover { background: #1d4ed8; transform: scale(1.02); }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 8px; }
.select-input, .form-group input {
  width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: #f8fafc; font-size: 14px; outline: none; transition: border-color 0.2s;
}
.select-input:focus, .form-group input:focus { border-color: #3b82f6; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* UTIL COLORS */
.c-blue { color: #3b82f6; }
.c-purple { color: #8b5cf6; }
.c-cyan { color: #06b6d4; }

@media (max-width: 1200px) {
  .trip-layout { grid-template-columns: 1fr; }
  .info-grid, .cargo-payment-grid { grid-template-columns: 1fr; }
}
</style>
