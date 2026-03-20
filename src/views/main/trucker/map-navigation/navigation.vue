<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowLeft, Navigation, 
  Map as MapIcon, ExternalLink, 
  Clock, Ruler, CheckCircle,
  Truck, CornerUpRight, Info, Phone,
  Locate, Layers, MoreHorizontal,
  Maximize2, Minimize2, AlertCircle
} from 'lucide-vue-next'

const props = defineProps<{
  loadId?: string;
  origin?: string;
  destination?: string;
}>()

const emit = defineEmits(['back', 'home'])

// --- STATE ---
const loading = ref(true)
const isNavigating = ref(false)
const navStep = ref<'pickup' | 'drop'>('pickup')
const isSheetCollapsed = ref(false)
const currentZoom = ref(15)

// Define API key (Update this with your actual key if available in config)
const GOOGLE_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'

// Reactive Coordinates & Data
const locations = ref({
  current: { lat: 19.0760, lng: 72.8777, label: 'Your Location' },
  pickup: { lat: 19.2183, lng: 73.0867, label: props.origin || 'Bhiwandi Hub, MH' },
  drop: { lat: 18.5204, lng: 73.8567, label: props.destination || 'Pune Logistics Park' }
})

const tripStats = ref({
  totalDist: '148 km',
  totalTime: '3h 15m',
  toPickupDist: '32 km',
  toPickupTime: '45m',
  toDropDist: '116 km',
  toDropTime: '2h 30m'
})

const nextTurn = ref({
  instruction: 'Detecting next turn...',
  distance: '...',
  icon: CornerUpRight
})

const watchId = ref<number | null>(null)

// --- API METHODS ---

const geocode = async (address: string, type: 'pickup' | 'drop') => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.results[0]) {
      const coords = data.results[0].geometry.location
      if (type === 'pickup') {
        locations.value.pickup = { lat: coords.lat, lng: coords.lng, label: address }
      } else {
        locations.value.drop = { lat: coords.lat, lng: coords.lng, label: address }
      }
    }
  } catch (e) {
    console.error('Geocode error:', e)
  }
}

const fetchRoute = async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&mode=driving&key=${GOOGLE_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.status === 'OK' && data.routes[0]) {
      const leg = data.routes[0].legs[0]
      const step = leg.steps[0]
      
      const newStats = {
          dist: leg.distance.text,
          time: leg.duration.text,
          instruction: step.html_instructions.replace(/<[^>]*>/g, '')
      }

      if (navStep.value === 'pickup') {
        tripStats.value.toPickupDist = newStats.dist
        tripStats.value.toPickupTime = newStats.time
      } else {
        tripStats.value.toDropDist = newStats.dist
        tripStats.value.toDropTime = newStats.time
      }
      nextTurn.value.instruction = newStats.instruction
      nextTurn.value.distance = step.distance.text
    }
  } catch (e) {
    console.error('Route error:', e)
  }
}

const fetchCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locations.value.current = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your Location' }
        loading.value = false
      },
      (err) => {
        console.error('Location error:', err)
        loading.value = false
      }
    )
  } else {
    loading.value = false
  }
}

const startTracking = () => {
    if (watchId.value !== null) navigator.geolocation.clearWatch(watchId.value)
    watchId.value = navigator.geolocation.watchPosition(
        (pos) => {
            locations.value.current = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your Location' }
            if (isNavigating.value) {
                const target = navStep.value === 'pickup' ? locations.value.pickup : locations.value.drop
                fetchRoute(locations.value.current, target)
            }
        },
        (err) => console.error('Watch error:', err),
        { enableHighAccuracy: true, distanceFilter: 10 } as any
    )
}

const initialize = () => {
  fetchCurrentLocation()
  startTracking()
  
  if (props.origin && props.origin.length > 5) geocode(props.origin, 'pickup')
  if (props.destination && props.destination.length > 5) geocode(props.destination, 'drop')
}

const startNavigation = () => {
  isNavigating.value = true
  navStep.value = 'pickup'
  fetchRoute(locations.value.current, locations.value.pickup)
}

