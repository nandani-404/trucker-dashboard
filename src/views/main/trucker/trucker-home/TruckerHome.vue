<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Search,
  Truck,
  Star as StarIcon,
  ChevronRight,
  ChevronLeft,
  Package,
  MapPin,
  Zap,
  BarChart2,
  Calendar,
  CheckSquare,
  UserPlus,
  Clock,
  CreditCard,
  Wallet,
  Building
} from 'lucide-vue-next'
import { END_POINTS, apiGet } from '../../../../services/config/api'
import mumbaiMap from '../../../../assets/images/mumbai_city_map.png'

const props = defineProps<{
  user: any
}>()

const emit = defineEmits(['navigate'])

// --- Dashboard Data ---
const dashboardData = ref({
  availableLoads: 'Search Now',
  loadsGrowth: '+12%',
  myLoads: 12,
  vehicleCount: 3,
  pendingEarnings: 0,
  thisMonthEarnings: 0,
  totalEarnings: 2000,
  rating: 4.9,
  revenue: '1,45,000',
  revenueGrowth: '+8%',
  ratingGrowth: '+2%'
})

const isAvailable = ref(true)

// --- Accepted Bids ---
const acceptedBids = ref<any[]>([])
const activeTrip = ref<any>(null)

const safeString = (val: any) => {
  if (val === null || val === undefined) return 'N/A'
  if (typeof val === 'object') return val.length_label || val.name || val.label || 'N/A'
  return String(val)
}

const quickActions = [
  { label: 'My Loads', sub: 'Manage shipments', icon: Package, view: 'my-loads', iconColor: '#2563eb', bgColor: '#eff6ff' },
  { label: 'Payments', sub: 'Track earnings', icon: CreditCard, view: 'earnings', iconColor: '#10b981', bgColor: '#ecfdf5' },
  { label: 'My Vehicles', sub: 'Fleet management', icon: Truck, view: 'my-vehicles', iconColor: '#f59e0b', bgColor: '#fffbeb' },
  { label: 'Add Driver', sub: 'Scale your team', icon: UserPlus, view: 'add-driver', iconColor: '#8b5cf6', bgColor: '#f5f3ff' },
  { label: 'Add Bank', sub: 'Manage payouts', icon: Building, view: 'bank-detail', iconColor: '#ef4444', bgColor: '#fef2f2' },
]

const handleAction = (view: string) => {
  emit('navigate', view)
}

const getStatusPriority = (statusLabel: string | null): number => {
  const statusMap: { [key: string]: number } = {
    'Load Accepted': 0,
    'Vehicle Assigned': 1,
    'Reached Pickup': 2,
    'Loaded': 3,
    'In Transit': 4,
    'Reached Destination': 5,
    'Delivered': 6,
  }
  return statusMap[statusLabel || ''] ?? 999
}

