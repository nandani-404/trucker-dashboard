<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  ArrowLeft, Truck, Phone, 
  RefreshCw, Navigation, AlertTriangle, 
  Layers,
  ShieldCheck,
  Activity
} from 'lucide-vue-next'
import { apiGet, END_POINTS } from '../../../../../services/config/api'

// --- PROPS & STATE ---
const props = defineProps<{
  loadId?: string
}>()
const loading = ref(false)
const lastUpdated = ref('--:--:--')
const showLegend = ref(false)
const vehicles = ref<any[]>([])

// --- TRIP INTERFACE (Adapted from RN logic) ---
const trip = ref({
  id: props.loadId || '---',
  vehicle: '---',
  driver: {
    name: '---',
    phone: '',
    rating: 0
  },
  status: 'GREEN', 
  off_route_km: 0,
  origin: '---',
  destination: '---',
  progress: 0,
  eta: '---',
  distance_left: '---'
})

// --- STATUS CONFIG ---
interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  BROWN: { label: 'To Pickup', color: '#795548', bg: '#efebe9' },
  GREEN: { label: 'On Route', color: '#10b981', bg: '#ecfdf5' },
  YELLOW: { label: 'Stale (15m+)', color: '#f59e0b', bg: '#fffbeb' },
  RED: { label: 'No Update (>1h)', color: '#ef4444', bg: '#fef2f2' },
  BLUE: { label: 'At Destination', color: '#3b82f6', bg: '#eff6ff' },
  BLACK: { label: 'Delivered', color: '#1e293b', bg: '#f8fafc' }
}

let pollInterval: any = null

