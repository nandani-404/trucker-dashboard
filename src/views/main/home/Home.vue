<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Briefcase,
  Users,
  Car,
  MessageSquare,
  Clock,
  ChevronRight,
  GraduationCap,
  ShieldCheck
} from 'lucide-vue-next'
import { apiGet } from '../../../services/api'
import { END_POINTS, BASE_URL } from '../../../services/api'

const props = defineProps<{
  user: {
    name: string
    mobile: string
    role: string
    tm_id?: string
    unique_id?: string
    [key: string]: unknown
  }
}>()

const emit = defineEmits(['navigate'])

const profileData = ref<Record<string, unknown> | null>(null)
const banners = ref<{ media_url?: string; media_type?: string; redirect_link?: string }[]>([])
const bannerIndex = ref(0)

const isDriver = computed(() =>
  ['driver', 'foreman', 'association'].includes(String(props.user?.role || '').toLowerCase())
)

const displayName = computed(() =>
  (profileData.value?.name as string) || (profileData.value?.name_eng as string) || props.user?.name || 'User'
)

onMounted(async () => {
  try {
    const [profileRes, bannersRes] = await Promise.all([
      apiGet<{ status?: boolean; data?: Record<string, unknown> }>(END_POINTS.GET_PROFILE),
      apiGet<{ status?: boolean; data?: { media_url?: string; media_type?: string; redirect_link?: string }[] }>(END_POINTS.TRUCKMITRBANNERS),
    ])
    if (profileRes?.status && profileRes?.data) {
      profileData.value = profileRes.data
    }
    if (bannersRes?.status && Array.isArray(bannersRes?.data)) {
      const raw = bannersRes.data as { media_type?: string; media_url?: string; redirect_link?: string; user_type?: string }[]
      const imageBanners = raw.filter((b) => {
        if (b.media_type !== 'image') return false
        if (b.user_type === 'driver' && !isDriver.value) return false
        if (b.user_type === 'transporter' && isDriver.value) return false
        return !!(b.media_url || b.redirect_link)
      })
      if (imageBanners.length > 0) banners.value = imageBanners
    }
  } catch {
    // Use props.user as fallback
  }
})

const handleAction = (itemName: string) => {
  const map: Record<string, string> = {
    'Add Jobs': 'add-job',
    'View Jobs': 'view-jobs',
    'View Applications': 'view-applications',
    'Add Driver': 'add-driver',
    'Driver List': 'driver-list',
    'Get Your Driver Verified': 'verify-driver',
    'RC Check': 'rc-check',
    'Challan Check': 'challan-check',
    'Invite Driver for a Job': 'driver-invites',
    'Video Interview': 'video-interview',
    'TM Load Mandal': 'tm-load-mandal',
    'Fuel Discount': 'fuel-discount',
    'Transporter Tailored Loan': 'transporter-loan',
    'Truck Insurance': 'truck-insurance',
    'Second Hand Truck Marketplace': 'truck-marketplace',
    'All Available Jobs': 'view-jobs',
    'Applied Jobs': 'view-applications',
    'Jobs That Suit You': 'view-jobs',
    'Training Video': 'dashboard',
    'Health & Hygiene Video': 'dashboard',
    'Quiz Result & Certificate': 'dashboard',
    'Get ID Check': 'dashboard',
    'Get Court Check': 'dashboard',
    'Get Digital Address Check': 'dashboard',
    'Job Invite by Transporter': 'dashboard',
    'Call Job Manager': 'dashboard',
  }
  const view = map[itemName]
  if (view) emit('navigate', view)
}

