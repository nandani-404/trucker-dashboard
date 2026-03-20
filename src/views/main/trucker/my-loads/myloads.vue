<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Truck, Package, Clock, 
  ArrowRight, ArrowLeft, ChevronRight, 
  CheckCircle2, AlertCircle, Calendar,
  FileText, LayoutGrid, List as ListIcon
} from 'lucide-vue-next'
import { END_POINTS, apiGet } from '../../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

// --- State ---
const loads = ref<any[]>([])
const loading = ref(true)
const activeFilter = ref('all')
const viewMode = ref<'grid' | 'list'>('grid')
const selectedLoad = ref<any>(null)
const showDetailModal = ref(false)

// --- Filter Options ---
const filterOptions = [
  { id: 'all', label: 'All Bids', icon: LayoutGrid },
  { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'rejected', label: 'Rejected', icon: AlertCircle }
]

// --- API Calls ---
const fetchAppliedLoads = async () => {
    try {
        loading.value = true
        const response: any = await apiGet(END_POINTS.TRUCKER_APPLIED_LOADS)
        if (response?.status === 'success' || response?.data) {
            const list = response.data?.data || response.data || []
            loads.value = Array.isArray(list) ? list : []
            
            // Default sort: Accepted first, then newest
            loads.value.sort((a, b) => {
                const statusA = a.shipper_status?.toLowerCase();
                const statusB = b.shipper_status?.toLowerCase();
                if (statusA === 'accepted' && statusB !== 'accepted') return -1;
                if (statusA !== 'accepted' && statusB === 'accepted') return 1;
                return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
            });
        }
    } catch (error) {
        console.error('Error fetching applied loads:', error)
    } finally {
        loading.value = false;
    }
}

onMounted(fetchAppliedLoads)

// --- Computed ---
const filteredLoads = computed(() => {
    if (activeFilter.value === 'all') return loads.value
    if (activeFilter.value === 'pending') {
        return loads.value.filter(l => l.shipper_status !== 'accepted' && l.shipper_status !== 'rejected')
    }
    return loads.value.filter(l => l.shipper_status === activeFilter.value)
})

const getStatusTheme = (status: string | null) => {
    const s = status?.toLowerCase()
    if (s === 'accepted') return { label: 'Accepted', color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 }
    if (s === 'rejected') return { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', icon: AlertCircle }
    return { label: 'Pending', color: '#d97706', bg: '#fffbeb', icon: Clock }
}

const formatPrice = (price: any) => {
    if (!price) return 'N/A'
    return '₹' + Number(price).toLocaleString('en-IN')
}

const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr.replace(' ', 'T'))
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
}

const openLoadDetail = (load: any) => {
    selectedLoad.value = load
    showDetailModal.value = true
}

const handleAction = (load: any) => {
    if (load.shipper_status === 'accepted') {
        // Prioritize load_id (human readable) over internal id (database PK)
        const targetId = load.load_id || load.id
        emit('navigate', `active-trip/${targetId}`)
    } else {
        openLoadDetail(load)
    }
}

// Logic for button text based on status (from provided React Native code)
const getButtonText = (load: any) => {
    const currentStatus = load.current_status_label
    const isRestricted = Number(load.trucker_shown_intrest) === 1

    if (isRestricted && currentStatus !== 'Load Accepted' && currentStatus !== null) {
        if (currentStatus === 'Delivered') return 'Completed'
        return 'Update Status'
    }

    if (currentStatus === 'Load Accepted' || currentStatus === 'Accepted') return 'Add Vehicle & Driver'
    if (currentStatus === 'Vehicle Assigned') return 'Mark Reached Pickup'
    if (currentStatus === 'Reached Pickup') return 'Mark Loaded'
    if (currentStatus === 'Loaded') return 'Transit Controls'
    if (currentStatus === 'In Transit') return 'Reached Destination'
    if (currentStatus === 'Reached Destination') return 'Complete Trip'
    if (currentStatus === 'Delivered') return 'Trip Completed'
    return 'View Details'
}

</script>

