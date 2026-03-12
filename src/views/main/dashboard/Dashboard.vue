<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  Briefcase,
  MessageSquare,
  LayoutDashboard,
  ArrowLeft,
  Loader2,
} from 'lucide-vue-next'
import { apiGet, END_POINTS } from '../../../services/config/api'

const props = defineProps<{
  user: {
    name: string;
    mobile: string;
    role: string;
    tm_id?: string;
    [key: string]: any;
  }
}>()

const emit = defineEmits(['back', 'navigate'])

const loading = ref(true)

/** Dashboard data from GET_PROFILE (total_jobs_posted, total_applications, etc.) */
const dashboard = ref<Record<string, number | undefined>>({})

/** API-fetched counts (override dashboard when available) */
const totalJobsPosted = ref<number | null>(null)
const totalApplicants = ref<number | null>(null)
const totalAddedDrivers = ref<number | null>(null)
const totalInvites = ref<number | null>(null)

const jobStats = computed(() => [
  {
    label: 'Total Job Posted',
    value: totalJobsPosted.value ?? dashboard.value?.total_jobs_posted ?? 0,
    image: 'https://cdn-icons-png.flaticon.com/512/594/594085.png',
    color: '#3b82f6',
    bg: '#eff6ff',
    navigateTo: 'view-jobs' as const,
  },
  {
    label: 'Total Applicants',
    value: totalApplicants.value ?? dashboard.value?.total_applications ?? 0,
    image: 'https://cdn-icons-png.flaticon.com/512/11651/11651437.png',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    navigateTo: 'view-applications' as const,
  },
  {
    label: 'Total Added Driver',
    value: totalAddedDrivers.value ?? dashboard.value?.total_added_drivers ?? 0,
    image: 'https://cdn-icons-png.flaticon.com/512/6008/6008817.png',
    color: '#10b981',
    bg: '#ecfdf5',
    navigateTo: 'driver-list' as const,
  },
])

const commStats = computed(() => [
  {
    label: 'Invite Driver for a Job',
    value: totalInvites.value ?? dashboard.value?.total_invites ?? 0,
    image: 'https://cdn-icons-png.flaticon.com/512/6003/6003724.png',
    color: '#f59e0b',
    bg: '#fffbeb',
    navigateTo: null as string | null,
  },
  {
    label: 'Video Interview Invitation',
    value: dashboard.value?.total_video_interviews ?? 0,
    image: 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png',
    color: '#ec4899',
    bg: '#fdf2f8',
    navigateTo: null as string | null,
  },
  {
    label: 'Call Job Manager',
    value: dashboard.value?.total_job_managers ?? 0,
    image: 'https://cdn-icons-png.flaticon.com/512/455/455705.png',
    color: '#3b82f6',
    bg: '#eff6ff',
    navigateTo: null as string | null,
  },
])

/** Fetch dashboard data from profile and individual APIs (matches main app dashboard/index.tsx) */
async function fetchDashboard() {
  loading.value = true
  try {
    // 1. GET_PROFILE may include dashboard object (matches main app Redux state.user.dashboard)
    const profileRes: any = await apiGet(END_POINTS.GET_PROFILE)
    const profileData = profileRes?.data?.data ?? profileRes?.data ?? profileRes
    const dash = profileData?.dashboard
    if (dash && typeof dash === 'object') {
      dashboard.value = {
        total_jobs_posted: dash.total_jobs_posted,
        total_applications: dash.total_applications,
        total_added_drivers: dash.total_added_drivers,
        total_invites: dash.total_invites,
        total_video_interviews: dash.total_video_interviews,
        total_job_managers: dash.total_job_managers,
      }
    }

    // 2. TRANSPORTER_ALL_JOBS - total jobs posted
    try {
      const jobsRes: any = await apiGet(END_POINTS.TRANSPORTER_ALL_JOBS(''))
      if (jobsRes?.status && Array.isArray(jobsRes?.data)) {
        totalJobsPosted.value = jobsRes.data.length
      }
    } catch {
      totalJobsPosted.value = 0
    }

    // 3. TRANSPORTER_APPLIED_JOBS_LIST - total applicants (pagination.total)
    try {
      const appliedRes: any = await apiGet(`${END_POINTS.TRANSPORTER_APPLIED_JOBS_LIST}?page=1`)
      const pagination = appliedRes?.pagination
      if (pagination && typeof pagination.total === 'number') {
        totalApplicants.value = pagination.total
      } else if (Array.isArray(appliedRes?.data)) {
        totalApplicants.value = appliedRes.data.length
      }
    } catch {
      totalApplicants.value = 0
    }

    // 4. TRANSPORTER_DRIVERS - total added drivers
    try {
      const driversRes: any = await apiGet(END_POINTS.TRANSPORTER_DRIVERS(''))
      if (driversRes?.status && Array.isArray(driversRes?.drivers)) {
        totalAddedDrivers.value = driversRes.drivers.length
      } else {
        totalAddedDrivers.value = 0
      }
    } catch {
      totalAddedDrivers.value = 0
    }

    // 5. TRANSPORTER_INVITES - total invites (accepted + pending + rejected)
    try {
      const invitesRes: any = await apiGet(END_POINTS.TRANSPORTER_INVITES)
      if (invitesRes?.status) {
        const accepted = invitesRes.accepted?.length ?? 0
        const pending = invitesRes.pending?.length ?? 0
        const rejected = invitesRes.rejected?.length ?? 0
        totalInvites.value = accepted + pending + rejected
      } else {
        totalInvites.value = 0
      }
    } catch {
      totalInvites.value = 0
    }
  } catch (err) {
    console.error('Dashboard fetch error:', err)
  } finally {
    loading.value = false
  }
}

