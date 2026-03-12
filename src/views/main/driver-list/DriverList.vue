<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ArrowLeft,
  Search,
  Trash2,
  Phone,
  MapPin,
  UserX,
  ShieldCheck,
  LayoutGrid,
  List,
  Plus,
  Loader2,
} from 'lucide-vue-next'
import { apiGet, apiDelete, END_POINTS, BASE_URL } from '../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

interface ApiDriver {
  id?: number
  name?: string
  unique_id?: string
  mobile?: string
  email?: string
  images?: string
  states?: string | number
  [key: string]: unknown
}

interface StateItem {
  id?: number
  name?: string
  codes?: string
}

const drivers = ref<ApiDriver[]>([])
const locations = ref<StateItem[]>([])
const loading = ref(true)
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('list')
const deletingId = ref<number | null>(null)

/** Fetch drivers from API - search filters by Name, TMID, phone no on server */
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

/** Fetch states for id->name mapping */
async function fetchLocations() {
  try {
    const res: any = await apiGet(END_POINTS.GETSTATES)
    if (res?.status && Array.isArray(res?.data)) {
      locations.value = res.data
    }
  } catch (err) {
    console.error('Error fetching states:', err)
  }
}

/** Resolve state id/number to state name */
function getStateName(driver: ApiDriver): string {
  const s = driver?.states
  if (s == null || s === '') return 'N/A'
  const found = locations.value.find(
    (loc) => loc.id === Number(s) || loc.name?.toLowerCase() === String(s).toLowerCase()
  )
  return found?.name ?? String(s)
}

