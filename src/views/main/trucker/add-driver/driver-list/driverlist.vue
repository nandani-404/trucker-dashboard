<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  ArrowLeft, Search, UserX, 
  LayoutGrid, List, Plus, 
  Loader2, Phone, MapPin, 
  ShieldCheck, Trash2 
} from 'lucide-vue-next'
import { apiGet, apiDelete, END_POINTS, BASE_URL } from '../../../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

// --- State ---
const drivers = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const deletingId = ref<number | null>(null)

/** Fetch drivers */
async function fetchDrivers(searchTerm: string = '') {
  try {
    loading.value = true
    const res: any = await apiGet(END_POINTS.TRANSPORTER_DRIVERS(searchTerm))
    const list = res?.drivers ?? res?.data?.drivers ?? []
    drivers.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Error fetching drivers:', err)
    drivers.value = []
  } finally {
    loading.value = false
  }
}

/** Delete driver */
async function deleteDriver(id: number) {
  if (!confirm('Are you sure you want to remove this driver?')) return
  deletingId.value = id
  try {
    const res: any = await apiDelete(END_POINTS.TRANSPORTER_DELETE_DRIVERS(id))
    if (res?.status) {
      drivers.value = drivers.value.filter(d => d.id !== id)
    } else {
      alert(res?.message || 'Failed to delete driver')
    }
  } catch (err) {
    console.error('Delete error:', err)
  } finally {
    deletingId.value = null
  }
}

