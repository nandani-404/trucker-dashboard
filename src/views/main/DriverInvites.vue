<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ArrowLeft, Search, Filter, User, 
  MapPin, Briefcase, CreditCard, Truck, 
  IndianRupee, 
  Clock, AlertCircle,
  Settings, LayoutGrid, List
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

type TabType = 'all' | 'my-invites'
const activeTab = ref<TabType>('all')
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(false)

// Filter States
const filters = ref({
  state: '',
  vehicleType: '',
  experience: '',
  license: '',
  rating: ''
})

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

const vehicleTypes = ['Heavy Commercial', 'Trailer', 'Light Commercial', 'Container']
const experiences = ['0-1 Year', '1-5 Years', '5-10 Years', '10+ Years']
const licenseTypes = ['HMV', 'LMV', 'Trailer']
const ratings = ['1+', '2+', '3+', '4+', '5']

// Mock Data for "My Invites"
const myInvites = ref([
  {
    id: 1,
    name: 'JITENDER',
    tmId: 'TM2503HRDR00005',
    status: 'Pending',
    state: 'Haryana',
    experience: 'Not Available',
    license: 'Not Available',
    vehicleType: 'Not Available',
    avatar: '', // Empty to show fallback
    jobDetails: {
      id: 'TMJB00592',
      title: '₹18,000 सैलरी + ₹300 रोज़ का खाना + इंसेंटिव | HMV ड्राइवर चाहिए | 6 व्हीलर Tata Ultra 💰',
      location: 'Rajasthan',
      salary: '₹20000-25000',
      experienceReq: '1-5 Years',
      vehicleTypeReq: 'Heavy Commercial Vehicles',
      preferredSkills: 'Others'
    }
  },
  {
    id: 2,
    name: 'Deepak Arora',
    tmId: 'TM2503UPDR00003',
    status: 'Pending',
    state: 'Bihar',
    experience: '6-10 years',
    license: 'HMV',
    vehicleType: 'Trailer Trucks',
    avatar: 'https://i.pravatar.cc/150?img=12',
    jobDetails: {
      id: 'TMJB00593',
      title: 'HMV Driver for Long Route | Trailer Experience Preferred',
      location: 'Uttar Pradesh',
      salary: '₹25000-30000',
      experienceReq: '5+ Years',
      vehicleTypeReq: 'Trailer / Multi-axle',
      preferredSkills: 'Long Route, GPS Knowledge'
    }
  },
  {
    id: 3,
    name: 'Dilip Kumar',
    tmId: 'TM2511RJDR00812',
    status: 'Pending',
    state: 'Rajasthan',
    experience: '3-5 years',
    license: 'HMV',
    vehicleType: '12 Wheeler',
    avatar: 'https://i.pravatar.cc/150?img=13',
    jobDetails: {
      id: 'TMJB00412',
      title: '12 Wheeler Truck Driver Needed | Local Route',
      location: 'Gujarat',
      salary: '₹18000-22000',
      experienceReq: '2+ Years',
      vehicleTypeReq: '12 Wheeler',
      preferredSkills: 'Safe Driving'
    }
  },
  {
    id: 4,
    name: 'Arjun Singh',
    tmId: 'TM2509GJDR01290',
    status: 'Pending',
    state: 'Gujarat',
    experience: '4 years',
    license: 'HMV',
    vehicleType: 'Tractor Trailer',
    avatar: 'https://i.pravatar.cc/150?img=14',
    jobDetails: {
      id: 'TMJB00223',
      title: 'Tractor Trailer Driver for Interstate Transport',
      location: 'Maharashtra',
      salary: '₹28000-32000',
      experienceReq: '4+ Years',
      vehicleTypeReq: 'Tractor Trailer',
      preferredSkills: 'Route Knowledge'
    }
  },
  {
    id: 5,
    name: 'Ravi Prakash',
    tmId: 'TM2508MPDR00109',
    status: 'Pending',
    state: 'Madhya Pradesh',
    experience: '8 years',
    license: 'HMV',
    vehicleType: 'Heavy Vehicles',
    avatar: 'https://i.pravatar.cc/150?img=15',
    jobDetails: {
      id: 'TMJB00187',
      title: 'Heavy Vehicle Driver for Night Shifts',
      location: 'Punjab',
      salary: '₹22000-26000',
      experienceReq: '7+ Years',
      vehicleTypeReq: 'Heavy Vehicle',
      preferredSkills: 'Night Driving'
    }
  },
  {
    id: 6,
    name: 'Suresh Raina',
    tmId: 'TM2507UPDR00451',
    status: 'Pending',
    state: 'Uttar Pradesh',
    experience: '10+ years',
    license: 'HMV',
    vehicleType: 'Trailer Trucks',
    avatar: 'https://i.pravatar.cc/150?img=16',
    jobDetails: {
      id: 'TMJB00612',
      title: 'Expert Trailer Driver for Over-Dimensional Cargo',
      location: 'Haldia',
      salary: '₹35000-45000',
      experienceReq: '10+ Years',
      vehicleTypeReq: 'ODC Trailer',
      preferredSkills: 'ODC Experience'
    }
  }
])