const markReachedPickup = () => {
  navStep.value = 'drop'
  fetchRoute(locations.value.current, locations.value.drop)
}

const stopNavigation = () => {
  isNavigating.value = false
}

const toggleSheet = () => {
  isSheetCollapsed.value = !isSheetCollapsed.value
}

const openExternalMaps = () => {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${locations.value.current.lat},${locations.value.current.lng}&destination=${locations.value.drop.lat},${locations.value.drop.lng}&waypoints=${locations.value.pickup.lat},${locations.value.pickup.lng}&travelmode=driving`
  window.open(url, '_blank')
}

const goBack = () => {
  emit('home')
}

onMounted(initialize)
</script>

<template>
  <div class="nav-screen">
    <!-- 1. LOADING OVERLAY -->
    <transition name="fade">
      <div v-if="loading" class="nav-loading">
        <div class="loading-content">
          <div class="spinner"></div>
          <h2>Initializing GPS...</h2>
          <p>Connecting to satellite network</p>
        </div>
      </div>
    </transition>

    <!-- 3. INTERACTIVE SEARCH / INFO PANEL -->
    <aside class="nav-info-panel" :class="{ 'collapsed': isSheetCollapsed }">
      <header class="panel-header">
         <button class="btn-circle-back" @click="goBack">
           <ArrowLeft :size="20" />
         </button>
         <div class="header-title">
           <span class="sub">Navigation</span>
           <h3>Fleet Command</h3>
         </div>
         <button class="btn-action-small" @click="toggleSheet" title="Hide Panel">
           <MoreHorizontal :size="20" />
         </button>
      </header>

      <div class="panel-content scrollable">
         <!-- External Maps Link -->
         <button class="external-maps-card" @click="openExternalMaps">
           <div class="icon-orb"><MapIcon :size="18" /></div>
           <div class="text">
             <h4>Google Maps</h4>
             <p>Open in native browser app</p>
           </div>
           <ExternalLink :size="16" class="arrow" />
         </button>

         <!-- Route Summary -->
         <div class="summary-section">
            <div class="stat-row">
               <div class="stat-card blue">
                 <Clock :size="18" />
                 <div class="val-grp">
                   <span class="v">{{ isNavigating ? (navStep === 'pickup' ? tripStats.toPickupTime : tripStats.toDropTime) : tripStats.totalTime }}</span>
                   <span class="l">Duration</span>
                 </div>
               </div>
               <div class="stat-card green">
                 <Ruler :size="18" />
                 <div class="val-grp">
                   <span class="v">{{ isNavigating ? (navStep === 'pickup' ? tripStats.toPickupDist : tripStats.toDropDist) : tripStats.totalDist }}</span>
                   <span class="l">Distance</span>
                 </div>
               </div>
            </div>
         </div>

         <!-- Points of Interest / Waypoints -->
         <div class="waypoint-list">
            <h5 class="section-title">ROUTE STOPS</h5>
            
            <div class="waypoint-item active" :class="{ 'completed': isNavigating && navStep === 'drop' }">
               <div class="indicator">
                 <div class="dot green"></div>
                 <div class="line"></div>
               </div>
               <div class="w-info">
                 <span class="label">PICKUP</span>
                 <p class="name">{{ locations.pickup.label }}</p>
                 <div v-if="isNavigating && navStep === 'pickup'" class="status-badge pulse">NAVIAGTING</div>
                 <div v-if="isNavigating && navStep === 'drop'" class="status-badge success">REACHED</div>
               </div>
               <button v-if="!isNavigating" class="btn-action-small"><Info :size="14" /></button>
            </div>

            <div class="waypoint-item" :class="{ 'active': isNavigating && navStep === 'drop' }">
               <div class="indicator">
                 <div class="dot black"></div>
               </div>
               <div class="w-info">
                 <span class="label">DESTINATION</span>
                 <p class="name">{{ locations.drop.label }}</p>
                 <div v-if="isNavigating && navStep === 'drop'" class="status-badge pulse">NAVIAGTING</div>
               </div>
               <button v-if="!isNavigating" class="btn-action-small"><Info :size="14" /></button>
            </div>
         </div>

         <!-- Status & Alerts (During Nav) -->
         <div v-if="isNavigating" class="nav-alerts">
            <div class="alert-card info">
              <AlertCircle :size="18" />
              <p>Heavy traffic expected near Bhiwandi Toll. +10 mins delay.</p>
            </div>
         </div>
      </div>

      <footer class="panel-footer">
        <button v-if="!isNavigating" class="btn-start-nav" @click="startNavigation">
           <Navigation :size="20" />
           <span>Start Full Navigation</span>
        </button>

        <button v-else-if="navStep === 'pickup'" class="btn-reached-pickup" @click="markReachedPickup">
           <CheckCircle :size="20" />
           <span>Arrived at Pickup</span>
        </button>

        <div v-else class="nav-in-progress">
           <div class="prog-info">
             <Truck :size="20" />
             <span>En Route to Destination</span>
           </div>
           <button class="btn-emergency"><Phone :size="18" /></button>
        </div>
      </footer>
    </aside>

    <!-- 2. MAIN MAP VIEWPORT -->
    <main class="map-viewport">
      <!-- Simulated High-End Map Background -->
      <div class="map-grid"></div>
      
      <!-- Simulated Route Lines -->
      <svg class="map-overlay" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        <!-- Planned Gray Route -->
        <path 
          v-if="!isNavigating"
          d="M 100 500 Q 300 300 500 400 T 900 100" 
          class="route-line-gray"
        />
        
        <!-- Current Navigation Route (Animated Blue/Green) -->
        <path 
          d="M 100 500 Q 300 300 500 400 T 900 100" 
          class="route-line-active"
          :class="{ 'navigating': isNavigating, 'step-drop': navStep === 'drop' }"
        />

        <!-- Markers -->
        <g class="markers">
          <!-- Current Position -->
          <circle cx="100" cy="500" r="10" class="current-dot" v-if="isNavigating">
             <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
          </circle>

          <!-- Pickup P -->
          <g transform="translate(500,400)">
            <circle r="18" fill="white" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
            <circle r="14" fill="#10b981" />
            <text dy=".3em" text-anchor="middle" fill="white" font-weight="900" font-size="12">P</text>
          </g>

          <!-- Drop D -->
          <g transform="translate(900,100)">
            <circle r="18" fill="white" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
            <circle r="14" fill="#0f172a" />
            <text dy=".3em" text-anchor="middle" fill="white" font-weight="900" font-size="12">D</text>
          </g>
        </g>
      </svg>

      <!-- Map Floating Controls -->
      <div class="map-ctrls">
        <button class="map-btn" @click="currentZoom++"><Maximize2 :size="18" /></button>
        <button class="map-btn" @click="currentZoom--"><Minimize2 :size="18" /></button>
        <div class="divider"></div>
        <button class="map-btn active"><Layers :size="18" /></button>
        <button class="map-btn-primary" @click="initialize"><Locate :size="20" /></button>
      </div>

      <transition name="slide-down">
        <div v-if="isNavigating" class="turn-banner">
          <div class="turn-icon-wrap">
            <component :is="nextTurn.icon" :size="32" color="white" />
          </div>
          <div class="turn-details">
            <h1 class="turn-text">{{ nextTurn.instruction }}</h1>
            <p class="turn-dist">{{ nextTurn.distance }}</p>
          </div>
          <button class="btn-exit" @click="stopNavigation">Exit</button>
        </div>
      </transition>

      <!-- Expand Panel Floating Button (When Collapsed) -->
      <transition name="fade">
        <button v-if="isSheetCollapsed" class="btn-expand-trigger" @click="toggleSheet" title="Show Management Panel">
           <MoreHorizontal :size="20" />
        </button>
      </transition>
    </main>
  </div>
</template>

<style scoped>
.nav-screen {
  display: block;
  height: 100vh;
  width: 100%;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* LOADING */
.nav-loading {
  position: fixed; inset: 0; background: white; z-index: 1000;
  display: flex; align-items: center; justify-content: center; text-align: center;
}
.spinner {
  width: 48px; height: 48px; border: 4px solid #f1f5f9; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px;
}
.nav-loading h2 { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
.nav-loading p { color: #64748b; font-weight: 500; }

/* MAP */
.map-viewport {
  position: absolute; inset: 0;
  right: 400px;
  background: #e0f2fe;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}
.nav-info-panel.collapsed ~ .map-viewport { right: 0; }
/* Alternatively, since I can't use sibling selectors upstream if order is wrong, I'll update it based on a class on the parent */
.map-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.5;
}
.map-overlay { width: 100%; height: 100%; position: relative; z-index: 2; }

.route-line-gray { fill: none; stroke: #94a3b8; stroke-width: 8; stroke-dasharray: 12; opacity: 0.3; }
.route-line-active { 
  fill: none; stroke: #3b82f6; stroke-width: 8; stroke-linecap: round; 
  stroke-dasharray: 1000; stroke-dashoffset: 1000;
  transition: stroke 0.5s;
}
.route-line-active.navigating { animation: drawPath 3s forwards ease-in-out; }
.route-line-active.step-drop { stroke: #10b981; }

@keyframes drawPath { to { stroke-dashoffset: 0; } }

.current-dot { fill: #3b82f6; stroke: white; stroke-width: 4; filter: drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4)); }

/* FLOATING CONTROLS */
.map-ctrls {
  position: absolute; bottom: 30px; left: 30px; 
  display: flex; flex-direction: column; gap: 10px; z-index: 10;
}
.map-btn {
  width: 48px; height: 48px; border-radius: 12px; background: white; border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer; transition: all 0.2s;
}
.map-btn:hover { background: #f8fafc; color: #0f172a; transform: translateY(-2px); }
.map-btn.active { color: #3b82f6; background: #eff6ff; }
.map-btn-primary {
  width: 48px; height: 48px; border-radius: 12px; background: #3b82f6; border: none;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); display: flex; align-items: center; justify-content: center;
  color: white; cursor: pointer; transition: all 0.2s; margin-top: 10px;
}
.map-btn-primary:active { transform: scale(0.95); }

.btn-expand-trigger {
  position: absolute; right: 24px; top: 24px; z-index: 100;
  width: 44px; height: 44px; border-radius: 12px;
  background: white; border: 1px solid #e2e8f0;
  color: #0f172a; cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); transition: all 0.2s;
}
.btn-expand-trigger:hover { transform: translateY(-2px); border-color: #3b82f6; color: #3b82f6; }

/* TURN BANNER */
.turn-banner {
  position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
  width: 90%; max-width: 600px;
  background: #111827; border-radius: 20px; padding: 20px 24px;
  display: flex; align-items: center; gap: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3); z-index: 100;
}
.turn-icon-wrap {
  width: 60px; height: 60px; border-radius: 12px; background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
}
.turn-details { flex: 1; color: white; }
.turn-text { font-size: 22px; font-weight: 800; margin: 0; }
.turn-dist { font-size: 16px; color: #94a3b8; font-weight: 600; margin-top: 2px; }
.btn-exit {
  background: #f43f5e; color: white; border: none; padding: 10px 18px; 
  border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer;
}

/* SIDE PANEL */
.nav-info-panel {
  width: 400px; height: 100%; background: #ffffff; border-left: 1px solid #e2e8f0;
  position: absolute; top: 0; right: 0;
  display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 200;
}
.nav-info-panel.collapsed { transform: translateX(100%); }

.panel-header {
  padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 16px;
  background: #ffffff;
}
.btn-circle-back {
  width: 42px; height: 42px; border-radius: 50%; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer; 
  background: white; color: #0f172a; transition: all 0.2s;
}
.btn-circle-back:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateX(-2px); }
.header-title { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.header-title .sub { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1; margin-bottom: 2px; }
.header-title h3 { font-size: 19px; font-weight: 850; color: #0f172a; margin: 0; line-height: 1.1; }

.panel-content { flex: 1; overflow-y: auto; padding: 24px; }
.scrollable::-webkit-scrollbar { width: 4px; }
.scrollable::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

/* PANEL COMPONENTS */
.external-maps-card {
  width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 16px; display: flex; align-items: center; gap: 16px;
  cursor: pointer; transition: all 0.2s; margin-bottom: 30px;
}
.external-maps-card:hover { border-color: #3b82f6; background: #eff6ff; }
.icon-orb { width: 40px; height: 40px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; color: #3b82f6; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.external-maps-card .text { flex: 1; text-align: left; }
.external-maps-card h4 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.external-maps-card p { font-size: 12px; color: #64748b; margin: 0; }

.stat-row { display: flex; gap: 16px; margin-bottom: 30px; }
.stat-card {
  flex: 1; padding: 20px; border-radius: 16px; display: flex; flex-direction: column; gap: 12px;
}
.stat-card.blue { background: #eff6ff; color: #2563eb; }
.stat-card.green { background: #ecfdf5; color: #059669; }
.stat-card .val-grp { display: flex; flex-direction: column; }
.stat-card .v { font-size: 22px; font-weight: 800; }
.stat-card .l { font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: 0.7; }

.section-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 20px; }

.waypoint-list { margin-bottom: 30px; }
.waypoint-item { display: flex; gap: 16px; margin-bottom: 15px; position: relative; }
.indicator { display: flex; flex-direction: column; align-items: center; width: 12px; }
.dot { width: 12px; height: 12px; border-radius: 50%; z-index: 2; margin-top: 6px; }
.dot.green { background: #10b981; outline: 3px solid #d1fae5; }
.dot.black { background: #0f172a; outline: 3px solid #e2e8f0; }
.line { width: 2px; flex: 1; background: #f1f5f9; margin-top: 4px; border-radius: 2px; min-height: 40px; }
.waypoint-item.active .line { background: #10b981; }
.waypoint-item.completed .line { background: #10b981; }

.w-info { flex: 1; text-align: left; }
.w-info .label { font-size: 10px; font-weight: 800; color: #94a3b8; }
.w-info .name { font-size: 14px; font-weight: 700; color: #1e293b; margin: 1px 0 0 0; }
.status-badge { display: inline-block; padding: 4px 10px; border-radius: 10px; font-size: 10px; font-weight: 800; margin-top: 8px; }
.status-badge.pulse { background: #eff6ff; color: #3b82f6; animation: softPulse 2s infinite; }
.status-badge.success { background: #ecfdf5; color: #059669; }

@keyframes softPulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

.btn-action-small {
  width: 32px; height: 32px; border-radius: 8px; border: none; background: #f8fafc;
  display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer;
  transition: all 0.2s;
}
.btn-action-small:hover { color: #3b82f6; background: #eff6ff; }

.nav-alerts { margin-top: 20px; }
.alert-card { display: flex; gap: 12px; padding: 16px; border-radius: 12px; font-size: 13px; font-weight: 500; }
.alert-card.info { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }

/* FOOTER */
.panel-footer { padding: 24px; border-top: 1px solid #f1f5f9; }
.btn-start-nav {
  width: 100%; height: 56px; border-radius: 16px; background: #3b82f6; color: white;
  border: none; font-size: 16px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.3); transition: all 0.2s;
}
.btn-start-nav:hover { background: #2563eb; transform: translateY(-2px); }

.btn-reached-pickup {
  width: 100%; height: 56px; border-radius: 16px; background: #10b981; color: white;
  border: none; font-size: 16px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
}

.nav-in-progress { display: flex; align-items: center; justify-content: space-between; }
.prog-info { display: flex; align-items: center; gap: 12px; color: #0f172a; font-weight: 700; font-size: 15px; }
.btn-emergency {
  width: 48px; height: 48px; border-radius: 50%; background: #fef2f2; color: #ef4444;
  border: 1px solid #fee2e2; display: flex; align-items: center; justify-content: center; cursor: pointer;
}

/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-down-enter-from, .slide-down-leave-to { transform: translate(-50%, -100%); opacity: 0; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .nav-info-panel { width: 100%; position: absolute; bottom: 0; left: 0; height: 50vh; }
  .nav-info-panel.collapsed { transform: translateY(100%); }
}
</style>
