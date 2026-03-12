<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  ArrowLeft, Search, Filter, User,
  MapPin, Briefcase, CreditCard, Truck,
  IndianRupee, Clock, AlertCircle,
  Settings, LayoutGrid, List, UserPlus, Phone, Loader2
} from 'lucide-vue-next'
import {
  fetchDrivers,
  fetchTransporterInvites,
  inviteDriverToJob,
  fetchTransporterJobs,
  logCallToDriver,
  getDriverImageUrl,
  fetchStates,
  fetchVehicleTypes,
  type DriverItem,
  type InviteItem,
  type JobItem,
  type FilterState,
  type StateItem,
  type VehicleTypeItem
} from '../../../services/driverInvites/driverInvitesApi'

const emit = defineEmits(['back', 'navigate'])

type TabType = 'all' | 'my-invites'
const activeTab = ref<TabType>('all')
const searchQuery = ref('')
const allDriversSearch = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(false)

const driverList = ref<DriverItem[]>([])
const driverLoading = ref(false)
const driverPage = ref(1)
const driverLastPage = ref(1)
const driverLoadingMore = ref(false)

const myInvites = ref<InviteItem[]>([])
const invitesLoading = ref(false)

const states = ref<StateItem[]>([])
const vehicleTypeList = ref<VehicleTypeItem[]>([])

const apiFilters = ref<FilterState>({
  stateId: '',
  vehicle_type: '',
  min_experience: '',
  max_experience: '',
  type_of_license: '',
  min_rating: '',
  max_rating: ''
})

const experiences = [
  { label: '1-5 years', value: '1-5' },
  { label: '5-10 years', value: '5-10' },
  { label: '10-15 years', value: '10-15' },
  { label: '15-20 years', value: '15-20' },
  { label: '20+ years', value: '20-30' }
]
const licenseTypes = [
  { label: 'LMV', value: 'LMV' },
  { label: 'HMV', value: 'HMV' },
  { label: 'HGMV', value: 'HGMV' },
  { label: 'HPMV/HTV', value: 'HPMV/HTV' }
]
const ratings = [
  { label: '1-2', min: '1', max: '2' },
  { label: '2-3', min: '2', max: '3' },
  { label: '3-4', min: '3', max: '4' },
  { label: '4-5', min: '4', max: '5' }
]

const showJobModal = ref(false)
const jobsList = ref<JobItem[]>([])
const loadingJobs = ref(false)
const selectedDriverId = ref<number | null>(null)
const invitingWithJob = ref(false)
const inviteConsent = ref<Record<number, boolean>>({})
const inviteError = ref<Record<number, string>>({})
const inviteLoading = ref<Record<number, boolean>>({})

const expRange = ref('')
const ratingRange = ref('')
watch(expRange, (v) => {
  if (!v) { apiFilters.value.min_experience = ''; apiFilters.value.max_experience = '' }
  else { const [min, max] = v.split('-'); apiFilters.value.min_experience = min; apiFilters.value.max_experience = max || min }
})
watch(ratingRange, (v) => {
  if (!v) { apiFilters.value.min_rating = ''; apiFilters.value.max_rating = '' }
  else { const [min, max] = v.split('-'); apiFilters.value.min_rating = min; apiFilters.value.max_rating = max || min }
})

const toastMessage = ref('')
const showToast = (msg: string) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

const filteredInvites = computed(() => {
  if (!searchQuery.value) return myInvites.value
  const q = searchQuery.value.toLowerCase()
  return myInvites.value.filter((inv) => {
    const name = inv.driver?.name || ''
    const uid = inv.driver?.unique_id || ''
    const jobId = inv.job?.job_id || ''
    return name.toLowerCase().includes(q) || uid.toLowerCase().includes(q) || jobId.toLowerCase().includes(q)
  })
})

async function loadDrivers(page = 1, append = false) {
  if (append) driverLoadingMore.value = true
  else driverLoading.value = true
  try {
    const { drivers, lastPage } = await fetchDrivers({
      search: allDriversSearch.value,
      page,
      perPage: 10,
      filters: apiFilters.value
    })
    driverLastPage.value = lastPage
    if (append) driverList.value = [...driverList.value, ...drivers]
    else driverList.value = drivers
  } catch {
    if (!append) driverList.value = []
  } finally {
    driverLoading.value = false
    driverLoadingMore.value = false
  }
}