const transporterSections = [
  {
    title: 'Jobs Management',
    icon: Briefcase,
    items: [
      { name: 'Add Jobs', desc: 'Create new job requirements.', image: 'https://cdn-icons-png.flaticon.com/512/11231/11231532.png' },
      { name: 'View Jobs', desc: 'Monitor active job listings.', image: 'https://cdn-icons-png.flaticon.com/512/2966/2966773.png' },
      { name: 'View Applications', desc: 'Review candidate profiles.', image: 'https://cdn-icons-png.flaticon.com/512/11651/11651437.png' },
    ],
  },
  {
    title: 'Driver Management',
    icon: Users,
    items: [
      { name: 'Add Driver', desc: 'Onboard new drivers.', image: 'https://cdn-icons-png.flaticon.com/512/6008/6008817.png' },
      { name: 'Driver List', desc: 'Access driver database.', image: 'https://cdn-icons-png.flaticon.com/512/6012/6012282.png' },
      { name: 'Get Your Driver Verified', desc: 'Fast document checks.', image: 'https://cdn-icons-png.flaticon.com/512/837/837732.png' },
    ],
  },
  {
    title: 'Vehicle Verification',
    icon: Car,
    items: [
      { name: 'RC Check', desc: 'Verify vehicle certificates.', image: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png' },
      { name: 'Challan Check', desc: 'Check traffic violations.', image: 'https://cdn-icons-png.flaticon.com/512/1584/1584961.png' },
    ],
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    items: [
      { name: 'Invite Driver for a Job', desc: 'Send job invitations.', image: 'https://cdn-icons-png.flaticon.com/512/6003/6003724.png' },
      { name: 'Video Interview', desc: 'Conduct virtual interviews.', image: 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png' },
    ],
  },
  {
    title: 'Coming Soon',
    icon: Clock,
    items: [
      { name: 'TM Load Mandal', desc: 'Find load matches.', image: 'https://cdn-icons-png.flaticon.com/512/2271/2271113.png' },
      { name: 'Fuel Discount', desc: 'Savings on fuel networks.', image: 'https://cdn-icons-png.flaticon.com/512/2311/2311324.png' },
      { name: 'Transporter Tailored Loan', desc: 'Solutions for transporters.', emoji: '💰' },
      { name: 'Truck Insurance', desc: 'Protect your fleet.', emoji: '🛡️' },
      { name: 'Second Hand Truck Marketplace', desc: 'Trade reliable vehicles.', emoji: '🚛' },
      { name: 'Fleet Management System', desc: 'Complete operational control.', emoji: '📊' },
    ],
  },
]

const driverSections = [
  {
    title: 'Jobs',
    icon: Briefcase,
    items: [
      { name: 'All Available Jobs', desc: 'Browse and apply for jobs.', image: 'https://cdn-icons-png.flaticon.com/512/3281/3281289.png' },
      { name: 'Applied Jobs', desc: 'Track your applications.', image: 'https://cdn-icons-png.flaticon.com/512/11651/11651437.png' },
      { name: 'Jobs That Suit You', desc: 'Personalized job matches.', image: 'https://cdn-icons-png.flaticon.com/512/2966/2966773.png' },
    ],
  },
  {
    title: 'Training & Certificate',
    icon: GraduationCap,
    items: [
      { name: 'Training Video', desc: 'Learn and grow.', image: 'https://cdn-icons-png.flaticon.com/512/11825/11825158.png' },
      { name: 'Health & Hygiene Video', desc: 'Stay safe on the road.', image: 'https://cdn-icons-png.flaticon.com/512/2382/2382461.png' },
      { name: 'Quiz Result & Certificate', desc: 'View your certificates.', image: 'https://cdn-icons-png.flaticon.com/512/9913/9913576.png' },
    ],
  },
  {
    title: 'Get Verified',
    icon: ShieldCheck,
    items: [
      { name: 'Get ID Check', desc: 'Verify your identity.', image: 'https://cdn-icons-png.flaticon.com/512/1077/1077063.png' },
      { name: 'Get Court Check', desc: 'Background verification.', image: 'https://cdn-icons-png.flaticon.com/512/4052/4052984.png' },
      { name: 'Get Digital Address Check', desc: 'Address verification.', image: 'https://cdn-icons-png.flaticon.com/512/3649/3649460.png' },
    ],
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    items: [
      { name: 'Job Invite by Transporter', desc: 'View job invitations.', image: 'https://cdn-icons-png.flaticon.com/512/6003/6003724.png' },
      { name: 'Call Job Manager', desc: 'Get support.', image: 'https://cdn-icons-png.flaticon.com/512/724/724664.png' },
    ],
  },
  {
    title: 'Vehicle Verification',
    icon: Car,
    items: [
      { name: 'RC Check', desc: 'Verify vehicle documents.', image: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png' },
      { name: 'Challan Check', desc: 'Check traffic challans.', image: 'https://cdn-icons-png.flaticon.com/512/1584/1584961.png' },
    ],
  },
  {
    title: 'Coming Soon',
    icon: Clock,
    items: [
      { name: 'TM Load Mandal', desc: 'Find load matches.', image: 'https://cdn-icons-png.flaticon.com/512/2271/2271113.png' },
      { name: 'Fuel Discount', desc: 'Save on fuel costs.', image: 'https://cdn-icons-png.flaticon.com/512/2311/2311324.png' },
      { name: 'Transporter Tailored Loan', desc: 'Growth for your business.', emoji: '💰' },
      { name: 'Truck Insurance', desc: 'Secure your fleet.', emoji: '🛡️' },
      { name: 'Driver Trip Wallet', desc: 'Manage trip earnings.', image: 'https://cdn-icons-png.flaticon.com/512/855/855279.png' },
      { name: 'TruckMitr Dhaba', desc: 'Food and rest stops.', image: 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png' },
      { name: 'TruckMitr Suvidha Kendra', desc: 'Support centers.', emoji: '🏢' },
      { name: 'TruckMitr Driver Loan', desc: 'Financial support.', image: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png' },
    ],
  },
]

const sections = computed(() => (isDriver.value ? driverSections : transporterSections))

const bannerImageUrl = computed(() => {
  const b = banners.value[bannerIndex.value]
  if (!b?.media_url) return ''
  return `${BASE_URL}public${b.media_url}`
})
</script>

<template>
  <div class="dashboard-body">
    <!-- Banner from API or fallback -->
    <section class="banner-section">
      <div v-if="bannerImageUrl" class="banner-image-wrapper">
        <img :src="bannerImageUrl" alt="Banner" class="banner-image" />
        <div class="banner-overlay" />
      </div>
      <div class="banner-content">
        <div class="banner-tag">{{ isDriver ? 'Driver Portal' : 'Enterprise HR Solution' }}</div>
        <h2 class="banner-title">
          {{ isDriver ? `Hi, ${displayName}` : 'Hiring Made Simple (2026)' }}
        </h2>
        <p class="banner-subtitle">
          {{ isDriver ? 'Find jobs, get verified, and grow your career.' : 'Precision driver management. No confusion. No guesswork.' }}
        </p>
        <button
          v-if="!isDriver"
          class="post-job-btn"
          @click="emit('navigate', 'add-job')"
        >
          Post a Job Now
        </button>
        <button
          v-else
          class="post-job-btn"
          @click="emit('navigate', 'view-jobs')"
        >
          Browse Jobs
        </button>
      </div>
      <div class="banner-graphics">
        <div class="geometric-shape shape-1" />
        <div class="geometric-shape shape-2" />
      </div>
    </section>

    <!-- Sections (web-style cards) -->
    <div class="sections-container">
      <section
        v-for="(section, index) in sections"
        :key="index"
        class="feature-category"
      >
        <div class="category-header">
          <div class="category-icon-wrapper">
            <component :is="section.icon" :size="20" color="#1e40af" />
          </div>
          <h3 class="category-title">{{ section.title }}</h3>
          <div class="category-line" />
        </div>

        <div class="grid-container">
          <div
            v-for="(item, i) in section.items"
            :key="i"
            class="feature-card"
            @click="handleAction(item.name)"
          >
            <div class="card-icon-wrapper">
              <img v-if="item.image" :src="item.image" class="card-img-icon" alt="icon" />
              <span v-else-if="item.emoji" class="card-emoji-icon">{{ item.emoji }}</span>
            </div>
            <div class="card-info">
              <h4 class="card-name">{{ item.name }}</h4>
              <p v-if="item.desc" class="card-desc">{{ item.desc }}</p>
              <p class="card-action">Manage <ChevronRight :size="12" class="arrow" /></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dashboard-body {
  padding: 32px 40px 48px;
  animation: fadeIn 0.4s ease-out;
  font-family: 'Inter', sans-serif;
}

.banner-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  border-radius: 28px;
  padding: 48px;
  color: #ffffff;
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(30,58,138,0.3);
}

.banner-image-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(30,58,138,0.85), rgba(15,23,42,0.9));
}

.banner-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.banner-tag {
  display: inline-block;
  background: rgba(255,255,255,0.1);
  color: #e0e7ff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.banner-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.banner-subtitle {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #bfdbfe;
  font-weight: 400;
}

.post-job-btn {
  background: #ffffff;
  color: #1e3a8a;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.post-job-btn:hover { background: #f1f5f9; }

.banner-graphics {
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 400px;
  z-index: 1;
  opacity: 0.2;
}

.geometric-shape {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
}

.shape-1 { width: 300px; height: 300px; right: -50px;  top: -100px;   }
.shape-2 { width: 200px; height: 200px; right: 150px;  bottom: -50px; }

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.feature-category {
  animation: slideUp 0.4s ease-out backwards;
}

.feature-category:nth-child(2) { animation-delay: 0.1s; }
.feature-category:nth-child(3) { animation-delay: 0.2s; }

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.category-icon-wrapper {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  width: 36px; height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.category-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.category-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
  margin-left: 16px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.feature-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.02);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
}

.feature-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 16px -4px rgba(0,0,0,0.06);
  transform: translateY(-2px);
  background: linear-gradient(to bottom right, #ffffff, #f8fafc);
}

.card-icon-wrapper {
  background: #f8fafc;
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02) inset;
  transition: transform 0.3s;
}

.card-img-icon {
  width: 24px; height: 24px;
  object-fit: contain;
}

.card-emoji-icon { font-size: 20px; }

.feature-card:hover .card-icon-wrapper {
  background: #eff6ff;
  border-color: #bfdbfe;
  transform: scale(1.05) rotate(2deg);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.card-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.card-desc {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.card-action {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
}

.arrow { margin-left: 2px; }

.feature-card:hover .card-action {
  opacity: 1;
  transform: translateX(0);
}
</style>