const fetchDashboardData = async () => {
  try {
    const [statsRes, appliedRes] = await Promise.allSettled([
      apiGet(END_POINTS.TRUCKER_DASHBOARD_STATS),
      apiGet(END_POINTS.TRUCKER_APPLIED_LOADS)
    ])

    let payloadStats: any = {}
    let payloadPayments: any = {}
    let currentActiveTrip = null

    if (statsRes.status === 'fulfilled') {
      const data: any = statsRes.value
      if (data?.data) {
        payloadStats = data.data.stats || {}
        payloadPayments = data.data.payment_details || {}
      } else if (data?.stats) {
        payloadStats = data.stats || {}
        payloadPayments = data.payment_details || {}
      }
    }

    if (appliedRes.status === 'fulfilled') {
      const resp: any = appliedRes.value
      const list = resp?.data?.data || resp?.data || []
      
      // Count active trips (status '1')
      const active = list.filter((l: any) => String(l.status) === '1')
      if (active.length > 0) {
        const trip = active[0]
        currentActiveTrip = {
          id: trip.load_id || trip.id,
          origin: trip.origin_location?.split(',')[0] || 'N/A',
          destination: trip.destination_location?.split(',')[0] || 'N/A',
          status: 'In Transit',
          progress: 0.4, // Default progress for UI
          shipper: trip.user?.name || trip.shipper_name || 'Unknown Shipper',
          material: safeString(trip.meterial),
          eta: 'In Progress',
        }
      }

      // Get accepted bids and sort by status priority
      const accepted = list.filter((l: any) => l.shipper_status === 'accepted')
      const sortedAccepted = accepted.sort((a: any, b: any) => {
        const priorityA = getStatusPriority(a.current_status_label)
        const priorityB = getStatusPriority(b.current_status_label)
        return priorityA - priorityB
      })
      
      if (sortedAccepted.length > 0) {
        acceptedBids.value = sortedAccepted.map((trip: any) => ({
          id: trip.load_id || trip.id,
          origin: trip.origin_location?.split(',')[0] || 'N/A',
          destination: trip.destination_location?.split(',')[0] || 'N/A',
          status: trip.current_status_label || 'Accepted',
          price: trip.trucker_updated_price || trip.trucker_price || 0,
          receivedPrice: trip.trucker_received_amount || (trip.trucker_updated_price || trip.trucker_price || 0) * 0.95,
        }))
      }
    }

    activeTrip.value = currentActiveTrip
    dashboardData.value = {
      ...dashboardData.value,
      availableLoads: payloadStats.available_loads ?? 'Search Now',
      myLoads: payloadStats.my_loads ?? 0,
      vehicleCount: payloadStats.my_vehicles ?? 0,
      pendingEarnings: payloadPayments.pending_payment ?? 0,
      thisMonthEarnings: payloadPayments.this_month_earning ?? 0,
      totalEarnings: payloadPayments.total_earning ?? 0,
      rating: payloadStats.rating ?? props.user?.driver_rating ?? 4.9,
      revenue: payloadPayments.this_month_earning ? payloadPayments.this_month_earning.toLocaleString('en-IN') : '0'
    }
  } catch (error) {
    console.error('Error fetching dashboard data', error)
  }
}

// --- Carousel Logic ---
const carouselRef = ref<HTMLElement | null>(null)
const activeSlideIndex = ref(0)

const scrollCarousel = (direction: 'next' | 'prev') => {
  if (!carouselRef.value) return
  const container = carouselRef.value
  const gap = 16
  const cardWidth = container.offsetWidth + gap
  const scrollAmount = direction === 'next' ? cardWidth : -cardWidth
  
  container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
}

const handleScroll = (e: Event) => {
  const container = e.target as HTMLElement
  const gap = 16
  const cardWidth = container.offsetWidth + gap
  activeSlideIndex.value = Math.round(container.scrollLeft / cardWidth)
}