// --- API INTEGRATION ---
const fetchTracking = async () => {
  if (!props.loadId) return
  loading.value = true
  try {
    const response: any = await apiGet(END_POINTS.TRUCKER_TRACKING_DASHBOARD(props.loadId))
    const list = response?.data?.vehicles || response?.data?.tracking || []
    
    if (Array.isArray(list) && list.length > 0) {
        // Find latest update if multiple
        const latest = list.reduce((prev: any, current: any) => {
            const prevTime = prev.updated_at ? new Date(prev.updated_at).getTime() : 0
            const currentTime = current.updated_at ? new Date(current.updated_at).getTime() : 0
            return (currentTime > prevTime) ? current : prev
        }, list[0])

        vehicles.value = list
        
        // Map API fields to our UI trip object
        trip.value = {
            id: latest.load_id || props.loadId,
            vehicle: latest.vehicle_number || '---',
            driver: {
                name: latest.driver_name || '---',
                phone: latest.driver_phone || '',
                rating: 5.0 // Mock rating if not in API
            },
            status: (latest.color_code || 'GREEN').toUpperCase(),
            off_route_km: parseFloat(latest.off_route_km || '0'),
            origin: latest.origin || '---',
            destination: latest.destination || '---',
            progress: parseFloat(latest.progress || '0'),
            eta: latest.eta || '---',
            distance_left: latest.distance_left || '---'
        }
    }
    lastUpdated.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Tracking fetch failed:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTracking()
  pollInterval = setInterval(fetchTracking, 15000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})

const goBack = () => {
  window.history.back()
}
</script>

<template>
  <div class="tracking-container">
    <!-- 1. HEADER (STATIONARY) -->
    <header class="tracking-header">
      <div class="nav-section">
        <button class="btn-back" @click="goBack">
          <ArrowLeft :size="18" />
        </button>
        <div class="trip-id-block">
          <span class="label">TRANSIT MONITOR</span>
          <h2 class="id-text">{{ trip.id }}</h2>
        </div>
      </div>

      <div class="status-center">
        <div class="live-pulse">
          <div class="pulse-dot"></div>
          <span>LIVE TRACKING</span>
        </div>
        <div class="update-info">
          <RefreshCw :size="12" :class="{ 'spinning': loading }" />
          <span>Sync: {{ lastUpdated }}</span>
        </div>
      </div>

      <div class="action-section">
        <button class="btn-refresh" @click="fetchTracking" :disabled="loading" title="Refresh Live Status">
          <RefreshCw :size="18" :class="{ 'spinning': loading }" />
          <span>Refresh</span>
        </button>
      </div>
    </header>

    <!-- 2. MAIN WORKSPACE (MAP INTERFACE) -->
    <main class="tracking-workspace">
      <!-- MOCK MAP BACKGROUND (In production, this is Google Maps / Leaflet) -->
      <div class="map-viewport">
        <div class="map-overlay"></div>
        
        <!-- VISUAL MOCK OF ROUTE -->
        <svg class="map-svg-mock" viewBox="0 0 1000 600">
          <!-- Planned Route -->
          <path d="M100 500 Q 300 100, 900 150" class="path-planned" />
          <!-- Traveled Path -->
          <path d="M100 500 Q 250 250, 620 230" class="path-traveled" />
          
          <!-- Origin Pin -->
          <circle cx="100" cy="500" r="8" class="pin-origin" />
          <!-- Destination Pin -->
          <circle cx="900" cy="150" r="8" class="pin-dest" />
          
          <!-- Truck Marker (Animated Position) -->
          <g class="truck-marker-group" style="transform: translate(620px, 230px) rotate(-10deg)">
            <circle r="24" class="truck-shadow" />
            <div class="truck-icon-wrap">
              <Truck :size="24" color="#fff" />
            </div>
            <foreignObject x="-20" y="-20" width="40" height="40">
               <div class="truck-blob" :style="{ backgroundColor: STATUS_MAP[trip.status]?.color || '#3b82f6' }">
                 <Truck :size="20" color="white" />
               </div>
            </foreignObject>
          </g>
        </svg>

        <!-- FLOATING CONTROLS -->
        <div class="map-controls">
          <button class="ctrl-btn" title="Map Layers"><Layers :size="20" /></button>
          <button class="ctrl-btn" title="Recenter"><Navigation :size="20" /></button>
          <div class="zoom-group">
            <button class="ctrl-btn">+</button>
            <button class="ctrl-btn">-</button>
          </div>
        </div>
      </div>

      <!-- 3. SIDE OPERATIONS PANEL (GLASS LAYOUT) -->
      <aside class="ops-panel">
        <!-- VEHICLE QUICK LOOK -->
        <div class="ops-card primary-info">
          <div class="card-tag" :style="{ color: STATUS_MAP[trip.status]?.color || '#3b82f6', backgroundColor: STATUS_MAP[trip.status]?.bg || '#eff6ff' }">
             {{ STATUS_MAP[trip.status]?.label || 'Moving' }}
          </div>
          <div class="v-header">
            <div>
              <h3>{{ trip.vehicle }}</h3>
              <p>{{ trip.driver.name }}</p>
            </div>
            <button class="btn-call" @click="console.log('calling')">
               <Phone :size="18" />
            </button>
          </div>
          
          <div class="v-stats">
            <div class="stat">
              <label>ETA</label>
              <p>{{ trip.eta }}</p>
            </div>
            <div class="stat">
              <label>REMAINING</label>
              <p>{{ trip.distance_left }}</p>
            </div>
          </div>

          <div class="v-progress-track">
             <div class="progress-bar">
                <div class="progress-fill" :style="{ width: trip.progress + '%' }"></div>
             </div>
             <div class="progress-labels">
                <span>{{ trip.origin }}</span>
                <span>{{ trip.destination }}</span>
             </div>
          </div>
        </div>

        <!-- ROUTE HEALTH -->
        <div class="ops-card route-health" :class="{ 'alert': trip.off_route_km > 0.5 }">
           <div class="health-header">
              <Activity :size="18" />
              <h4>Route Compliance</h4>
           </div>
           <div class="health-content">
              <div class="health-row">
                 <span class="l">Off-Route Dist</span>
                 <span class="v" :class="{ 'warning': trip.off_route_km > 0.5 }">
                   {{ trip.off_route_km }} km
                 </span>
              </div>
              <div v-if="trip.off_route_km > 0.5" class="alert-box">
                 <AlertTriangle :size="14" />
                 <span>Vehicle deviating from planned corridor</span>
              </div>
              <div v-else class="success-box">
                 <ShieldCheck :size="14" />
                 <span>On track & safe</span>
              </div>
           </div>
        </div>

        <!-- RECENT ACTIVITY LOG -->
        <div class="ops-card activity-log">
          <h4>Journey Milestones</h4>
          <div class="milestones">
            <div class="milestone completed">
               <div class="m-point"></div>
               <div class="m-text">
                  <p>Passed Indore Toll</p>
                  <span>10:45 AM</span>
               </div>
            </div>
            <div class="milestone current">
               <div class="m-point"></div>
               <div class="m-text">
                  <p>In Transit (NH3)</p>
                  <span>Moving at 45 km/h</span>
               </div>
            </div>
            <div class="milestone upcoming">
               <div class="m-point"></div>
               <div class="m-text">
                  <p>Expected Arrival</p>
                  <span>Bhiwandi Hub</span>
               </div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- 4. FOOTER LEGEND -->
    <footer class="tracking-legend" v-if="showLegend">
       <div class="legend-content">
          <div v-for="(cfg, key) in STATUS_MAP" :key="key" class="l-item">
             <div class="l-dot" :style="{ backgroundColor: cfg.color }"></div>
             <span>{{ cfg.label }}</span>
          </div>
       </div>
    </footer>
    <button class="legend-toggle" @click="showLegend = !showLegend">
        <Layers :size="16" />
        <span>Status Legend</span>
    </button>
  </div>
</template>

<style scoped>
.tracking-container {
  display: flex; flex-direction: column;
  height: 100vh; width: 100%;
  background: #f1f5f9; overflow: hidden;
  font-family: 'Inter', sans-serif;
  position: relative;
}

/* HEADER */
.tracking-header {
  height: 64px; background: #ffffff; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; z-index: 100; flex-shrink: 0;
}
.nav-section { display: flex; align-items: center; gap: 16px; }
.btn-back {
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s; background: white; color: #64748b;
}
.btn-back:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }

.trip-id-block .label { font-size: 9px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; margin-bottom: -2px; display: block; }
.trip-id-block .id-text { font-size: 18px; font-weight: 850; color: #0f172a; margin: 0; }

.status-center { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.live-pulse {
  display: flex; align-items: center; gap: 6px;
  background: #fef2f2; color: #ef4444; padding: 3px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 800; border: 1px solid #fee2e2;
}
.pulse-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 0.4; transform: scale(0.8); } 100% { opacity: 0; transform: scale(2.5); } }

.update-info { display: flex; align-items: center; gap: 5px; color: #64748b; font-size: 10px; font-weight: 600; margin-top: 4px; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.action-section { display: flex; align-items: center; gap: 12px; }
.btn-refresh { 
  display: flex; align-items: center; gap: 8px;
  background: #3b82f6; color: white; padding: 0 16px; border-radius: 10px;
  font-size: 13px; font-weight: 700; border: none; cursor: pointer; height: 36px;
  transition: all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}
.btn-refresh:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
.btn-refresh:disabled { opacity: 0.7; cursor: not-allowed; }
.alert-count {
  position: absolute; top: -5px; right: -5px; background: #ef4444; color: white;
  width: 16px; height: 16px; border-radius: 50%; font-size: 9px;
  display: flex; align-items: center; justify-content: center; font-weight: 800;
  border: 2px solid white;
}

/* MAIN WORKSPACE */
.tracking-workspace { 
  flex: 1; display: flex; position: relative; padding: 20px; gap: 20px;
  max-width: 100%; height: calc(100% - 64px);
}

.map-viewport { 
  flex: 1; background: #e0f2fe; border-radius: 24px; position: relative;
  border: 1px solid #cbd5e1; overflow: hidden;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 30px 30px;
}
.map-svg-mock { width: 100%; height: 100%; }
.path-planned { fill: none; stroke: #94a3b8; stroke-width: 6; stroke-dasharray: 12; opacity: 0.5; }
.path-traveled { fill: none; stroke: #3b82f6; stroke-width: 6; stroke-linecap: round; }
.pin-origin { fill: #10b981; stroke: white; stroke-width: 4; }
.pin-dest { fill: #ef4444; stroke: white; stroke-width: 4; }

.truck-marker-group { transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1); }
.truck-blob {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  border: 2px solid white; animation: float 2s ease-in-out infinite;
}
@keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-4px); } 100% { transform: translateY(0); } }

.map-controls {
  position: absolute; bottom: 20px; left: 20px; display: flex; flex-direction: column; gap: 8px;
}
.ctrl-btn {
  width: 40px; height: 40px; border-radius: 10px; background: white;
  border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;
  cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: all 0.2s; color: #64748b;
}
.ctrl-btn:hover { background: #f8fafc; color: #2563eb; }

/* OPS PANEL */
.ops-panel { 
  width: 340px; display: flex; flex-direction: column; gap: 20px; 
  height: 100%; overflow-y: auto; padding-right: 4px;
}
.ops-panel::-webkit-scrollbar { width: 4px; }
.ops-panel::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.ops-card {
  background: #ffffff;
  border-radius: 20px; padding: 20px;
  border: 1px solid #e2e8f0;
}

.card-tag { 
  display: inline-block; padding: 3px 8px; border-radius: 6px;
  font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;
}

.v-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.v-header h3 { font-size: 18px; font-weight: 850; color: #1e293b; margin: 0; }
.v-header p { font-size: 13px; color: #64748b; margin: 0; }
.btn-call {
  width: 36px; height: 36px; border-radius: 10px; background: #ecfdf5;
  border: 1px solid #10b981; color: #059669; display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all 0.2s;
}
.btn-call:hover { transform: scale(1.05); background: #d1fae5; }

.v-stats { display: flex; gap: 24px; margin-bottom: 20px; }
.stat label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.stat p { font-size: 16px; font-weight: 800; color: #0f172a; margin: 2px 0 0 0; }

.v-progress-track { margin-top: 8px; }
.progress-bar { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 3px; }
.progress-labels { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #64748b; }

.route-health .health-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.route-health h4 { font-size: 14px; font-weight: 800; color: #1e293b; margin: 0; }
.health-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.health-row .l { font-size: 12px; color: #64748b; font-weight: 600; }
.health-row .v { font-size: 13px; font-weight: 800; color: #0f172a; }
.health-row .v.warning { color: #ef4444; }

.alert-box { 
  background: #fef2f2; color: #ef4444; padding: 10px; border-radius: 10px;
  display: flex; gap: 8px; align-items: center; font-size: 11px; font-weight: 600;
}
.success-box {
  background: #ecfdf5; color: #059669; padding: 10px; border-radius: 10px;
  display: flex; gap: 8px; align-items: center; font-size: 11px; font-weight: 600;
}

.activity-log h4 { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
.milestones { display: flex; flex-direction: column; gap: 16px; }
.milestone { display: flex; gap: 12px; position: relative; }
.milestone:not(:last-child)::after {
  content: ''; position: absolute; left: 5px; top: 16px; bottom: -16px;
  width: 2px; background: #f1f5f9;
}
.m-point { width: 12px; height: 12px; border-radius: 50%; background: #e2e8f0; border: 2px solid #fff; z-index: 2; margin-top: 4px; }
.milestone.completed .m-point { background: #3b82f6; }
.milestone.current .m-point { background: #3b82f6; box-shadow: 0 0 8px rgba(59, 130, 246, 0.3); }

.m-text p { font-size: 13px; font-weight: 700; color: #1e293b; margin: 0; }
.m-text span { font-size: 11px; color: #94a3b8; font-weight: 500; }

/* LEGEND */
.legend-toggle {
  position: absolute; bottom: 32px; right: 32px; z-index: 200;
  display: flex; align-items: center; gap: 8px; background: #3b82f6;
  color: white; padding: 10px 18px; border-radius: 20px; border: none;
  cursor: pointer; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
  font-size: 12px; font-weight: 700; transition: all 0.2s;
}
.legend-toggle:hover { background: #2563eb; transform: translateY(-2px); }

.tracking-legend {
  position: absolute; bottom: 84px; right: 32px; z-index: 200;
  background: white; border-radius: 16px; padding: 16px; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); animation: floatUp 0.3s ease-out; width: 220px;
}
@keyframes floatUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.legend-content { display: flex; flex-direction: column; gap: 10px; }
.l-item { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; color: #475569; }
.l-dot { width: 10px; height: 10px; border-radius: 50%; }

@media (max-width: 1200px) {
  .ops-panel { display: none; }
}
</style>