<template>
  <div class="my-loads-view">
    <!-- HEADER BAR -->
    <header class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="title-group">
          <h1>My Bids & Loads</h1>
          <p v-if="!loading">{{ loads.length }} total loads applied</p>
        </div>
      </div>

      <div class="header-right">
        <div class="view-toggle">
          <button 
            :class="{ active: viewMode === 'grid' }" 
            @click="viewMode = 'grid'"
            title="Grid View"
          >
            <LayoutGrid :size="18" />
          </button>
          <button 
            :class="{ active: viewMode === 'list' }" 
            @click="viewMode = 'list'"
            title="List View"
          >
            <ListIcon :size="18" />
          </button>
        </div>
      </div>
    </header>

    <!-- FILTER TOOLBAR -->
    <section class="toolbar">
      <div class="filters-scroll">
        <button 
          v-for="opt in filterOptions" 
          :key="opt.id"
          class="filter-pill"
          :class="{ active: activeFilter === opt.id }"
          @click="activeFilter = opt.id"
        >
          <component :is="opt.icon" :size="16" />
          <span>{{ opt.label }}</span>
        </button>
      </div>
      
    </section>

    <!-- CONTENT AREA -->
    <main class="content-wrapper">
      <!-- Loading State -->
      <div v-if="loading" class="loading-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredLoads.length === 0" class="empty-state">
        <div class="empty-icon">
          <Package :size="64" />
        </div>
        <h2>No loads found</h2>
        <p>Try changing your filters or apply for new loads.</p>
        <button class="btn-primary" @click="emit('navigate', 'view-jobs')">Find New Loads</button>
      </div>

      <!-- Loads Grid/List -->
      <div v-else :class="['loads-container', viewMode]">
        <TransitionGroup name="list-fade">
          <div 
            v-for="(load, index) in filteredLoads" 
            :key="load.id" 
            class="load-card"
            :style="{ '--delay': index * 0.05 + 's' }"
            @click="openLoadDetail(load)"
          >
            <!-- Card Header: Status & ID -->
            <div class="card-top">
              <span class="load-id">{{ load.load_id }}</span>
              <span 
                class="status-badge" 
                :style="{ backgroundColor: getStatusTheme(load.shipper_status).bg, color: getStatusTheme(load.shipper_status).color }"
              >
                <component :is="getStatusTheme(load.shipper_status).icon" :size="14" />
                {{ load.current_status_label || getStatusTheme(load.shipper_status).label }}
              </span>
            </div>

            <!-- Card Body: Route -->
            <div class="card-route">
              <div class="route-point">
                <div class="marker origin"></div>
                <div class="loc-details">
                  <label>PICKUP</label>
                  <h3>{{ load.origin_location?.split(',')[0] }}</h3>
                  <p>{{ load.origin_location?.split(',').slice(1).join(',') }}</p>
                </div>
              </div>
              
              <div class="route-connector">
                <div class="line"></div>
                <Truck v-if="load.shipper_status === 'accepted'" :size="16" class="truck-icon" />
                <ArrowRight v-else :size="14" class="arrow-icon" />
              </div>

              <div class="route-point">
                <div class="marker destination"></div>
                <div class="loc-details">
                  <label>DELIVERY</label>
                  <h3>{{ load.destination_location?.split(',')[0] }}</h3>
                  <p>{{ load.destination_location?.split(',').slice(1).join(',') }}</p>
                </div>
              </div>
            </div>

            <!-- Card Info: Specs & Price -->
            <div class="card-info">
              <div class="price-section">
                <div class="price-grid">
                  <div class="price-item">
                    <label>YOUR BID</label>
                    <span class="price-val">{{ formatPrice(load.trucker_price) }}</span>
                  </div>
                  <div v-if="load.trucker_updated_price" class="price-item highlight">
                    <label>OFFERED PRICE</label>
                    <span class="price-val">{{ formatPrice(load.trucker_updated_price) }}</span>
                  </div>
                  <div class="price-item">
                    <label>RECEIVED</label>
                    <span class="price-val">₹0</span>
                  </div>
                </div>

                <div class="specs-under-price">
                  <div class="mini-spec">
                    <Package :size="12" />
                    <span>{{ load.vehicle_body || 'Any Body' }}</span>
                  </div>
                  <div class="mini-spec">
                    <Truck :size="12" />
                    <span>{{ load.vehicle_length || 'Open' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Footer: Metadata & Action -->
            <div class="card-footer">
              <div class="meta">
                <Clock :size="14" />
                <span>{{ getTimeAgo(load.applied_at) }}</span>
              </div>
              
              <button 
                v-if="load.shipper_status === 'accepted'"
                class="btn-action" 
                @click.stop="handleAction(load)"
              >
                {{ getButtonText(load) }}
                <ChevronRight :size="16" />
              </button>
            </div>
            
            <!-- Hover Overlay -->
            <div class="hover-decoration"></div>
          </div>
        </TransitionGroup>
      </div>
    </main>

    <!-- DETAIL MODAL (SIDE SHEET) -->
    <Transition name="slide-right">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="detail-sheet">
          <header class="sheet-header">
            <div class="sheet-title">
              <h2>Load Details</h2>
              <p>{{ selectedLoad?.load_id }}</p>
            </div>
            <button class="btn-close" @click="showDetailModal = false">×</button>
          </header>

          <div class="sheet-body">
            <!-- Summary Stats -->
            <div class="sheet-stats">
              <div class="stat-card">
                <label>Status</label>
                <div class="val" :style="{ color: getStatusTheme(selectedLoad?.shipper_status).color }">
                  {{ getStatusTheme(selectedLoad?.shipper_status).label }}
                </div>
              </div>
              <div class="stat-card">
                <label>Total Distance</label>
                <div class="val">~1,240 km</div>
              </div>
              <div class="stat-card highlight">
                <label>Your Bid</label>
                <div class="val">{{ formatPrice(selectedLoad?.trucker_price) }}</div>
              </div>
            </div>

            <!-- Detailed Route -->
            <div class="detail-section">
              <h3>Route Information</h3>
              <div class="route-timeline">
                <div class="tl-item">
                  <div class="tl-marker origin"></div>
                  <div class="tl-content">
                    <label>Pickup Point</label>
                    <p>{{ selectedLoad?.origin_location }}</p>
                    <div class="tl-meta"><Calendar :size="12"/> Expected: {{ selectedLoad?.picup_date }}</div>
                  </div>
                </div>
                <div class="tl-item">
                  <div class="tl-marker destination"></div>
                  <div class="tl-content">
                    <label>Drop-off Point</label>
                    <p>{{ selectedLoad?.destination_location }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Material & Vehicle -->
            <div class="detail-section">
              <h3>Material & Requirements</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Material</label>
                  <p>{{ selectedLoad?.meterial || 'N/A' }}</p>
                </div>
                <div class="info-item">
                  <label>Weight</label>
                  <p>{{ selectedLoad?.meterial_quantity ? selectedLoad.meterial_quantity + ' Tons' : 'N/A' }}</p>
                </div>
                <div class="info-item">
                  <label>Vehicle Body</label>
                  <p>{{ selectedLoad?.vehicle_body || 'Any' }}</p>
                </div>
                <div class="info-item">
                  <label>Vehicle Type</label>
                  <p>{{ selectedLoad?.vehicle_length || 'Open' }}</p>
                </div>
              </div>
            </div>

            <!-- Applied Info -->
            <div class="detail-section">
              <h3>History</h3>
              <div class="history-item">
                <div class="h-icon"><FileText :size="16" /></div>
                <div class="h-text">
                  <p>Bid Submitted on {{ selectedLoad?.applied_at }}</p>
                  <span>Your price: {{ formatPrice(selectedLoad?.trucker_price) }}</span>
                </div>
              </div>
            </div>
          </div>

          <footer class="sheet-footer">
            <button v-if="selectedLoad?.shipper_status === 'accepted'" class="btn-primary-block" @click="handleAction(selectedLoad)">
              Proceed to Active Trip
            </button>
            <button v-else class="btn-secondary-block" @click="showDetailModal = false">
              Close Details
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.my-loads-view {
  min-height: 100vh;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.page-header {
  height: 80px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 50;
}
.header-left { display: flex; align-items: center; gap: 20px; }
.btn-back {
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: #f8fafc; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: #f1f5f9; border-color: #cbd5e1; }
.title-group h1 { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.title-group p { font-size: 13px; color: #64748b; margin-top: 2px; }

.header-right { display: flex; align-items: center; gap: 16px; }
.view-toggle {
  background: #f1f5f9; padding: 4px; border-radius: 12px; display: flex; gap: 4px;
}
.view-toggle button {
  width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent;
  color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.view-toggle button.active { background: white; color: #2563eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

/* Toolbar */
.toolbar {
  padding: 24px 40px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}
.filters-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
.filter-pill {
  height: 42px; padding: 0 20px; border-radius: 20px; border: 1px solid #e2e8f0;
  background: transparent; color: #475569; font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.filter-pill:hover { border-color: #cbd5e1; background: #f8fafc; }
.filter-pill.active { background: #2563eb; border-color: #2563eb; color: white; }

.search-box {
  position: relative; flex: 1; max-width: 400px;
}
.search-box svg { position: absolute; left: 16px; top: 12px; color: #94a3b8; }
.search-box input {
  width: 100%; height: 42px; padding: 0 16px 0 48px; border-radius: 12px;
  border: 1px solid #e2e8f0; background: #f8fafc; outline: none; transition: all 0.2s;
}
.search-box input:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

/* Content */
.content-wrapper { padding: 32px 40px; flex: 1; overflow-y: auto; }
.loads-container.grid {
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); 
  gap: 24px;
  align-items: stretch;
}
.loads-container.list { display: flex; flex-direction: column; gap: 16px; }

/* Load Card */
.load-card {
  background: white; border-radius: 24px; border: 1px solid #e2e8f0;
  padding: 24px; display: flex; flex-direction: column;
  position: relative; overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: cardIn 0.5s ease-out forwards; animation-delay: var(--delay); opacity: 0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  height: 100%;
}
@keyframes cardIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.load-card:hover { transform: translateY(-8px); border-color: #cbd5e1; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.status-badge {
  padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px;
}
.load-id { font-size: 14px; font-weight: 700; color: #64748b; font-family: 'JetBrains Mono', monospace; }

.card-route { display: flex; align-items: center; gap: 16px; padding: 10px 0; margin-bottom: 20px; }
.route-point { flex: 1; display: flex; gap: 12px; }
.marker { width: 12px; height: 12px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
.marker.origin { border: 3px solid #059669; }
.marker.destination { border: 3px solid #dc2626; }
.loc-details label { font-size: 10px; font-weight: 800; color: #94a3b8; display: block; margin-bottom: 2px; }
.loc-details h3 { font-size: 17px; font-weight: 800; color: #1e293b; line-height: 1.2; margin-bottom: 2px; }
.loc-details p { 
  font-size: 12px; 
  color: #64748b; 
  line-height: 1.4; 
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.route-connector { flex-shrink: 0; width: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.route-connector .line { width: 100%; height: 2px; background: #f1f5f9; border-radius: 1px; }
.truck-icon { color: #3b82f6; animation: truckDrive 2s infinite ease-in-out; }
.arrow-icon { color: #cbd5e1; }
@keyframes truckDrive { 0%, 100% { transform: translateX(-4px); } 50% { transform: translateX(4px); } }

.card-info {
  background: #f8fafc; padding: 20px; border-radius: 20px;
  display: flex; flex-direction: column; gap: 16px;
  margin-bottom: auto;
}
.price-section { display: flex; flex-direction: column; gap: 16px; width: 100%; }
.price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.price-item { display: flex; flex-direction: column; gap: 4px; }
.price-item label { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; }
.price-item .price-val { font-size: 16px; font-weight: 800; color: #1e293b; }
.price-item.highlight label { color: #059669; }
.price-item.highlight .price-val { color: #059669; font-size: 18px; font-weight: 900; }

.specs-under-price { 
  display: flex; gap: 16px; padding-top: 12px; 
  border-top: 1px dashed #e2e8f0; 
}
.mini-spec { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; font-weight: 600; }

.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; }
.meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; font-weight: 500; }
.btn-action {
  height: 44px; padding: 0 20px; border-radius: 12px; font-size: 14px; font-weight: 800;
  display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
  border: none;
  background: #2563eb; color: white; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}
.btn-action:hover { background: #1d4ed8; transform: translateY(-2px); }

.hover-decoration {
  position: absolute; bottom: 0; left: 0; width: 0; height: 4px;
  background: #2563eb; transition: width 0.3s ease;
}
.load-card:hover .hover-decoration { width: 100%; }

/* Skeleton */
.skeleton-card {
  height: 280px; border-radius: 24px; background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmer 1.5s infinite;
}
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* Detail Sheet */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
  z-index: 1000; display: flex; justify-content: flex-end;
}
.detail-sheet {
  width: 500px; background: white; height: 100%; display: flex; flex-direction: column;
  box-shadow: -10px 0 50px rgba(0,0,0,0.1);
}
.sheet-header {
  padding: 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start;
}
.sheet-title h2 { font-size: 22px; font-weight: 900; color: #0f172a; }
.sheet-title p { font-size: 14px; color: #64748b; font-family: monospace; }
.btn-close { font-size: 32px; color: #94a3b8; background: none; border: none; cursor: pointer; line-height: 1; }

.sheet-body { flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; gap: 40px; }
.sheet-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card { background: #f8fafc; padding: 16px; border-radius: 16px; border: 1px solid #f1f5f9; }
.stat-card.highlight { background: #2563eb; color: white; border: none; }
.stat-card label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; display: block; }
.stat-card.highlight label { color: rgba(255,255,255,0.7); }
.stat-card .val { font-size: 16px; font-weight: 800; }

.detail-section h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 20px; }
.route-timeline { display: flex; flex-direction: column; gap: 24px; position: relative; }
.tl-item { display: flex; gap: 20px; position: relative; z-index: 2; }
.tl-marker { width: 16px; height: 16px; border-radius: 50%; background: white; margin-top: 4px; flex-shrink: 0; }
.tl-marker.origin { border: 4px solid #059669; }
.tl-marker.destination { border: 4px solid #dc2626; }
.route-timeline::after {
  content: ''; position: absolute; left: 7px; top: 16px; bottom: 8px; width: 2px;
  background: #f1f5f9; z-index: 1;
}
.tl-content label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.tl-content p { font-size: 15px; font-weight: 700; color: #1e293b; margin: 4px 0; }
.tl-meta { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 6px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.info-item label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 4px; }
.info-item p { font-size: 15px; font-weight: 700; color: #1e293b; }

.history-item { display: flex; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 16px; border: 1px solid #f1f5f9; }
.h-icon { width: 32px; height: 32px; border-radius: 8px; background: white; display: flex; align-items: center; justify-content: center; color: #3b82f6; }
.h-text p { font-size: 13px; font-weight: 700; color: #1e293b; }
.h-text span { font-size: 11px; color: #64748b; }

.sheet-footer { padding: 32px; border-top: 1px solid #f1f5f9; }
.btn-primary-block {
  width: 100%; height: 56px; border-radius: 16px; background: #2563eb; color: white;
  font-size: 16px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s;
}
.btn-primary-block:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(37,99,235,0.2); }
.btn-secondary-block {
  width: 100%; height: 56px; border-radius: 16px; background: #f1f5f9; color: #1e293b;
  font-size: 16px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s;
}

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 0; text-align: center;
}
.empty-icon { width: 120px; height: 120px; border-radius: 60px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #cbd5e1; margin-bottom: 24px; }
.empty-state h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.empty-state p { color: #64748b; margin-bottom: 32px; }
.btn-primary { 
  padding: 12px 32px; border-radius: 14px; background: #2563eb; color: white; 
  border: none; font-weight: 800; cursor: pointer; 
}

/* Transitions */
.list-fade-enter-active, .list-fade-leave-active { transition: all 0.3s ease; }
.list-fade-enter-from { opacity: 0; transform: translateY(20px); }
.list-fade-leave-to { opacity: 0; transform: scale(0.9); }

.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }

@media (max-width: 768px) {
  .page-header { padding: 0 20px; }
  .toolbar { padding: 20px; flex-direction: column; align-items: stretch; gap: 16px; }
  .content-wrapper { padding: 20px; }
  .detail-sheet { width: 100%; }
}
</style>