async function loadInvites() {
  invitesLoading.value = true
  try {
    myInvites.value = await fetchTransporterInvites()
  } catch {
    myInvites.value = []
  } finally {
    invitesLoading.value = false
  }
}

async function loadFilterData() {
  try {
    const [s, v] = await Promise.all([fetchStates(), fetchVehicleTypes()])
    states.value = s
    vehicleTypeList.value = v
  } catch {}
}

function applyFilters() {
  driverPage.value = 1
  loadDrivers(1)
  showFilters.value = false
}

function resetFilters() {
  apiFilters.value = {
    stateId: '',
    vehicle_type: '',
    min_experience: '',
    max_experience: '',
    type_of_license: '',
    min_rating: '',
    max_rating: ''
  }
  expRange.value = ''
  ratingRange.value = ''
  driverPage.value = 1
  loadDrivers(1)
  showFilters.value = false
}

function openJobModal(driverId: number) {
  selectedDriverId.value = driverId
  loadingJobs.value = true
  showJobModal.value = true
  fetchTransporterJobs().then((jobs) => {
    jobsList.value = jobs
  }).finally(() => {
    loadingJobs.value = false
  })
}

async function handleInviteWithJob(jobId: string) {
  const driverId = selectedDriverId.value
  if (!driverId) return
  invitingWithJob.value = true
  try {
    const res = await inviteDriverToJob(driverId, jobId)
    showToast(res.message || 'Invite sent successfully')
    showJobModal.value = false
    selectedDriverId.value = null
    loadDrivers(driverPage.value)
    loadInvites()
  } catch (e) {
    showToast(e instanceof Error ? e.message : 'Invite failed')
  } finally {
    invitingWithJob.value = false
  }
}

async function handleInviteDriver(driver: DriverItem) {
  if (!inviteConsent.value[driver.id]) {
    inviteError.value = { ...inviteError.value, [driver.id]: 'Please accept the TruckMitr consent to invite' }
    return
  }
  inviteError.value = { ...inviteError.value, [driver.id]: '' }
  openJobModal(driver.id)
}

async function handleCallDriver(item: InviteItem) {
  if (item.status !== 'accepted' || !item.driver?.mobile) return
  try {
    await logCallToDriver(item.driver.id, item.job?.job_id || '')
    window.location.href = `tel:${item.driver.mobile}`
  } catch {}
}

function getPreferredSkills(item: InviteItem) {
  try {
    const skills = item.job?.Preferred_Skills
    if (skills && typeof skills === 'string') {
      const parsed = JSON.parse(skills)
      if (Array.isArray(parsed)) return parsed.join(', ')
      return skills
    }
  } catch {}
  return item.job?.Preferred_Skills || 'Not Available'
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'accepted': return { bg: '#E8F5E8', color: '#2E7D32', text: 'Accepted' }
    case 'pending': return { bg: '#FFF3E0', color: '#F57C00', text: 'Pending' }
    case 'rejected': return { bg: '#FFEBEE', color: '#C62828', text: 'Rejected' }
    default: return { bg: '#F5F5F5', color: '#757575', text: 'Unknown' }
  }
}

onMounted(() => {
  loadFilterData()
  loadDrivers(1)
  loadInvites()
})

watch(activeTab, (tab) => {
  if (tab === 'my-invites') loadInvites()
  if (tab === 'all') loadDrivers(1)
})

watch([allDriversSearch, apiFilters], () => {
  driverPage.value = 1
  loadDrivers(1)
}, { deep: true })

function loadMoreDrivers() {
  if (!driverLoadingMore.value && driverPage.value < driverLastPage.value && driverList.value.length > 0) {
    driverPage.value++
    loadDrivers(driverPage.value, true)
  }
}
</script>

