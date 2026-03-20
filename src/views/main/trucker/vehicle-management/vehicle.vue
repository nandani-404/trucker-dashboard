<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Truck, ArrowLeft, Plus, 
  ChevronRight, Fuel, 
  Box, LayoutGrid, List as ListIcon
} from 'lucide-vue-next'
import { END_POINTS, apiGet } from '../../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

// --- State ---
const vehicles = ref<any[]>([])
const loading = ref(true)
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')

const fetchVehicles = async () => {
  try {
    loading.value = true
    const response: any = await apiGet(END_POINTS.TRUCKER_GET_VEHICLES)
    if (response?.status === 'success') {
      const data = response.data?.data || response.data || []
      vehicles.value = Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  } finally {
    setTimeout(() => { loading.value = false }, 600)
  }
}

onMounted(fetchVehicles)

// --- Computed ---
const filteredVehicles = computed(() => {
    if (!searchQuery.value) return vehicles.value
    const q = searchQuery.value.toLowerCase()
    return vehicles.value.filter(v => 
        v.registration_number?.toLowerCase().includes(q) ||
        v.manufacturer?.toLowerCase().includes(q) ||
        v.model?.toLowerCase().includes(q)
    )
})

const handleVehicleClick = (vehicle: any) => {
  emit('navigate', `vehicle-details/${vehicle.registration_number || vehicle.id}`)
}

</script>

<template>
  <div class="vehicle-view">
    <!-- HEADER -->
    <header class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="title-group">
          <h1>My Fleet</h1>
          <p>Fleet management overview</p>
        </div>
      </div>

      <div class="header-right">
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><LayoutGrid :size="18" /></button>
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><ListIcon :size="18" /></button>
        </div>
        <button class="btn-add" @click="emit('navigate', 'add-truck')">
          <Plus :size="18" />
          <span>Add Truck</span>
        </button>
      </div>
    </header>

    <main class="content-wrapper">

      <!-- VEHICLE GRID/LIST -->
      <div v-if="loading" class="loading-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>

      <div v-else-if="filteredVehicles.length === 0" class="empty-state">
        <div class="empty-icon"><Box :size="48" /></div>
        <h2>No Vehicles Found</h2>
        <p>You haven't added any vehicles yet or no matches found.</p>
        <button class="btn-add-large" @click="emit('navigate', 'add-truck')">Add Your First Truck</button>
      </div>

      <div v-else :class="['vehicles-container', viewMode]">
        <TransitionGroup name="stagger">
          <div 
            v-for="(v, index) in filteredVehicles" 
            :key="v.id || v.registration_number" 
            class="vehicle-card"
            :style="{ '--delay': index * 0.05 + 's' }"
            @click="handleVehicleClick(v)"
          >
            <!-- Card Top: Truck Icon Only -->
            <div class="card-visual">
              <div class="truck-graphic">
                <Truck :size="48" stroke-width="1.5" />
              </div>
            </div>

            <!-- Card Body: Identity -->
            <div class="card-identity">
              <h3 class="reg-number">{{ v.registration_number }}</h3>
              <p class="make-model">{{ v.manufacturer }} • {{ v.model }}</p>
            </div>

            <!-- Card Footer: Specs -->
            <div class="card-specs">
              <div class="spec-item">
                <Box :size="14" />
                <span>{{ v.body_type || 'N/A' }}</span>
              </div>
              <div class="spec-item">
                <Fuel :size="14" />
                <span>{{ v.fuel_type || 'N/A' }}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn-details">
                View Details
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </main>
  </div>
</template>

<style scoped>
.vehicle-view {
  min-height: 100vh;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.page-header {
  height: 80px; background: white; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; position: sticky; top: 0; z-index: 50;
}
.header-left { display: flex; align-items: center; gap: 20px; }
.btn-back {
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: white; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: #f8fafc; transform: translateX(-2px); }
.title-group h1 { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.title-group p { font-size: 13px; color: #64748b; margin-top: 2px; }

.header-right { display: flex; align-items: center; gap: 20px; }
.view-toggle {
  background: #f1f5f9; padding: 4px; border-radius: 12px; display: flex; gap: 4px;
}
.view-toggle button {
  width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent;
  color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.view-toggle button.active { background: white; color: #2563eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

.btn-add {
  height: 44px; padding: 0 20px; border-radius: 12px; background: #2563eb; color: white;
  border: none; font-weight: 700; display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
.btn-add:hover { background: #1d4ed8; transform: translateY(-2px); }

/* Stats Bar */
.stats-bar {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  margin-bottom: 32px;
}
.stat-card {
  background: white; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 20px; transition: all 0.3s;
}
.stat-card:hover { border-color: #cbd5e1; transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
.stat-icon {
  width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
}
.stat-icon.total { background: #eff6ff; color: #3b82f6; }
.stat-icon.active { background: #ecfdf5; color: #10b981; }
.stat-icon.pending { background: #fff7ed; color: #f97316; }
.stat-info label { font-size: 13px; color: #64748b; font-weight: 600; }
.stat-info h3 { font-size: 24px; font-weight: 800; color: #1e293b; margin-top: 4px; }

/* Content Wrapper */
.content-wrapper { padding: 40px; flex: 1; overflow-y: auto; max-width: 1400px; margin: 0 auto; width: 100%; }

/* Toolbar */
.toolbar { margin-bottom: 32px; }
.search-box { position: relative; max-width: 480px; }
.search-box svg { position: absolute; left: 16px; top: 13px; color: #94a3b8; }
.search-box input {
  width: 100%; height: 46px; padding: 0 16px 0 48px; border-radius: 14px;
  border: 1px solid #e2e8f0; background: #f8fafc; outline: none; transition: all 0.2s;
  font-size: 15px;
}
.search-box input:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }/* Vehicle Container - Grid & List View Mode */
.vehicles-container.grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px;
}

.vehicles-container.list {
  display: flex; flex-direction: column; gap: 16px;
}

/* Base Card */
.vehicle-card {
  background: white; border-radius: 20px; border: 1px solid #e2e8f0;
  cursor: pointer; position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardFadeIn 0.5s ease-out forwards; animation-delay: var(--delay); opacity: 0;
}

/* --- GRID SPECIFIC CARD STYLE --- */
.vehicles-container.grid .vehicle-card {
  padding: 24px; display: flex; flex-direction: column; gap: 16px;
}
.vehicles-container.grid .vehicle-card:hover { transform: translateY(-8px); border-color: #cbd5e1; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }

.vehicles-container.grid .card-visual {
  height: 140px; background: #f8fafc; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; color: #3b82f6;
}

.vehicles-container.grid .card-specs {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 0;
  border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;
}

/* --- LIST SPECIFIC CARD STYLE --- */
.vehicles-container.list .vehicle-card {
  display: flex; align-items: center; padding: 12px 24px; gap: 24px;
}
.vehicles-container.list .vehicle-card:hover { background: #f8fafc; transform: translateX(4px); border-color: #2563eb; }

.vehicles-container.list .card-visual {
  width: 56px; height: 56px; background: #eff6ff; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; color: #2563eb; flex-shrink: 0;
}
.vehicles-container.list .truck-graphic svg { width: 28px; height: 28px; }

.vehicles-container.list .card-identity { flex: 1; }
.vehicles-container.list .reg-number { font-size: 16px; }
.vehicles-container.list .make-model { font-size: 12px; margin-top: 2px; }

.vehicles-container.list .card-specs {
  display: flex; gap: 20px; border: none; padding: 0;
}

.vehicles-container.list .card-actions { margin: 0; }
.vehicles-container.list .btn-details {
  background: #f1f5f9; padding: 8px 16px; border-radius: 8px; color: #475569;
}
.vehicles-container.list .btn-details:hover { background: #e2e8f0; color: #1e293b; }

@keyframes cardFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.card-identity h3 { font-size: 20px; font-weight: 800; color: #1e293b; letter-spacing: -0.3px; }
.card-identity p { font-size: 14px; color: #64748b; margin-top: 4px; font-weight: 500; }

.spec-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; font-weight: 600; }

.card-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.btn-details {
  border: none; background: transparent; color: #2563eb; font-weight: 700;
  display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s;
}
.verification-status { display: flex; align-items: center; gap: 6px; color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; }

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 0; text-align: center;
}
.empty-icon {
  width: 100px; height: 100px; border-radius: 50%; background: #f1f5f9;
  display: flex; align-items: center; justify-content: center; color: #cbd5e1; margin-bottom: 24px;
}
.empty-state h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.empty-state p { color: #64748b; margin-bottom: 32px; }
.btn-add-large {
  padding: 14px 32px; background: #2563eb; color: white; border: none;
  border-radius: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 15px rgba(37, 99, 235, 0.2);
}

/* Skeleton */
.skeleton-card {
  height: 380px; border-radius: 24px; background: #f1f5f9;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { from { opacity: 0.6; } to { opacity: 1; } }

@media (max-width: 768px) {
  .page-header { padding: 0 20px; }
  .content-wrapper { padding: 20px; }
  .stats-bar { grid-template-columns: 1fr; }
  .header-right .btn-add span { display: none; }
  .header-right .btn-add { width: 44px; justify-content: center; padding: 0; }
}
</style>
