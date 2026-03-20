<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { END_POINTS, apiGet } from '../../../../services/config/api'
import { 
  Search, MapPin, Truck, Weight, 
  ChevronRight, Filter, Map, Clock, ArrowUpDown,
  Zap, Navigation, ArrowLeft, X, Eye,
  LayoutGrid, List as ListIcon
} from 'lucide-vue-next'
import LoadDetailScreen from '../load-detail/loaddetail.vue'

const emit = defineEmits(['back', 'navigate'])

const searchQuery = ref('')
const activeFilter = ref('all')
const viewMode = ref('list') // 'list' | 'grid'
const showMap = ref(false)

const filters = [
  { id: 'all', label: 'All Loads', icon: Search },
  { id: 'nearby', label: 'Nearby', icon: MapPin },
  { id: 'high-pay', label: 'High Pay', icon: Zap },
  { id: 'same-day', label: 'Same Day', icon: Clock },
  { id: 'long-haul', label: 'Long Haul', icon: Navigation },
]

const materialTypes = ['Electronics', 'Steel', 'FMCG', 'Auto Parts', 'Textiles', 'Chemical', 'Cement']
const vehicleTypes = ['20ft Container', '32ft Trailer', '40ft Container', 'Open Body', 'Flatbed']
const states = ['Maharashtra', 'Rajasthan', 'Gujarat', 'Delhi', 'Haryana', 'Punjab', 'Karnataka', 'Tamil Nadu']

const showFilters = ref(false)
const selectedState = ref('')
const selectedMaterial = ref('')
const selectedVehicle = ref('')

const loads = ref<any[]>([])
const loading = ref(true)
const refreshing = ref(false)

const safeString = (val: any) => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'object') return val.length_label || val.name || val.label || ''
  return String(val)
}