function onStatClick(stat: { navigateTo?: string | null }) {
  if (stat.navigateTo) {
    emit('navigate', stat.navigateTo)
  }
}

onMounted(fetchDashboard)
</script>

<template>
  <!-- Only the scrollable stats body — layout shell is AppLayout in App.vue -->
  <div class="dash-body">

    <!-- Header Area -->
    <div class="dash-header-area">
      <button class="back-btn" @click="emit('back')" title="Back to Home">
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>

      <!-- Page Title Row -->
      <div class="page-title-row">
        <div class="page-title-icon">
          <LayoutDashboard :size="22" color="#1e40af" />
        </div>
        <div>
          <h2 class="page-title">Dashboard</h2>
          <p class="page-subtitle">Overview of your activity and stats</p>
        </div>
      </div>
    </div>


    <!-- Loading overlay for stats -->
    <div v-if="loading" class="stats-loading-overlay">
      <Loader2 class="spin" :size="36" />
      <span>Loading stats...</span>
    </div>

    <!-- Jobs Management Section -->
    <section v-show="!loading" class="stats-section">
      <div class="section-header">
        <div class="section-icon-wrap">
          <Briefcase :size="18" color="#1e40af" />
        </div>
        <h3 class="section-title">Jobs Management</h3>
      </div>

      <div class="stats-grid">
        <div
          v-for="(stat, i) in jobStats"
          :key="i"
          class="stat-card"
          :class="{ clickable: stat.navigateTo }"
          :style="{ '--card-accent': stat.color, '--card-bg': stat.bg }"
          @click="onStatClick(stat)"
        >
          <div class="stat-icon-wrap">
            <img :src="stat.image" class="stat-icon-img" :alt="stat.label" />
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Communication Section -->
    <section v-show="!loading" class="stats-section">
      <div class="section-header">
        <div class="section-icon-wrap">
          <MessageSquare :size="18" color="#1e40af" />
        </div>
        <h3 class="section-title">Communication</h3>
      </div>

      <div class="stats-grid">
        <div
          v-for="(stat, i) in commStats"
          :key="i"
          class="stat-card"
          :class="{ clickable: stat.navigateTo }"
          :style="{ '--card-accent': stat.color, '--card-bg': stat.bg }"
          @click="onStatClick(stat)"
        >
          <div class="stat-icon-wrap">
            <img :src="stat.image" class="stat-icon-img" :alt="stat.label" />
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Summary Banner -->
    <div class="summary-banner">
      <div class="summary-icon">
        <LayoutDashboard :size="28" color="#1e40af" />
      </div>
      <div class="summary-text">
        <p class="summary-heading">You're all set!</p>
        <p class="summary-sub">Start posting jobs and managing drivers to see stats here.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dash-body {
  padding: 32px 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: fadeSlideIn 0.4s ease-out;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}

/* Header Area */
.dash-header-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

/* Page title row */
.page-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  transform: translateX(-2px);
}

.page-title-icon {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 14px;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  margin: 0 0 2px 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}


/* Stats Sections */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon-wrap {
  width: 34px; height: 34px;
  background: #eff6ff;
  border-radius: 10px;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--card-accent, #3b82f6);
  border-radius: 16px 16px 0 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-color: var(--card-accent, #3b82f6);
}

.stat-card:hover::before { opacity: 1; }

.stat-icon-wrap {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: var(--card-bg, #eff6ff);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.stat-card:hover .stat-icon-wrap {
  transform: scale(1.1) rotate(4deg);
}

.stat-icon-img {
  width: 28px; height: 28px;
  object-fit: contain;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.4;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card:not(.clickable) {
  cursor: default;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 0.8s linear infinite;
}

.stats-loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  min-height: 120px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}


/* Summary Banner */
.summary-banner {
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 1px dashed #bfdbfe;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-icon {
  width: 52px; height: 52px;
  background: #ffffff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #bfdbfe;
  flex-shrink: 0;
}

.summary-text { flex: 1; }

.summary-heading {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.summary-sub {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}
</style>