<template>
  <div class="driver-invites-view">
    <div class="page-container">
      <!-- Header Section -->
      <header class="view-header">
        <div class="header-left">
          <button class="btn-back" @click="emit('back')">
            <ArrowLeft :size="20" />
          </button>
          <div class="title-group">
            <h1>Invite Drivers</h1>
            <p>Connect with professional drivers and manage your invitations</p>
          </div>
        </div>
        
        <div class="tab-controls">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            All Drivers
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'my-invites' }"
            @click="activeTab = 'my-invites'"
          >
            My Invites
            <span class="badge" v-if="myInvites.length > 0">{{ myInvites.length }}</span>
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="content-area">
        <transition name="fade-slide" mode="out-in">
          <!-- All Drivers Tab -->
          <div v-if="activeTab === 'all'" key="all-tab" class="tab-pane">
            <div class="search-filter-bar">
              <div class="search-box">
                <Search :size="18" class="search-icon" />
                <input v-model="allDriversSearch" type="text" placeholder="Search Drivers (Name, TM ID, Phone)" />
              </div>
              <div class="controls-group">
                <div class="filter-wrapper">
                  <button class="btn-filter" @click="showFilters = !showFilters">
                    <Filter :size="18" />
                    <span>Filter</span>
                  </button>
                  
                  <!-- Filter Dropdown -->
                  <div v-if="showFilters" class="filter-dropdown">
                    <div class="filter-section">
                      <label>State</label>
                      <select v-model="apiFilters.stateId">
                        <option value="">All States</option>
                        <option v-for="s in states" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Vehicle Type</label>
                      <select v-model="apiFilters.vehicle_type">
                        <option value="">All Types</option>
                        <option v-for="v in vehicleTypeList" :key="v.id" :value="String(v.id)">{{ v.vehicle_name }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Experience</label>
                      <select v-model="expRange">
                        <option value="">Any Experience</option>
                        <option v-for="e in experiences" :key="e.value" :value="e.value">{{ e.label }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>License</label>
                      <select v-model="apiFilters.type_of_license">
                        <option value="">All Licenses</option>
                        <option v-for="l in licenseTypes" :key="l.value" :value="l.value">{{ l.label }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Rating</label>
                      <select v-model="ratingRange">
                        <option value="">All Ratings</option>
                        <option v-for="r in ratings" :key="r.min" :value="r.min + '-' + r.max">{{ r.label }} ⭐</option>
                      </select>
                    </div>
                    <div class="filter-actions">
                      <button class="btn-reset" @click="resetFilters">Reset</button>
                      <button class="btn-apply" @click="applyFilters">Apply</button>
                    </div>
                  </div>
                </div>

                <div class="view-toggle">
                  <button class="vt-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="Grid View">
                    <LayoutGrid :size="18" />
                  </button>
                  <button class="vt-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="List View">
                    <List :size="18" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="driverLoading" class="empty-state">
              <Loader2 :size="40" class="spin" />
              <h3 class="muted-text">Loading drivers...</h3>
            </div>
            <div v-else-if="driverList.length === 0" class="empty-state">
              <div class="empty-media">
                <img src="/src/assets/logo/logotrick.png" alt="TruckMitr Logo" class="empty-logo muted-grey" />
              </div>
              <h3 class="muted-text">No drivers currently available</h3>
              <p class="muted-text">{{ allDriversSearch || Object.values(apiFilters).some(v => v) ? 'No drivers found with current filters.' : 'Please try again later.' }}</p>
            </div>
            <div v-else class="drivers-list-wrap">
              <div class="drivers-list" :class="{ 'list-view': viewMode === 'list' }">
                <div v-for="driver in driverList" :key="driver.id" class="driver-card">
                  <div class="driver-card-header">
                    <img :src="getDriverImageUrl(driver.images, driver.avatar)" :alt="driver.name" class="driver-avatar" />
                    <div class="driver-info">
                      <h3>{{ driver.name || 'N/A' }}</h3>
                      <span class="tm-id">{{ driver.unique_id || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="driver-stats">
                    <span><MapPin :size="14" /> {{ driver.state_name || 'N/A' }}</span>
                    <span><Briefcase :size="14" /> {{ driver.Driving_Experience ? `${driver.Driving_Experience} yrs` : 'N/A' }}</span>
                    <span><CreditCard :size="14" /> {{ driver.Type_of_License || 'N/A' }}</span>
                    <span><Truck :size="14" /> {{ driver.vehicle_type_name || 'N/A' }}</span>
                  </div>
                  <div class="consent-row">
                    <input type="checkbox" :id="'consent-' + driver.id" v-model="inviteConsent[driver.id]" />
                    <label :for="'consent-' + driver.id">I agree to TruckMitr <a href="#" @click.prevent="emit('navigate', 'privacy-policy')">transporter consent</a> and add job policy.</label>
                  </div>
                  <p v-if="inviteError[driver.id]" class="invite-err">{{ inviteError[driver.id] }}</p>
                  <button class="btn-invite" :disabled="inviteLoading[driver.id]" @click="handleInviteDriver(driver)">
                    <Loader2 v-if="inviteLoading[driver.id]" :size="18" class="spin" />
                    <UserPlus v-else :size="18" />
                    {{ inviteLoading[driver.id] ? 'Inviting...' : 'Invite' }}
                  </button>
                </div>
              </div>
              <div v-if="driverPage < driverLastPage" class="load-more-wrap">
                <button class="btn-load-more" :disabled="driverLoadingMore" @click="loadMoreDrivers">
                  {{ driverLoadingMore ? 'Loading...' : 'Load More' }}
                </button>
              </div>
            </div>
          </div>

          <!-- My Invites Tab -->
          <div v-else key="invites-tab" class="tab-pane">
            <div class="search-filter-bar">
              <div class="search-box">
                <Search :size="18" class="search-icon" />
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search by name, TM ID, or job ID..." 
                />
              </div>
              <div class="controls-group">
                <div class="view-toggle">
                  <button 
                    class="vt-btn" 
                    :class="{ active: viewMode === 'grid' }" 
                    @click="viewMode = 'grid'"
                    title="Grid View"
                  >
                    <LayoutGrid :size="18" />
                  </button>
                  <button 
                    class="vt-btn" 
                    :class="{ active: viewMode === 'list' }" 
                    @click="viewMode = 'list'"
                    title="List View"
                  >
                    <List :size="18" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="invitesLoading" class="empty-state">
              <Loader2 :size="40" class="spin" />
              <h3 class="muted-text">Loading invites...</h3>
            </div>
            <div v-else-if="filteredInvites.length === 0" class="empty-state">
              <div class="empty-media">
                <img src="/src/assets/logo/logotrick.png" alt="TruckMitr Logo" class="empty-logo muted-grey" />
              </div>
              <h3 class="muted-text">{{ searchQuery ? 'No invites found' : 'No invites yet' }}</h3>
              <p class="muted-text">{{ searchQuery ? `No invites matching "${searchQuery}"` : 'Invite drivers from the All Drivers tab.' }}</p>
            </div>
            <div v-else class="invites-grid" :class="{ 'list-view': viewMode === 'list' }">
              <div 
                v-for="invite in filteredInvites" 
                :key="invite.id" 
                class="invite-card"
              >
                <div class="card-main-layout">
                  <!-- Top Row: Identity and Status -->
                  <div class="top-row">
                    <div class="identity-corner">
                      <div class="avatar-small">
                        <img v-if="invite.driver" :src="getDriverImageUrl(invite.driver.images, invite.driver.avatar)" :alt="invite.driver.name" />
                        <div v-else class="avatar-fallback">
                          <User :size="18" />
                        </div>
                      </div>
                      <div class="name-id-group">
                        <h3>{{ invite.driver?.name || 'N/A' }}</h3>
                        <span class="tm-id">{{ invite.driver?.unique_id || 'N/A' }}</span>
                      </div>
                    </div>
                    <div class="status-corner">
                      <div 
                        class="status-badge" 
                        :class="(invite.status || '').toLowerCase()"
                        :style="{ backgroundColor: getStatusConfig(invite.status).bg, color: getStatusConfig(invite.status).color }"
                      >
                        <Clock :size="12" />
                        <span>{{ getStatusConfig(invite.status).text }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Middle Row: Stats in Single Line -->
                  <div class="stats-line">
                    <div class="inline-stat">
                      <MapPin :size="14" />
                      <span>State: <strong>{{ invite.driver?.state_name || 'N/A' }}</strong></span>
                    </div>
                    <div class="inline-stat">
                      <Briefcase :size="14" />
                      <span>Exp: <strong>{{ invite.driver?.Driving_Experience ? `${invite.driver.Driving_Experience} yrs` : 'N/A' }}</strong></span>
                    </div>
                    <div class="inline-stat">
                      <CreditCard :size="14" />
                      <span>License: <strong>{{ invite.driver?.Type_of_License || 'N/A' }}</strong></span>
                    </div>
                    <div class="inline-stat">
                      <Truck :size="14" />
                      <span>Vehicle: <strong>{{ invite.driver?.vehicle_type_name || 'N/A' }}</strong></span>
                    </div>
                  </div>

                  <div class="job-center-row">
                    <div class="job-details-box">
                      <div class="job-header">
                        <Briefcase :size="16" class="text-blue" />
                        <span class="job-id-text">ID: {{ invite.job?.job_id || 'N/A' }}</span>
                      </div>
                      
                      <div class="job-body">
                        <h5 class="job-title">{{ invite.job?.job_title || 'N/A' }}</h5>
                        
                        <div class="job-meta-grid">
                          <div class="meta-item">
                            <MapPin :size="14" />
                            <label>Location:</label>
                            <strong>{{ invite.job?.job_location || 'N/A' }}</strong>
                          </div>
                          <div class="meta-item">
                            <IndianRupee :size="14" />
                            <label>Salary:</label>
                            <strong>{{ invite.job?.Salary_Range || 'N/A' }}</strong>
                          </div>
                          <div class="meta-item">
                            <Clock :size="14" />
                            <label>Experience:</label>
                            <strong>{{ invite.job?.Experience_Required || 'N/A' }}</strong>
                          </div>
                          <div class="meta-item">
                            <Truck :size="14" />
                            <label>Vehicle:</label>
                            <strong>{{ invite.job?.Vehicle_Type_Required || 'N/A' }}</strong>
                          </div>
                          <div class="meta-item full-width">
                            <Settings :size="14" />
                            <label>Preferred Skills:</label>
                            <strong>{{ getPreferredSkills(invite) }}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Call button for accepted invites -->
                  <div v-if="invite.status === 'accepted' && invite.driver?.mobile" class="invite-actions">
                    <button class="btn-call" @click="handleCallDriver(invite)">
                      <Phone :size="18" />
                      Call Driver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </main>

      <!-- Job Selection Modal -->
      <Teleport to="body">
        <div v-if="showJobModal" class="modal-overlay" @click.self="showJobModal = false">
          <div class="modal-content job-modal">
            <div class="modal-header">
              <h3>Select a Job</h3>
              <button class="modal-close" @click="showJobModal = false">&times;</button>
            </div>
            <div v-if="loadingJobs" class="modal-body loading">
              <Loader2 :size="40" class="spin" />
              <p>Loading jobs...</p>
            </div>
            <div v-else-if="jobsList.length === 0" class="modal-body empty">
              <p>No active jobs found.</p>
            </div>
            <div v-else class="modal-body">
              <div 
                v-for="job in jobsList" 
                :key="job.id" 
                class="job-option"
                @click="handleInviteWithJob(job.job_id || String(job.id))"
              >
                <div class="job-option-main">
                  <h4>{{ job.job_title || 'Untitled' }}</h4>
                  <div class="job-option-meta">
                    <span><MapPin :size="14" /> {{ job.job_location || 'N/A' }}</span>
                    <span><IndianRupee :size="14" /> {{ job.Salary_Range || 'N/A' }}</span>
                  </div>
                </div>
                <button class="btn-invite-job" :disabled="invitingWithJob">
                  <Loader2 v-if="invitingWithJob" :size="18" class="spin" />
                  <UserPlus v-else :size="18" />
                  Invite
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Toast -->
        <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.driver-invites-view {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Styling */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: translateX(-4px);
}

.title-group h1 {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.025em;
}

.title-group p {
  color: #64748b;
  margin: 0.25rem 0 0;
  font-size: 0.9375rem;
}

/* Tab Switcher */
.tab-controls {
  display: flex;
  background: #e2e8f0;
  padding: 0.375rem;
  border-radius: 14px;
  gap: 0.25rem;
}

.tab-btn {
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn.active {
  background: white;
  color: #1d4ed8;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.badge {
  background: #1d4ed8;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

/* Content Area */
.content-area {
  position: relative;
}

/* Search Bar */
.search-filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.btn-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-filter:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Filter Wrapper & Dropdown */
.filter-wrapper {
  position: relative;
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.25rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeSlideDown 0.2s ease-out;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-section label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.filter-section select {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
  outline: none;
  transition: all 0.2s;
  cursor: pointer;
}

.filter-section select:focus {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
}

.filter-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.btn-reset {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #f1f5f9;
  color: #475569;
}

.btn-apply {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  background: #1d4ed8;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply:hover {
  background: #1e40af;
}

.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.view-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
  gap: 0.25rem;
  border: 1px solid #e2e8f0;
}

.vt-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vt-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Drivers List (All Drivers tab) */
.drivers-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.drivers-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.drivers-list.list-view {
  grid-template-columns: 1fr;
}

.driver-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  gap: 1rem;
  display: flex;
  flex-direction: column;
}

.driver-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.driver-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  background: #eff6ff;
}

.driver-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.driver-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.driver-stats span {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.consent-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.consent-row a {
  color: #2563eb;
  text-decoration: underline;
}

.invite-err {
  color: #dc2626;
  font-size: 0.8125rem;
  margin: 0;
}

.btn-invite {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  border: none;
  background: #1d4ed8;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-invite:hover:not(:disabled) {
  background: #1e40af;
}

.btn-invite:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.btn-load-more {
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load-more:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-load-more:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.invite-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.btn-call {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  background: #22c55e;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-call:hover {
  background: #16a34a;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #475569;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
}

.modal-body.loading,
.modal-body.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #64748b;
}

.job-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
}

.job-option:last-child {
  border-bottom: none;
}

.job-option:hover {
  background: #f8fafc;
}

.job-option-main {
  flex: 1;
}

.job-option-main h4 {
  margin: 0 0 0.375rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
}

.job-option-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.job-option-meta span {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-invite-job {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  background: #1d4ed8;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-invite-job:hover:not(:disabled) {
  background: #1e40af;
}

.btn-invite-job:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: #0f172a;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  animation: toastIn 0.3s ease-out;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 24px;
  padding: 5rem 2rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}


.empty-state p {
  color: #64748b;
  max-width: 400px;
  margin-bottom: 0;
  line-height: 1.6;
}

.empty-logo.muted-grey {
  width: 120px;
  opacity: 0.4;
  filter: grayscale(1);
}

.muted-text {
  color: #94a3b8 !important;
  font-weight: 500 !important;
}

.empty-media {
  margin-bottom: 1.5rem;
}

/* Invites Grid / Cards */
.invites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 1.5rem;
}

/* Proper List View Styles */
.invites-grid.list-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

.invites-grid.list-view .invite-card {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  gap: 0;
  position: relative;
  overflow: hidden;
}

/* New Professional Layout - Stacked Design */
.invites-grid.list-view .invite-card {
  padding: 1.5rem;
  display: block; /* Change from flex row to stack */
}

.card-main-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* 1. Top Row: Identity (Left) & Status (Right) */
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.identity-corner {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.avatar-small {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-id-group h3 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  text-transform: uppercase;
  margin: 0;
}

.name-id-group .tm-id {
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 700;
}

/* 2. Middle Row: Stats in Single Line */
.stats-line {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid #f8fafc;
  border-bottom: 1px solid #f8fafc;
}

.inline-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.inline-stat strong {
  color: #334155;
}

.inline-stat svg {
  color: #94a3b8;
}

/* List View Specific Adaptations */
.invites-grid.list-view .invite-card {
  padding: 1.25rem 2rem;
}

.invites-grid.list-view .card-main-layout {
  flex-direction: row;
  align-items: center;
  gap: 2rem;
}

.invites-grid.list-view .top-row {
  width: 200px;
  flex-shrink: 0;
  flex-direction: column;
  border-right: 1px solid #f1f5f9;
  padding-right: 1.5rem;
  gap: 0.75rem;
}

.invites-grid.list-view .status-corner {
  order: -1; /* Status at top in list identity col */
}

.invites-grid.list-view .stats-line {
  flex: 1.2;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  border: none; /* No borders in list row context */
  padding: 0;
}

.invites-grid.list-view .job-center-row {
  flex: 2.5;
  border-left: 1px solid #f1f5f9;
  padding-left: 2rem;
}

.invites-grid.list-view .job-details-box {
  background: #f8fafc;
}

@media (min-width: 1200px) {
  .invites-grid.list-view .job-meta-grid {
    grid-template-columns: repeat(4, auto);
    column-gap: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .invites-grid.list-view .card-main-layout {
    flex-direction: column;
    align-items: stretch;
  }
  .invites-grid.list-view .top-row,
  .invites-grid.list-view .job-center-row {
    width: 100%;
    border: none;
    padding: 0;
  }
}

.invites-grid.list-view .job-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.invites-grid.list-view .job-header h4 {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #64748b;
  margin: 0;
}

.invites-grid.list-view .job-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.invites-grid.list-view .info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1.5rem;
}

.invites-grid.list-view .info-cell {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 600;
}

/* Removed 4. Actions Column */

@media (max-width: 1400px) {
  .invites-grid.list-view .job-col { flex: 2; }
  .invites-grid.list-view .stats-col { padding: 0 1.5rem; }
}

@media (max-width: 1200px) {
  .invites-grid.list-view .invite-card { flex-wrap: wrap; }
  .invites-grid.list-view .identity-col,
  .invites-grid.list-view .stats-col,
  .invites-grid.list-view .job-col,
  .invites-grid.list-view .actions-col {
    width: 100%;
    border: none;
    padding: 1rem 0;
    flex: none;
  }
}

@media (max-width: 1400px) {
  .invites-grid.list-view .invite-card {
    gap: 1rem;
    padding: 1.25rem;
  }
  .invites-grid.list-view .job-details-wrapper {
    flex: 1.5;
  }
}

@media (max-width: 1024px) {
  .invites-grid.list-view .invite-card {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Grid View Proper Styling */
.invites-grid:not(.list-view) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.invites-grid:not(.list-view) .invite-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.invites-grid:not(.list-view) .card-main-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
}

.invites-grid:not(.list-view) .stats-line {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.invites-grid:not(.list-view) .job-center-row {
  margin-top: auto;
}

.invites-grid:not(.list-view) .job-meta-grid {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.invites-grid:not(.list-view) .job-details-box {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 1rem 1.25rem;
}

/* Grid View Job Specifics (Vertical stack) */
.job-meta-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.625rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.meta-item label {
  color: #94a3b8;
  font-weight: 500;
}

.meta-item strong {
  color: #334155;
  font-weight: 700;
}

.meta-item.full-width {
  border-top: 1px dashed #e2e8f0;
  padding-top: 0.625rem;
  margin-top: 0.125rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.driver-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-box {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  background: #eff6ff;
  border: 2px solid #dbeafe;
}

.avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.driver-info h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.tm-id {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  margin-top: 0.25rem;
  display: inline-block;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

/* Driver Stats Grid */
.driver-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.stat-content label {
  display: block;
  font-size: 0.6875rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-content span {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

/* Job Details Section */
.job-details-wrapper {
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 1rem;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-left h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #475569;
}

.text-blue { color: #2563eb; }

.job-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
  margin: 0 0 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.info-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.info-cell.full {
  grid-column: 1 / -1;
}

.info-cell strong {
  color: #334155;
  margin-left: 2px;
}

/* Footer Actions */
.card-footer {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.btn-primary, .btn-primary-ghost, .btn-outline {
  flex: 1;
  padding: 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #1d4ed8;
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(29, 78, 216, 0.2);
}

.btn-primary:hover {
  background: #1e40af;
  transform: translateY(-2px);
}

.btn-outline {
  background: white;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-primary-ghost {
  background: #eff6ff;
  color: #1d4ed8;
  border: none;
}

.btn-primary-ghost:hover {
  background: #dbeafe;
}

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .invites-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .driver-invites-view {
    padding: 1rem;
  }
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }
  .tab-controls {
    width: 100%;
  }
  .tab-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