const goToSlide = (index: number) => {
  if (!carouselRef.value) return
  const container = carouselRef.value
  const gap = 16
  const cardWidth = container.offsetWidth + gap
  container.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="trucker-home">
    <!-- Premium Operations Banner -->
    <!-- Premium Operations Grid -->
    <div class="premium-header-grid">
      <!-- Find Load Card -->
      <div class="header-action-card find-load-card">
        <div class="card-glass-shape"></div>
        <div class="card-content-wrap">
          <div class="header-icon-circle blue-glow">
            <Search :size="22" stroke-width="2.5" />
          </div>
          <div class="header-text-group">
            <span class="header-title">Find Load</span>
            <span class="header-subtitle">Discover best routes & loads</span>
          </div>
        </div>
        <button class="btn-primary-white" @click="handleAction('view-jobs')">
          Search Now
        </button>
      </div>

      <!-- Availability Card -->
      <div class="header-action-card availability-card" :class="{ 'is-offline': !isAvailable }">
        <div class="card-glass-shape alt-shape"></div>
        <div class="card-content-wrap">
          <div class="header-icon-circle" :class="isAvailable ? 'green-glow' : 'gray-glow'">
            <Zap :size="22" stroke-width="2.5" />
          </div>
          <div class="header-text-group">
            <span class="header-title">{{ isAvailable ? 'Available for Loads' : 'Off Duty' }}</span>
            <span class="header-subtitle">{{ isAvailable ? 'You are visible to shippers' : 'Toggle to go online' }}</span>
          </div>
        </div>
        <button class="modern-switch-pro" :class="{ on: isAvailable }" @click="isAvailable = !isAvailable">
          <span class="switch-handle"></span>
        </button>
      </div>

      <!-- My Fleet Card -->
      <div class="header-action-card fleet-card">
        <div class="card-glass-shape fleet-shape"></div>
        <div class="card-content-wrap">
          <div class="header-icon-circle amber-glow">
            <Truck :size="22" stroke-width="2.5" />
          </div>
          <div class="header-text-group">
            <span class="header-title">My Fleet</span>
            <span class="header-subtitle">Your added trucks</span>
          </div>
        </div>
        <button class="btn-primary-white color-amber-dark" @click="handleAction('my-vehicles')">
          Manage Fleet
        </button>
      </div>
    </div>

    <!-- Earning Overview -->
    <div class="earning-section">
      <div class="earning-header-row">
        <div class="heading-with-icon">
          <BarChart2 :size="18" class="color-blue" />
          <h3 class="section-heading">Earning Overview</h3>
        </div>
        <button class="view-all-btn" @click="handleAction('earnings')">View All</button>
      </div>
      <div class="earning-overview">
        <div class="earning-card">
          <div class="earning-card-top">
            <div class="earning-icon bg-emerald-subtle">
              <Wallet :size="18" class="color-emerald" />
            </div>
            <span class="earning-trend positive">+12%</span>
          </div>
          <p class="earning-label">Total Payment</p>
          <h3 class="earning-value">₹{{ dashboardData.revenue }}</h3>
        </div>

        <div class="earning-card">
          <div class="earning-card-top">
            <div class="earning-icon bg-indigo-subtle">
              <Calendar :size="18" class="color-indigo" />
            </div>
            <span class="earning-trend positive">+8%</span>
          </div>
          <p class="earning-label">This Month</p>
          <h3 class="earning-value">₹{{ dashboardData.revenue }}</h3>
        </div>

        <div class="earning-card">
          <div class="earning-card-top">
            <div class="earning-icon bg-amber-subtle">
              <Clock :size="18" class="color-amber" />
            </div>
            <span class="earning-trend neutral">Pending</span>
          </div>
          <p class="earning-label">Pending</p>
          <h3 class="earning-value">₹24,500</h3>
        </div>

        <div class="earning-card">
          <div class="earning-card-top">
            <div class="earning-icon bg-rose-subtle">
              <StarIcon :size="18" class="color-rose" />
            </div>
            <span class="earning-trend positive">{{ dashboardData.ratingGrowth }}</span>
          </div>
          <p class="earning-label">Rating</p>
          <h3 class="earning-value">{{ dashboardData.rating }} / 5.0</h3>
        </div>
      </div>
    </div>

    <!-- Main Content Layout (Left & Right Column) -->
    <div class="main-layout">
      <div class="content-left">
        <!-- Active Trip Card -->
        <div class="section-container" v-if="activeTrip">
          <div class="section-header">
            <div class="header-title">
              <MapPin :size="20" class="color-blue" />
              <h3>Active Trip</h3>
            </div>
            <button class="view-all-btn" @click="handleAction(`active-trip/${activeTrip.id}`)">View Details</button>
          </div>
          <div class="active-trip-card">
            <div class="trip-header">
              <div class="trip-id-wrap">
                <span class="trip-label">LOAD ID</span>
                <h4 class="trip-id">{{ activeTrip.id }}</h4>
              </div>
              <div class="active-status-pill">
                <div class="pulse-dot"></div>
                <span>{{ activeTrip.status }}</span>
              </div>
            </div>
            
            <div class="trip-route-viz">
              <div class="route-city-group">
                <div class="city-dot-outer origin"><div class="city-dot-inner"></div></div>
                <span class="city-name">{{ activeTrip.origin }}</span>
              </div>
              <div class="route-progress-track">
                <div class="track-line"></div>
                <div class="track-fill" :style="{ width: (activeTrip.progress * 100) + '%' }"></div>
                <div class="truck-marker" :style="{ left: (activeTrip.progress * 100) + '%' }">
                  <Truck :size="14" fill="#2563eb" color="white" />
                </div>
              </div>
              <div class="route-city-group">
                <div class="city-dot-outer destination"><div class="city-dot-inner"></div></div>
                <span class="city-name">{{ activeTrip.destination }}</span>
              </div>
            </div>

            <div class="trip-meta-grid">
              <div class="meta-item">
                <span class="meta-label">Shipper</span>
                <span class="meta-value">{{ activeTrip.shipper }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Material</span>
                <span class="meta-value">{{ activeTrip.material }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">ETA</span>
                <span class="meta-value">{{ activeTrip.eta }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Accepted Bids Section -->
        <div class="section-container">
          <div class="section-header">
            <div class="header-title">
              <CheckSquare :size="20" class="color-blue" fill="#2563eb" color="white" />
              <h3>Accepted Bids</h3>
            </div>
            <button class="view-all-btn" @click="handleAction('my-loads')">View All</button>
          </div>
          
          <div class="carousel-container">
            <!-- Navigation Buttons -->
            <button class="nav-arrow prev" @click="scrollCarousel('prev')" v-show="activeSlideIndex > 0">
              <ChevronLeft :size="20" />
            </button>
            <button class="nav-arrow next" @click="scrollCarousel('next')" v-show="activeSlideIndex < acceptedBids.length - 1">
              <ChevronRight :size="20" />
            </button>

            <!-- Swipeable Area -->
            <div class="carousel-wrapper" ref="carouselRef" @scroll="handleScroll">
              <div class="bid-card-slide" v-for="bid in acceptedBids" :key="bid.id">
                <div class="bid-card">
                  <div class="bid-map" :style="{ backgroundImage: `url(${mumbaiMap})` }">
                    <span class="map-tag">ACCEPTED</span>
                  </div>
                  
                  <div class="bid-details">
                    <div class="bid-top">
                      <h4>Load ID: {{ bid.id }}</h4>
                      <span class="status-tag">{{ bid.status }}</span>
                    </div>
                    
                    <div class="bid-route-vertical">
                      <div class="route-step">
                        <div class="step-dot blue"></div>
                        <div class="step-info">
                          <span class="step-label">Pickup Location</span>
                          <span class="step-value">{{ bid.origin }}</span>
                        </div>
                      </div>
                      <div class="route-line"></div>
                      <div class="route-step">
                        <div class="step-dot red"></div>
                        <div class="step-info">
                          <span class="step-label">Delivery Location</span>
                          <span class="step-value">{{ bid.destination }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="price-info-container">
                      <div class="price-col">
                        <p class="price-header">Offered Price</p>
                        <h4 class="price-amt">₹{{ bid.price.toLocaleString('en-IN') }}</h4>
                      </div>
                      <div class="price-divider"></div>
                      <div class="price-col">
                        <p class="price-header">Received Price</p>
                        <h4 class="price-amt color-green">₹{{ bid.receivedPrice.toLocaleString('en-IN') }}</h4>
                      </div>
                    </div>
                    
                    <button class="action-btn-blue" @click="handleAction(`active-trip/${bid.id}`)">
                      <MapPin :size="16" /> Mark Reached Pickup
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Indicators -->
            <div class="carousel-indicators" v-if="acceptedBids.length > 1">
              <span 
                v-for="(_, i) in acceptedBids" 
                :key="i" 
                class="dot" 
                :class="{ active: i === activeSlideIndex }"
                @click="goToSlide(i)"
              ></span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div class="section-container">
          <div class="section-header">
            <div class="header-title">
              <Zap :size="20" class="color-blue" fill="#2563eb" color="white" />
              <h3>Quick Actions</h3>
            </div>
          </div>
          
          <div class="quick-actions-grid-clean">
            <div v-for="action in quickActions" :key="action.label" class="action-card-clean" @click="handleAction(action.view)">
              <div class="action-icon-wrapper" :style="{ backgroundColor: action.bgColor }">
                <component :is="action.icon" :size="20" :style="{ color: action.iconColor }" />
              </div>
              <div class="action-details-clean">
                <p class="action-name-clean">{{ action.label }}</p>
                <p class="action-desc-clean">{{ action.sub }}</p>
              </div>
              <div class="action-arrow-clean">
                <ChevronRight :size="16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column (Empty for now or removed) -->
      <!-- <div class="content-right">
      </div> -->
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.trucker-home {
  padding: 32px;
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Colors & Utility */
.color-blue { color: #2563eb; }
.color-blue-dark { color: #1e40af; }
.color-gray { color: #64748b; }
.color-dark { color: #0f172a; }

.color-emerald { color: #10b981; }
.color-indigo { color: #6366f1; }
.color-amber { color: #f59e0b; }
.color-rose { color: #f43f5e; }

.bg-blue { background-color: #eff6ff; }
.bg-blue-light { background-color: #e0e7ff; }
.bg-blue-subtle { background-color: #f8fafc; }

.bg-emerald-subtle { background-color: #ecfdf5; }
.bg-indigo-subtle { background-color: #eef2ff; }
.bg-amber-subtle { background-color: #fffbeb; }
.bg-rose-subtle { background-color: #fff1f2; }

/* Premium Modular Header Grid */
.premium-header-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 48px;
}

.header-action-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
}

.header-action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.find-load-card {
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
}

.availability-card {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.2);
}

.availability-card.is-offline {
  background: linear-gradient(135deg, #475569 0%, #64748b 100%);
  box-shadow: 0 6px 20px rgba(100, 116, 139, 0.2);
}

.fleet-card {
  background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.2);
}

.color-amber-dark { color: #b45309 !important; }
.blue-glow { box-shadow: 0 0 15px rgba(37, 99, 235, 0.3); }
.green-glow { box-shadow: 0 0 15px rgba(16, 185, 129, 0.3); }
.amber-glow { box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }
.gray-glow { box-shadow: 0 0 15px rgba(100, 116, 139, 0.3); }

.card-glass-shape.fleet-shape {
  top: -30px;
  left: -20px;
  width: 140px;
  height: 140px;
}

.card-glass-shape {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
  filter: blur(8px);
}

.card-glass-shape.alt-shape {
  top: auto;
  bottom: -30px;
  right: 20%;
  width: 150px;
  height: 150px;
}

.card-content-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.header-icon-circle {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.header-text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.btn-primary-white {
  background: white;
  color: #1d4ed8;
  border: none;
  padding: 10px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary-white:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  color: #1e40af;
}

.modern-switch-pro {
  width: 56px;
  height: 30px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  z-index: 2;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.modern-switch-pro.on {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.7);
}

.modern-switch-pro .switch-handle {
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.modern-switch-pro.on .switch-handle {
  transform: translateX(26px);
}

@media (max-width: 1024px) {
  .premium-header-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .header-action-card {
    padding: 16px;
  }
  .card-content-wrap { gap: 12px; }
  .header-title { font-size: 14px; }
  .header-subtitle { font-size: 11px; }
  .btn-primary-white { padding: 9px 18px; font-size: 13px; }
}

/* Earning Overview Grid */
.earning-section {
  margin-bottom: 48px;
}

.section-heading {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.heading-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.earning-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.earning-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.earning-card {
  background: white;
  border-radius: 12px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s;
}

.earning-card:hover {
  transform: translateY(-2px);
}

.earning-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.earning-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.earning-trend {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.earning-trend.positive {
  background: #dcfce7;
  color: #16a34a;
}

.earning-trend.neutral {
  background: #fef3c7;
  color: #d97706;
}

.earning-label {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.earning-value {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* Section Shared */
.section-container {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.view-all-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.view-all-btn:hover { text-decoration: underline; }

/* Carousel Styles */
.carousel-container {
  position: relative;
  width: 100%;
}

.carousel-wrapper {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  gap: 16px;
  padding: 12px 0 20px 0;
  margin: 0 -4px;
}

/* Hide scrollbar */
.carousel-wrapper::-webkit-scrollbar {
  display: none;
}
.carousel-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.bid-card-slide {
  flex: 0 0 98%;
  scroll-snap-align: center;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-arrow:hover {
  background: #f8fafc;
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow.prev { left: -16px; }
.nav-arrow.next { right: -16px; }

@media (max-width: 768px) {
  .nav-arrow.prev { left: 4px; }
  .nav-arrow.next { right: 4px; }
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.carousel-indicators .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  cursor: pointer;
  transition: all 0.3s;
}

.carousel-indicators .dot.active {
  background: #2563eb;
  width: 24px;
  border-radius: 4px;
}

/* Bid Card */
.bid-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  display: flex;
  overflow: hidden;
  transition: transform 0.2s;
}

.bid-card:hover {
  transform: translateY(-2px);
}

.bid-map {
  width: 260px;
  background-color: #f8fafc;
  background-size: cover;
  background-position: center;
  position: relative;
  border-right: 1px solid #f1f5f9;
}

.map-tag {
  position: absolute;
  top: 16px; left: 16px;
  background: #2563eb;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
}

.bid-details {
  padding: 12px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bid-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.bid-top h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.status-tag {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Vertical Route */
.bid-route-vertical {
  display: flex;
  flex-direction: column;
  gap: 0px;
  margin-bottom: 12px;
  position: relative;
  padding-left: 2px;
}

.route-step {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
  z-index: 1;
}

.step-dot.blue { background-color: #2563eb; }
.step-dot.red { background-color: #ef4444; }

.route-line {
  width: 2px;
  height: 12px;
  background: #e2e8f0;
  margin-left: 3px;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-label {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.step-value {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

/* Price Container */
.price-info-container {
  display: flex;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  padding: 8px 14px;
  margin-bottom: 12px;
  justify-content: space-between;
  align-items: center;
}

.price-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-header {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.price-amt {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.price-amt.color-green {
  color: #10b981;
}

.price-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
}

.action-btn-blue {
  margin-top: auto;
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn-blue.btn-large {
  padding: 10px 24px;
  font-size: 14px;
  border-radius: 8px;
}

/* Professional Clean Grid Quick Actions */
.quick-actions-grid-clean {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-card-clean {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.action-card-clean:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
}

.action-icon-wrapper {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.action-card-clean:hover .action-icon-wrapper {
  transform: scale(1.1);
}

.action-details-clean {
  flex: 1;
}

.action-name-clean {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.action-desc-clean {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
}

.action-arrow-clean {
  color: #cbd5e1;
  transition: all 0.2s;
  opacity: 0;
  transform: translateX(-8px);
}

.action-card-clean:hover .action-arrow-clean {
  opacity: 1;
  transform: translateX(0);
  color: #2563eb;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .quick-actions-grid-clean { grid-template-columns: repeat(2, 1fr); }
  .earning-overview { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .premium-header { flex-direction: column; }
  .header-right { border-left: none; border-top: 1px solid rgba(255,255,255,0.12); }
  .earning-overview { grid-template-columns: 1fr; }
  .quick-actions-grid-clean { grid-template-columns: 1fr; }
  .bid-card { flex-direction: column; }
  .bid-map { width: 100%; height: 160px; }
}

.active-trip-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.trip-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.trip-id {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 !important;
}

.active-status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  color: #2563eb;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #2563eb;
  border-radius: 50%;
  position: relative;
}

.pulse-dot::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: inherit;
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.7); opacity: 0.8; }
  70% { transform: scale(2.5); opacity: 0; }
  100% { transform: scale(2.5); opacity: 0; }
}

.trip-route-viz {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 0 10px;
}

.route-city-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 80px;
}

.city-dot-outer {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.city-dot-outer.origin { border: 2px solid #2563eb; background: white; }
.city-dot-outer.destination { border: 2px solid #94a3b8; background: white; }

.city-dot-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.city-dot-outer.origin .city-dot-inner { background: #2563eb; }
.city-dot-outer.destination .city-dot-inner { background: #94a3b8; }

.city-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.route-progress-track {
  flex: 1;
  position: relative;
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
}

.track-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #2563eb;
  border-radius: 2px;
}

.truck-marker {
  position: absolute;
  top: 50%;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  border: 4px solid #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transform: translate(-50%, -50%);
  z-index: 2;
}

.trip-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
</style>