const getTimeAgo = (dateStr: string) => {
  if (!dateStr) return 'Just now'
  const now = new Date()
  const created = new Date(dateStr)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

const fetchLoads = async () => {
  try {
    const response: any = await apiGet(END_POINTS.TRUCKER_AVAILABLE_LOADS)
    if (response?.status === 'success' || response?.data) {
      const data = response.data?.data || response.data || []
      loads.value = Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.error('Error fetching available loads:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = async () => {
  refreshing.value = true
  await fetchLoads()
}

onMounted(() => {
  fetchLoads()
})

const filteredLoads = computed(() => {
  let result = loads.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(l => 
      l.origin_location?.toLowerCase().includes(q) || 
      l.destination_location?.toLowerCase().includes(q) || 
      l.meterial?.toLowerCase().includes(q) ||
      l.load_id?.toLowerCase().includes(q)
    )
  }

  if (selectedState.value) {
    result = result.filter(l => l.origin_location?.toLowerCase().includes(selectedState.value.toLowerCase()))
  }

  if (selectedMaterial.value) {
    result = result.filter(l => l.meterial?.toLowerCase().includes(selectedMaterial.value.toLowerCase()))
  }

  if (selectedVehicle.value) {
    result = result.filter(l => l.vechicle_body?.toLowerCase().includes(selectedVehicle.value.toLowerCase()) || 
                               l.vechicle_type?.toLowerCase().includes(selectedVehicle.value.toLowerCase()))
  }

  return result
})

const selectedLoad = ref<any>(null)

const handleBid = (load: any) => {
  if (load) {
    selectedLoad.value = load
  }
}
</script>

<template>
  <div class="find-load-page">
    <transition name="page-fade" mode="out-in">
      <LoadDetailScreen 
        v-if="selectedLoad" 
        :loadData="selectedLoad" 
        @back="selectedLoad = null"
      />
      <div v-else class="list-view-container">
        <!-- Top Search & Filter Section -->
        <header class="page-header">
          <div class="header-content">
            <div class="header-top-row">
              <button class="btn-back-circle" @click="emit('back')" title="Go Back">
                <ArrowLeft :size="20" />
              </button>
              <div class="title-meta">
                <h1 class="page-title">Find Available Loads</h1>
                <p class="page-subtitle">Browse through the best routes and materials tailored for you.</p>
              </div>
            </div>
            
            <div class="search-filter-belt">
              <div class="search-box-wrapper">
                <div class="view-mode-toggles">
                  <button 
                    class="view-toggle-btn" 
                    :class="{ active: !showMap }" 
                    @click="showMap = false"
                  >
                    <ListIcon :size="18" />
                    <span>List</span>
                  </button>
                  <button 
                    class="view-toggle-btn" 
                    :class="{ active: showMap }" 
                    @click="showMap = true"
                  >
                    <Map :size="18" />
                    <span>Map</span>
                  </button>
                </div>

                <div class="search-input-group">
                  <Search class="search-icon" :size="20" />
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="Search city, material, or route..."
                    class="main-search-input"
                  />
                </div>

                <div class="header-action-group" style="z-index: 200;">
                  <div v-if="!showMap" class="layout-toggles">
                    <button 
                      class="toggle-btn" 
                      :class="{ active: viewMode === 'list' }" 
                      @click="viewMode = 'list'"
                      title="List Layout"
                    >
                      <ListIcon :size="18" />
                    </button>
                    <button 
                      class="toggle-btn" 
                      :class="{ active: viewMode === 'grid' }" 
                      @click="viewMode = 'grid'"
                      title="Grid Layout"
                    >
                      <LayoutGrid :size="18" />
                    </button>
                  </div>

                  <button class="btn-filter-toggle" @click.stop="showFilters = !showFilters">
                    <Filter :size="18" />
                    <span>More Filters</span>
                  </button>

                  <!-- Advanced Filters Dropdown (Small & Proper) -->
                  <transition name="fade-slide">
                    <div v-if="showFilters" class="advanced-filters-overlay" @click.stop>
                      <div class="overlay-header">
                        <h3>Refine Search</h3>
                        <button class="btn-close-overlay" @click="showFilters = false">
                          <X :size="16" />
                        </button>
                      </div>
                      
                      <div class="overlay-scroll-body">
                        <div class="filter-section">
                          <div class="section-title">
                            <MapPin :size="14" />
                            <span>Origin State</span>
                          </div>
                          <div class="tag-selector">
                            <button 
                              v-for="state in states" 
                              :key="state"
                              class="select-tag"
                              :class="{ active: selectedState === state }"
                              @click="selectedState = state"
                            >
                              {{ state }}
                            </button>
                          </div>
                        </div>

                        <div class="filter-section">
                          <div class="section-title">
                            <Zap :size="14" />
                            <span>Material Type</span>
                          </div>
                          <div class="tag-selector">
                            <button 
                              v-for="mat in materialTypes" 
                              :key="mat"
                              class="select-tag"
                              :class="{ active: selectedMaterial === mat }"
                              @click="selectedMaterial = mat"
                            >
                              {{ mat }}
                            </button>
                          </div>
                        </div>

                        <div class="filter-section">
                          <div class="section-title">
                            <Truck :size="14" />
                            <span>Vehicle Type</span>
                          </div>
                          <div class="tag-selector">
                            <button 
                              v-for="v in vehicleTypes" 
                              :key="v"
                              class="select-tag"
                              :class="{ active: selectedVehicle === v }"
                              @click="selectedVehicle = v"
                            >
                              {{ v }}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="overlay-actions">
                        <button class="btn-reset" @click="selectedState = ''; selectedMaterial = ''; selectedVehicle = ''">Reset</button>
                        <button class="btn-apply" @click="showFilters = false">Apply</button>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>

            <div v-if="showFilters" class="overlay-backdrop" @click="showFilters = false"></div>

            <div class="filter-chips-row">
              <button 
                v-for="filter in filters" 
                :key="filter.id"
                class="filter-chip"
                :class="{ active: activeFilter === filter.id }"
                @click="activeFilter = filter.id"
              >
                <component :is="filter.icon" :size="16" />
                <span>{{ filter.label }}</span>
              </button>
            </div>
          </div>
        </header>

        <main class="loads-grid-container">
          <div v-if="showMap" class="map-placeholder">
            <div class="map-inner">
              <Map :size="48" />
              <h3>Interactive Map</h3>
              <p>Found {{ filteredLoads.length }} loads in your area.</p>
            </div>
          </div>

          <div v-else-if="loading" class="map-placeholder">
            <div class="map-inner">
              <Clock :size="48" class="pulse-icon" />
              <h3>Fetching Latest Loads...</h3>
              <p>Connecting to TruckMitr network</p>
            </div>
          </div>

          <template v-else>
            <div class="stats-bar">
              <div class="loads-count">
                <strong>{{ filteredLoads.length }}</strong> loads available
              </div>
              <div class="sort-dropdown">
                <button class="refresh-btn" @click="onRefresh" :disabled="refreshing">
                  <ArrowUpDown :size="14" :class="{ 'spin-icon': refreshing }" />
                  <span>{{ refreshing ? 'Refreshing...' : 'Refresh' }}</span>
                </button>
              </div>
            </div>

            <div class="loads-view-container" :class="viewMode">
              <transition-group name="list-stagger">
                <div v-for="(load, index) in filteredLoads" :key="load.id || load.load_id" class="load-card" :style="{ '--index': index }">
                  <div class="card-header">
                    <div class="id-group">
                      <span class="load-id">{{ load.id }}</span>
                    </div>
                    <span class="status-badge" :class="load.statusType">
                      {{ load.status }}
                    </span>
                  </div>

                  <div class="card-body">
                    <div class="route-visualization">
                      <div class="route-point pickup">
                        <div class="point-icon green">
                          <MapPin :size="16" />
                        </div>
                        <div class="point-info">
                          <p class="address">{{ load.origin_location }}</p>
                          <p class="sub-location">{{ load.exact_origin_location || 'Pickup Point' }}</p>
                        </div>
                      </div>
                      
                      <div class="route-line-connector"></div>
                      
                      <div class="route-point delivery">
                        <div class="point-icon red">
                          <MapPin :size="16" />
                        </div>
                        <div class="point-info">
                          <p class="address">{{ load.destination_location }}</p>
                          <p class="sub-location">{{ load.exact_destination_location || 'Drop Location' }}</p>
                        </div>
                      </div>
                    </div>

                    <div class="load-specs">
                      <div class="spec-chip">
                        <div class="spec-icon-box material">
                          <Navigation :size="14" />
                        </div>
                        <span>{{ safeString(load.meterial) }}</span>
                      </div>
                      <div class="spec-chip">
                        <div class="spec-icon-box weight">
                          <Weight :size="14" />
                        </div>
                        <span>{{ load.meterial_quantity || load.load_qty }} Ton</span>
                      </div>
                      <div class="spec-chip">
                        <div class="spec-icon-box body">
                          <Truck :size="14" />
                        </div>
                        <span>{{ load.vechicle_body || load.vechicle_type || 'Any vehicle' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer">
                    <div class="meta-info">
                      <div class="meta-item">
                        <Clock :size="14" />
                        <span>{{ getTimeAgo(load.created_at) }}</span>
                      </div>
                      <div class="meta-item active-dot" v-if="load.status === 'Open Load' || load.statusType === 'open'">
                        <span class="dot"></span>
                        <span>Active</span>
                      </div>
                    </div>
                    <div class="action-section">
                      <button class="btn-bid" @click.stop="handleBid(load)">
                        <Eye :size="16" />
                        View Detail
                        <ChevronRight :size="16" />
                      </button>
                    </div>
                  </div>
                </div>
              </transition-group>
            </div>
          </template>
        </main>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.find-load-page {
  min-height: 100vh;
  background-color: #ffffff;
}

.list-view-container {
  padding-bottom: 60px;
}

/* Page Transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: scale(0.98) translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-10px);
}

/* Page Header */
.page-header {
  padding: 42px 0 28px 0;
  background: #ffffff;
  position: relative;
  z-index: 100;
}

.header-content {
  width: 100%;
  padding: 0 40px;
}

.header-top-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
}

.btn-back-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
  flex-shrink: 0;
  margin-top: 4px;
}

.btn-back-circle:hover {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.title-meta {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
  letter-spacing: -1px;
}

.page-subtitle {
  color: #64748b;
  font-size: 16px;
}

/* Search Belt */
.search-filter-belt {
  margin-bottom: 24px;
}

.search-box-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.search-input-group {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(241, 245, 249, 0.7);
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  padding: 0 16px;
  height: 56px;
  transition: all 0.3s ease;
}

.search-input-group:focus-within {
  background: white;
  border-color: #2563eb;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.08);
  transform: translateY(-1px);
}

.search-icon {
  color: #94a3b8;
  margin-right: 12px;
}

.main-search-input {
  flex: 1;
  border: none;
  background: transparent;
  height: 100%;
  font-size: 15px;
  outline: none;
  color: #0f172a;
}

.header-action-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.btn-filter-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  height: 56px;
  padding: 0 24px;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: none;
  white-space: nowrap;
}

.btn-filter-toggle:hover {
  background: #f8fafc;
  border-color: #2563eb;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(37,99,235,0.08);
}

.view-mode-toggles {
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 48px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: none;
  border: 1px solid #e2e8f0;
}

.overlay-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.05);
  z-index: 150;
}

.advanced-filters-overlay {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 480px;
  background: white;
  padding: 0;
  border-radius: 20px;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 201;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.overlay-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.overlay-header h3 {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.btn-close-overlay {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.btn-close-overlay:hover {
  background: #fee2e2;
  color: #ef4444;
}

.overlay-scroll-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overlay-scroll-body::-webkit-scrollbar {
  width: 4px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.select-tag {
  padding: 8px 18px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.select-tag.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
}

.overlay-actions {
  display: flex;
  padding: 20px 24px;
  background: #f8fafc;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
}

.btn-reset {
  flex: 1;
  background: white;
  border: 1.5px solid #e2e8f0;
  color: #64748b;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn-apply {
  flex: 2;
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Filter Chips */
.filter-chips-row {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
}

.filter-chip.active {
  background: #2563eb;
  color: white;
}

/* Grid Layout */
.loads-grid-container {
  width: 100%;
  padding: 32px 40px;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.loads-count {
  font-size: 15px;
  color: #64748b;
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

/* Load Cards */
.load-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  transition: border-color 0.2s ease;
}

.load-card:hover {
  border-color: #2563eb;
  box-shadow: none;
  transform: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.load-id {
  font-weight: 800;
  color: #0f172a;
  font-size: 14px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.open { background: #ecfdf5; color: #059669; }
.status-badge.booked { background: #fef2f2; color: #dc2626; }

.route-visualization {
  margin-bottom: 24px;
}

.route-point {
  display: flex;
  gap: 16px;
}

.point-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.point-icon.green { background: #ecfdf5; color: #10b981; }
.point-icon.red { background: #fef2f2; color: #ef4444; }

.address { font-weight: 700; color: #1e293b; margin: 0; }
.sub-location { font-size: 12px; color: #94a3b8; margin: 2px 0 0 0; }

.route-line-connector {
  width: 2px;
  height: 24px;
  background: #f1f5f9;
  margin: 4px 0 4px 15px;
}

.load-specs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.spec-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.card-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1.5px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.meta-item { display: flex; align-items: center; gap: 4px; }

.active-dot .dot {
  width: 6px; height: 6px;
  background: #10b981;
  border-radius: 50%;
}

.btn-bid {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.pulse-icon {
  animation: pulse-ring 2s infinite;
  color: #2563eb;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-ring {
  0% { transform: scale(0.9); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.9); opacity: 1; }
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #2563eb;
  color: #2563eb;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-slide-enter-active { animation: fadeSlide 0.3s ease; }
.fade-slide-leave-active { animation: fadeSlide 0.2s ease reverse; }

/* View Modes */
.loads-view-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.layout-toggles {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.toggle-btn {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  display: flex; justify-content: center; align-items: center;
  cursor: pointer;
}

.toggle-btn.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

@media (max-width: 640px) {
  .header-content { padding: 0 20px; }
  .loads-grid-container { padding: 20px; }
  .loads-view-container.grid { grid-template-columns: 1fr; }
}
</style>