/** Get avatar URL for driver */
function getDriverAvatar(driver: ApiDriver): string {
  if (driver?.images) {
    return `${BASE_URL.replace(/\/$/, '')}/public/${driver.images}`
  }
  const name = driver?.name || 'Driver'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1d4ed8&color=fff&size=128`
}

/** API returns filtered results - no client-side filtering */
const filteredDrivers = computed(() => drivers.value)

/** Debounced search - call API with search key (Name, TMID, phone no) */
watch(searchQuery, (val) => {
  const term = val.trim()
  if (!term) {
    fetchDrivers('')
    return
  }
  const timer = setTimeout(() => fetchDrivers(term), 400)
  return () => clearTimeout(timer)
})

async function deleteDriver(driver: ApiDriver) {
  const id = driver?.id
  if (!id) return
  const isConfirmed = confirm(
    `Are you sure you want to permanently remove ${driver?.name || 'this driver'} from your network?`
  )
  if (!isConfirmed) return
  deletingId.value = id
  try {
    const res: any = await apiDelete(END_POINTS.TRANSPORTER_DELETE_DRIVERS(id))
    if (res?.status) {
      drivers.value = drivers.value.filter((d) => d?.id !== id)
    } else {
      alert(res?.message || 'Failed to delete driver')
    }
  } catch (err: any) {
    console.error('Delete driver error:', err)
    alert(err?.message || 'Something went wrong')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  fetchLocations()
  fetchDrivers(searchQuery.value.trim())
})
</script>

<template>
  <div class="driver-list-master">
    <div class="page-container">
      
      <!-- Top Header -->
      <header class="page-header">
        <div class="header-left">
          <button class="icon-back-btn" @click="emit('back')" title="Go Back">
            <ArrowLeft :size="20" />
          </button>
          <div class="header-titles">
            <h1 class="main-title">Driver List</h1>
            <p class="sub-title">Manage, view, and safely organize your active driver network.</p>
          </div>
        </div>

        <div class="header-stats">
          <div class="stat-badge">
            <span class="stat-num">{{ filteredDrivers.length }}</span>
            <span class="stat-lbl">Total Drivers</span>
          </div>
        </div>
      </header>

      <!-- Advanced Controls Bar -->
      <div class="controls-wrapper">
        <div class="search-box">
          <Search :size="20" class="search-icon" />
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search drivers by name, TM ID, or phone number..." 
          />
        </div>

        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            title="Grid View"
          >
            <LayoutGrid :size="18" />
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            title="List View"
          >
            <List :size="18" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <Loader2 class="loading-spinner" :size="40" />
        <p>Loading drivers...</p>
      </div>

      <!-- Core Driver Cards UI -->
      <div v-else class="cards-layout">
        <transition-group
          name="list-anim"
          tag="div"
          class="data-container"
          :class="viewMode === 'list' ? 'list-view' : 'grid-view'"
        >
          <div
            v-for="driver in filteredDrivers"
            :key="driver.id ?? driver.unique_id"
            class="driver-card"
          >
            <div class="card-content">
              <!-- Top Profile Block -->
              <div class="profile-block">
                <img :src="getDriverAvatar(driver)" :alt="driver.name" class="avatar-img" />

                <div class="profile-titles">
                  <h3 class="d-name">{{ driver.name || 'N/A' }}</h3>
                  <div class="d-tmid">
                    <ShieldCheck :size="14" color="#10b981" />
                    <span>{{ driver.unique_id || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <!-- Info Strips -->
              <div class="info-block">
                <div class="info-item">
                  <div class="info-icon-box"><Phone :size="16" /></div>
                  <span class="info-text">{{ driver.mobile || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <div class="info-icon-box"><MapPin :size="16" /></div>
                  <span class="info-text">{{ getStateName(driver) }}</span>
                </div>
              </div>

              <!-- Delete Button -->
              <button
                class="delete-btn-corner"
                :disabled="deletingId === driver.id"
                @click.stop="deleteDriver(driver)"
                title="Remove Driver"
              >
                <Loader2 v-if="deletingId === driver.id" class="btn-loader" :size="16" />
                <Trash2 v-else :size="16" />
              </button>
            </div>
          </div>
        </transition-group>

        <!-- Empty State Fallback -->
        <div v-if="filteredDrivers.length === 0" class="empty-state">
          <div class="empty-pulsing-circle">
            <UserX :size="48" color="#94a3b8" />
          </div>
          <h3>{{ searchQuery.trim() ? 'No drivers found' : 'No drivers yet' }}</h3>
          <p>{{ searchQuery.trim() ? "We couldn't find any drivers matching your current search criteria." : 'Add drivers manually or via bulk import to get started.' }}</p>
          <button v-if="searchQuery.trim()" class="btn-clear" @click="searchQuery = ''">
            Clear Search
          </button>
        </div>
      </div>

    </div>

    <!-- Floating Add Driver Button -->
    <button class="fab-btn" @click="emit('navigate', 'add-driver')" title="Add New Driver">
      <Plus :size="24" />
      <span class="fab-text">Add Driver</span>
    </button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.driver-list-master {
  padding: 40px;
  padding-bottom: 120px; /* Prevent FAB from overlapping last item */
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  animation: slideDownIn 0.4s ease-out;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.icon-back-btn {
  width: 44px; height: 44px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  margin-top: 4px; 
}

.icon-back-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
  transform: translateX(-2px);
}

.main-title {
  margin: 0 0 6px 0;
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.sub-title {
  margin: 0;
  font-size: 15px;
  color: #64748b;
}

.header-stats {
  display: flex;
  align-items: center;
}

.stat-badge {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #1d4ed8;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-lbl {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Controls Wrapper */
.controls-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  animation: fadeUpIn 0.5s ease-out;
}

@media (max-width: 640px) {
  .controls-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
}

.search-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 18px 24px 18px 56px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 16px;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.search-box input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.view-toggle {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px; height: 44px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  color: #475569;
}

.toggle-btn.active {
  background: #f1f5f9;
  color: #0f172a;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  color: #64748b;
  font-size: 14px;
}

.loading-spinner {
  animation: spin 0.8s linear infinite;
  color: #1d4ed8;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-loader {
  animation: spin 0.8s linear infinite;
}

/* Base Driver Card styling (applies to both modes) */
.driver-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -10px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.driver-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 16px 40px -12px rgba(0,0,0,0.1);
}

.delete-btn-corner {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: #cbd5e1;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.driver-card:hover .delete-btn-corner {
  color: #94a3b8;
}

.delete-btn-corner:hover {
  background: #fef2f2;
  color: #ef4444 !important;
  transform: scale(1.1);
}

/* Shared elements */
.avatar-img {
  width: 64px; height: 64px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}

.d-name {
  margin: 0;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.3px;
}

.d-tmid {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

/* ==================================== */
/* GRID VIEW STYLES */
/* ==================================== */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.grid-view .driver-card {
  border-radius: 20px;
}

.grid-view .driver-card:hover {
  transform: translateY(-4px);
}

.grid-view .card-content {
  padding: 28px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.grid-view .delete-btn-corner {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.grid-view .profile-block {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.grid-view .profile-titles {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.grid-view .d-name { font-size: 18px; }
.grid-view .d-tmid { padding: 4px 10px; border-radius: 8px; font-size: 13px; }

.grid-view .info-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
}

.grid-view .info-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.grid-view .info-icon-box {
  display: flex; align-items: center; justify-content: center;
  color: #64748b;
}

.grid-view .info-text {
  font-size: 15px;
  font-weight: 500;
  color: #334155;
}

/* ==================================== */
/* LIST VIEW STYLES */
/* ==================================== */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-view .driver-card {
  border-radius: 16px;
}

.list-view .card-content {
  padding: 16px 24px;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .list-view .card-content {
    flex-wrap: wrap; /* On mobile, let list wrap slightly */
    gap: 16px;
  }
}

.list-view .profile-block {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 340px; /* Fixed width for alignment column */
  flex-shrink: 0;
}

.list-view .profile-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-view .d-name { font-size: 16px; }
.list-view .d-tmid { padding: 2px 8px; border-radius: 6px; font-size: 12px; }

.list-view .info-block {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 40px; /* Space between details in row */
  background: transparent;
}

@media (max-width: 768px) {
  .list-view .info-block { gap: 16px; width: 100%; flex: auto;}
}

.list-view .info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.list-view .info-icon-box {
  display: flex; align-items: center; justify-content: center;
  color: #64748b;
  width: 24px;
}

.list-view .info-text {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.list-view .delete-btn-corner {
  margin-left: auto; /* Push to far right */
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  text-align: center;
  animation: fadeUpIn 0.4s ease-out;
}

.empty-pulsing-circle {
  width: 96px; height: 96px;
  background: #ffffff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 0 0 16px rgba(255, 255, 255, 0.4);
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
}

.btn-clear {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-clear:hover { background: #f8fafc; border-color: #94a3b8; }

/* Vue Group Animations */
.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-anim-enter-from { opacity: 0; transform: translateY(20px) scale(0.95); }
.list-anim-leave-to { opacity: 0; transform: scale(0.9); }
.list-anim-leave-active { position: absolute; }

/* Floating Action Button */
.fab-btn {
  position: fixed;
  bottom: 40px;
  right: 40px;
  height: 64px;
  padding: 0 28px;
  background: #1d4ed8;
  color: #ffffff;
  border-radius: 32px;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(29, 78, 216, 0.4);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  animation: fadeUpIn 0.5s ease-out 0.3s backwards;
}

.fab-text {
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

@media (max-width: 640px) {
  .fab-btn {
    bottom: 24px;
    right: 24px;
    height: 56px;
    padding: 0 24px;
  }
  .fab-text {
    font-size: 15px;
  }
}

.fab-btn:hover {
  background: #1e40af;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 28px rgba(29, 78, 216, 0.5);
}

@keyframes slideDownIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUpIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