const filteredInvites = computed(() => {
  if (!searchQuery.value) return myInvites.value
  const q = searchQuery.value.toLowerCase()
  return myInvites.value.filter(inv => 
    inv.name.toLowerCase().includes(q) || 
    inv.tmId.toLowerCase().includes(q) ||
    inv.jobDetails.id.toLowerCase().includes(q)
  )
})
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
                <input type="text" placeholder="Search Drivers (Name, TM ID, Phone)" />
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
                      <select v-model="filters.state">
                        <option value="">All States</option>
                        <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Vehicle Type</label>
                      <select v-model="filters.vehicleType">
                        <option value="">All Types</option>
                        <option v-for="v in vehicleTypes" :key="v" :value="v">{{ v }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Experience</label>
                      <select v-model="filters.experience">
                        <option value="">Any Experience</option>
                        <option v-for="e in experiences" :key="e" :value="e">{{ e }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>License</label>
                      <select v-model="filters.license">
                        <option value="">All Licenses</option>
                        <option v-for="l in licenseTypes" :key="l" :value="l">{{ l }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Rating</label>
                      <select v-model="filters.rating">
                        <option value="">All Ratings</option>
                        <option v-for="r in ratings" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                  </div>
                </div>

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

            <div class="empty-state">
              <div class="empty-media">
                <img src="/src/assets/logo/logotrick.png" alt="TruckMitr Logo" class="empty-logo muted-grey" />
              </div>
              <h3 class="muted-text">No drivers currently available</h3>
              <p class="muted-text">Please add a driver to view details.</p>
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
                  placeholder="Search in your invites..." 
                />
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
                      <select v-model="filters.state">
                        <option value="">All States</option>
                        <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Vehicle Type</label>
                      <select v-model="filters.vehicleType">
                        <option value="">All Types</option>
                        <option v-for="v in vehicleTypes" :key="v" :value="v">{{ v }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Experience</label>
                      <select v-model="filters.experience">
                        <option value="">Any Experience</option>
                        <option v-for="e in experiences" :key="e" :value="e">{{ e }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>License</label>
                      <select v-model="filters.license">
                        <option value="">All Licenses</option>
                        <option v-for="l in licenseTypes" :key="l" :value="l">{{ l }}</option>
                      </select>
                    </div>
                    <div class="filter-section">
                      <label>Rating</label>
                      <select v-model="filters.rating">
                        <option value="">All Ratings</option>
                        <option v-for="r in ratings" :key="r" :value="r">{{ r }}</option>
                      </select>
                    </div>
                  </div>
                </div>

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

            <div class="invites-grid" :class="{ 'list-view': viewMode === 'list' }">
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
                        <img v-if="invite.avatar" :src="invite.avatar" :alt="invite.name" />
                        <div v-else class="avatar-fallback">
                          <User :size="18" />
                        </div>
                      </div>
                      <div class="name-id-group">
                        <h3>{{ invite.name }}</h3>
                        <span class="tm-id">{{ invite.tmId }}</span>
                      </div>
                    </div>
                    <div class="status-corner">
                      <div class="status-badge" :class="invite.status.toLowerCase()">
                        <Clock :size="12" />
                        <span>{{ invite.status }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Middle Row: Stats in Single Line -->
                  <div class="stats-line">
                    <div class="inline-stat">
                      <MapPin :size="14" />
                      <span>State: <strong>{{ invite.state }}</strong></span>
                    </div>
                    <div class="inline-stat">
                      <Briefcase :size="14" />
                      <span>Exp: <strong>{{ invite.experience }}</strong></span>
                    </div>
                    <div class="inline-stat">
                      <CreditCard :size="14" />
                      <span>License: <strong>{{ invite.license }}</strong></span>
                    </div>
                    <div class="inline-stat">
                      <Truck :size="14" />
                      <span>Vehicle: <strong>{{ invite.vehicleType }}</strong></span>
                    </div>
                  </div>

                  <div class="job-center-row">
                    <div class="job-details-box">
                      <div class="job-header">
                        <Briefcase :size="16" class="text-blue" />
                        <span class="job-id-text">ID: {{ invite.jobDetails.id }}</span>
                      </div>
                      
                      <div class="job-body">
                        <h5 class="job-title">{{ invite.jobDetails.title }}</h5>
                        
                        <div class="job-meta-grid">
                          <div class="meta-item">
                            <MapPin :size="14" />
                            <label>Location:</label>
                            <strong>{{ invite.jobDetails.location }}</strong>
                          </div>
                          <div class="meta-item">
                            <IndianRupee :size="14" />
                            <label>Salary:</label>
                            <strong>{{ invite.jobDetails.salary }}</strong>
                          </div>
                          <div class="meta-item">
                            <Clock :size="14" />
                            <label>Experience:</label>
                            <strong>{{ invite.jobDetails.experienceReq }}</strong>
                          </div>
                          <div class="meta-item">
                            <Truck :size="14" />
                            <label>Vehicle:</label>
                            <strong>{{ invite.jobDetails.vehicleTypeReq }}</strong>
                          </div>
                          <div class="meta-item full-width">
                            <Settings :size="14" />
                            <label>Preferred Skills:</label>
                            <strong>{{ invite.jobDetails.preferredSkills }}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No results for search -->
              <div v-if="filteredInvites.length === 0" class="no-results">
                <AlertCircle :size="48" />
                <p>No invites found matching "{{ searchQuery }}"</p>
              </div>
            </div>
          </div>
        </transition>
      </main>
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