/** Avatar helper */
function getDriverAvatar(driver: any) {
  if (driver?.images) {
    return `${BASE_URL.replace(/\/$/, '')}/public/${driver.images}`
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(driver?.name || 'D')}&background=2563eb&color=fff`
}

onMounted(() => fetchDrivers(''))

/** Search with debounce */
let searchTimeout: any
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchDrivers(val.trim())
  }, 400)
})

const filteredDrivers = computed(() => drivers.value)
</script>

<template>
  <div class="driver-list-view">
    <!-- HEADER -->
    <header class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="title-group">
          <h1>Driver List</h1>
          <p>Manage, view, and safely organize your active driver network.</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-card">
          <span class="stat-value">{{ filteredDrivers.length }}</span>
          <span class="stat-label">Total Drivers</span>
        </div>
      </div>
    </header>

    <main class="content-wrapper">
      <!-- CONTROLS -->
      <div class="controls-bar">
        <div class="search-box">
          <Search :size="20" class="search-icon" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search drivers by name, TM ID, or phone number..." 
          />
        </div>
        <div class="view-toggles">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid :size="18" />
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <List :size="18" />
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading-state">
        <Loader2 :size="40" class="spin" />
        <p>Fetching your drivers...</p>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="filteredDrivers.length === 0" class="empty-state">
        <div class="empty-icon-box">
          <UserX :size="64" stroke-width="1.5" />
        </div>
        <h2>No drivers yet</h2>
        <p>Add drivers manually or via bulk import to get started.</p>
        <button class="btn-add-inline" @click="emit('navigate', 'add-driver')">
          <Plus :size="18" />
          <span>Add Your First Driver</span>
        </button>
      </div>

      <!-- LIST / GRID -->
      <div v-else class="drivers-container" :class="viewMode">
        <TransitionGroup name="stagger">
          <div 
            v-for="driver in filteredDrivers" 
            :key="driver.id" 
            class="driver-card"
          >
            <div class="card-inner">
              <div class="driver-identity">
                <img :src="getDriverAvatar(driver)" :alt="driver.name" class="avatar" />
                <div class="identity-text">
                  <h3>{{ driver.name }}</h3>
                  <div class="tm-id">
                    <ShieldCheck :size="14" />
                    <span>{{ driver.unique_id || 'ID Pending' }}</span>
                  </div>
                </div>
              </div>

              <div class="driver-info">
                <div class="info-item">
                  <Phone :size="14" />
                  <span>{{ driver.mobile }}</span>
                </div>
                <div class="info-item" v-if="driver.states">
                  <MapPin :size="14" />
                  <span>State ID: {{ driver.states }}</span>
                </div>
              </div>

              <button 
                class="btn-delete" 
                @click="deleteDriver(driver.id)" 
                :disabled="deletingId === driver.id"
              >
                <Loader2 v-if="deletingId === driver.id" :size="16" class="spin" />
                <Trash2 v-else :size="16" />
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </main>

    <!-- FLOATING ACTION BUTTON -->
    <button class="fab-add" @click="emit('navigate', 'add-driver')">
      <Plus :size="24" />
      <span>Add Driver</span>
    </button>
  </div>
</template>

<style scoped>
.driver-list-view {
  min-height: 100vh;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
}

/* Header */
.page-header {
  height: 100px; padding: 0 40px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
  background: white; position: sticky; top: 0; z-index: 100;
}
.header-left { display: flex; align-items: center; gap: 24px; }
.btn-back {
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s; background: white;
}
.btn-back:hover { background: #f8fafc; transform: translateX(-2px); }
.title-group h1 { font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.title-group p { font-size: 14px; color: #64748b; font-weight: 500; }

.stat-card {
  background: white; border: 1px solid #e2e8f0; padding: 12px 24px;
  border-radius: 16px; text-align: right; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}
.stat-value { display: block; font-size: 24px; font-weight: 800; color: #2563eb; line-height: 1; }
.stat-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

/* Content Wrapper */
.content-wrapper { max-width: 1300px; margin: 0 auto; padding: 40px; }

/* Controls */
.controls-bar { display: flex; gap: 20px; margin-bottom: 40px; }
.search-box { flex: 1; position: relative; }
.search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-box input {
  width: 100%; height: 56px; padding: 0 16px 0 54px; border-radius: 16px;
  border: 1px solid #e2e8f0; outline: none; transition: all 0.2s;
  font-size: 15px; background: #f8fafc;
}
.search-box input:focus { background: white; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

.view-toggles { display: flex; background: #f1f5f9; padding: 6px; border-radius: 14px; gap: 4px; }
.toggle-btn {
  width: 44px; height: 44px; border-radius: 10px; border: none; background: transparent;
  color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.toggle-btn.active { background: white; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 100px 20px; text-align: center; animation: fadeInUp 0.6s ease-out;
}
.empty-icon-box { color: #94a3b8; margin-bottom: 24px; opacity: 0.5; }
.empty-state h2 { font-size: 20px; font-weight: 800; color: #1e293b; }
.empty-state p { font-size: 14px; color: #64748b; margin: 12px 0 32px; max-width: 400px; }
.btn-add-inline {
  height: 48px; padding: 0 24px; background: #2563eb; color: white; border: none;
  border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
}
.btn-add-inline:hover { background: #1d4ed8; transform: translateY(-2px); }

/* Drivers Grid/List */
.drivers-container.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
.drivers-container.list { display: flex; flex-direction: column; gap: 16px; }

.driver-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; transition: all 0.3s; overflow: hidden; }
.driver-card:hover { border-color: #cbd5e1; transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
.card-inner { padding: 24px; display: flex; flex-direction: column; gap: 16px; position: relative; }

.driver-identity { display: flex; align-items: center; gap: 16px; }
.avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #f1f5f9; }
.identity-text h3 { font-size: 17px; font-weight: 700; color: #1e293b; }
.tm-id { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #059669; font-weight: 600; margin-top: 2px; }

.driver-info { display: flex; gap: 20px; background: #f8fafc; padding: 12px 16px; border-radius: 14px; }
.info-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; font-weight: 600; }

.btn-delete {
  position: absolute; top: 20px; right: 20px; width: 32px; height: 32px;
  border-radius: 8px; border: none; background: transparent; color: #94a3b8;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.btn-delete:hover { background: #fef2f2; color: #ef4444; }

/* List View Overrides */
.list .driver-card { border-radius: 16px; }
.list .card-inner { flex-direction: row; align-items: center; padding: 16px 24px; gap: 40px; }
.list .driver-info { background: transparent; padding: 0; flex: 1; }
.list .btn-delete { position: static; margin-left: auto; }
.list .driver-identity { width: 300px; }

/* FAB */
.fab-add {
  position: fixed; bottom: 40px; right: 40px; height: 64px; padding: 0 28px;
  background: #2563eb; color: white; border-radius: 32px; border: none;
  font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 12px;
  cursor: pointer; transition: all 0.3s; box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.4);
  z-index: 100;
}
.fab-add:hover { background: #1e40af; transform: translateY(-4px) scale(1.05); }

/* Animation */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.stagger-enter-active { animation: fadeInUp 0.4s ease-out both; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-header { padding: 0 20px; }
  .content-wrapper { padding: 40px 20px; }
  .list .card-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
  .list .driver-identity { width: 100%; }
}
</style>
