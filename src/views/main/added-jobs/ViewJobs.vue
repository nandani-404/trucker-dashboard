<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  ArrowLeft,
  ClipboardList,
  Search,
  IndianRupee,
  MapPin,
  Users,
  CalendarDays,
  UserPlus,
  Plus,
  LayoutGrid,
  List,
  Loader2,
} from 'lucide-vue-next'
import { apiGet, apiPostForm, END_POINTS } from '../../../services/config/api'
import { useJobStore } from '../../../stores/job'
import { useUserStore } from '../../../stores/user'
import { useAppStore } from '../../../stores/app'
import type { ApiJob } from '../../../stores/job'

const emit = defineEmits(['back', 'navigate'])

const jobStore = useJobStore()
const userStore = useUserStore()
const appStore = useAppStore()

const jobs = ref<ApiJob[]>([])
const locations = ref<{ id?: number; name?: string }[]>([])
const loading = ref(true)
const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('list')
const togglingId = ref<string | null>(null)

/** Fetch jobs from API */
async function fetchJobs(searchTerm: string = '') {
  try {
    loading.value = true
    const res: any = await apiGet(END_POINTS.TRANSPORTER_ALL_JOBS(searchTerm))
    if (res?.status && Array.isArray(res?.data)) {
      jobs.value = res.data
    } else {
      jobs.value = []
    }
  } catch (err) {
    console.error('Error fetching jobs:', err)
    jobs.value = []
  } finally {
    loading.value = false
  }
}

/** Fetch locations (states) for display */
async function fetchLocations() {
  try {
    const res: any = await apiGet(END_POINTS.GETSTATES)
    if (res?.status && Array.isArray(res?.data)) {
      locations.value = res.data
    }
  } catch (err) {
    console.error('Error fetching locations:', err)
  }
}

/** Resolve location name from id or string */
function getLocationName(item: ApiJob): string {
  const loc = item?.job_location
  if (!loc) return ''
  const found = locations.value.find(
    (s) =>
      s.name?.toLowerCase() === String(loc).toLowerCase() ||
      s.id === Number(loc)
  )
  return found?.name || String(loc)
}

/** Format expiry date */
function formatExpiry(item: ApiJob): string {
  const d = item?.Application_Deadline || item?.application_deadline
  if (!d) return 'N/A'
  try {
    const m = new Date(d)
    if (!isNaN(m.getTime())) {
      return m.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  } catch {}
  return String(d)
}

/** Format created date */
function formatDate(item: ApiJob): string {
  const d = item?.Created_at
  if (!d) return ''
  try {
    const m = new Date(d)
    if (!isNaN(m.getTime())) {
      return m.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  } catch {}
  return String(d)
}

/** Job is active (1) or inactive (0) */
function isActive(item: ApiJob): boolean {
  return Number(item?.active_inactive) === 1
}

/** Job is approved (1) or pending (0) */
function isApproved(item: ApiJob): boolean {
  return Number(item?.status) === 1
}

/** Subscription badge type */
function getSubscriptionType(item: ApiJob): string {
  const plan = item?.subscription_plan_name
  if (plan === 'premium_job') return 'PREMIUM'
  if (plan === 'super_premium_job') return 'SUPER PREMIUM'
  return 'STANDARD'
}

const filteredJobs = computed(() => {
  if (!searchQuery.value.trim()) return jobs.value
  const q = searchQuery.value.toLowerCase()
  return jobs.value.filter(
    (j) =>
      (j.job_title || '').toLowerCase().includes(q) ||
      (j.job_id || '').toLowerCase().includes(q) ||
      getLocationName(j).toLowerCase().includes(q)
  )
})

/** Toggle job active/inactive */
async function toggleJob(item: ApiJob) {
  const jid = String(item?.job_id ?? item?.id ?? '')
  if (!jid) return
  togglingId.value = jid
  try {
    const fd = new FormData()
    fd.append('job_id', jid)
    const res: any = await apiPostForm(END_POINTS.JOB_UPDATE_STATUS, fd)
    if (res?.status && res?.data?.active_inactive !== undefined) {
      const idx = jobs.value.findIndex((j) => String(j?.job_id ?? j?.id) === jid)
      if (idx >= 0) {
        jobs.value = [...jobs.value]
        jobs.value[idx] = { ...jobs.value[idx], active_inactive: Number(res.data.active_inactive) }
      }
    }
  } catch (err) {
    console.error('Toggle job error:', err)
  } finally {
    togglingId.value = null
  }
}

/** Invite drivers */
function handleInvite(item: ApiJob) {
  if (userStore.showSubscriptionModel && userStore.isTransporter) {
    if (!appStore.showSubscriptionModal) {
      appStore.setShowSubscriptionModal(true)
    }
    return
  }
  const jid = String(item?.job_id ?? item?.id ?? '')
  if (jid) {
    jobStore.setInviteJobId(jid)
  }
  emit('navigate', 'driver-list')
}

/** Add job FAB - parent handleNavigate handles subscription check */
function handleAddJob() {
  jobStore.clearAll()
  emit('navigate', 'add-job')
}

/** Show invite button only when approved and active */
const canInvite = (item: ApiJob) => isApproved(item) && isActive(item)

/** Debounced search */
watch(searchQuery, (val) => {
  if (!val.trim()) {
    fetchJobs('')
    return
  }
  const t = setTimeout(() => fetchJobs(val), 500)
  return () => clearTimeout(t)
})

onMounted(() => {
  fetchJobs(searchQuery.value)
  fetchLocations()
})
</script>

<template>
  <div class="vj-body">

    <!-- Header Area -->
    <div class="vj-header-area">
      <button class="back-btn" @click="emit('back')" title="Back to Home">
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>

      <div class="page-title-row">
        <div class="page-title-icon">
          <ClipboardList :size="22" color="#1e40af" />
        </div>
        <div>
          <h2 class="page-title">Jobs List <span class="job-count-badge">{{ filteredJobs.length }}</span></h2>
          <p class="page-subtitle">Manage and monitor all your job postings</p>
        </div>
      </div>
    </div>

    <!-- Search Bar + View Toggle -->
    <div class="vj-toolbar">
      <div class="search-wrapper">
        <Search class="search-icon" :size="18" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search jobs by title, ID, or location..."
          class="search-input"
        />
      </div>
      <div class="view-toggle">
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
          title="List View"
        >
          <List :size="16" />
        </button>
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          title="Grid View"
        >
          <LayoutGrid :size="16" />
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <Loader2 class="loading-spinner" :size="40" />
      <p>Loading jobs...</p>
    </div>

    <!-- Job Cards -->
    <div v-else class="jobs-container" :class="{ 'grid-mode': viewMode === 'grid' }">
      <TransitionGroup name="card-list" tag="div" class="jobs-list">
        <div
          v-for="(job, index) in filteredJobs"
          :key="String(job.job_id ?? job.id ?? index)"
          class="job-card"
          :class="{
            'card-premium': getSubscriptionType(job) === 'PREMIUM',
            'card-super-premium': getSubscriptionType(job) === 'SUPER PREMIUM',
          }"
          :style="{ animationDelay: index * 0.08 + 's' }"
        >
          <!-- Subscription Badge -->
          <div
            v-if="getSubscriptionType(job) !== 'STANDARD'"
            class="subscription-badge"
            :class="{
              'badge-premium': getSubscriptionType(job) === 'PREMIUM',
              'badge-super-premium': getSubscriptionType(job) === 'SUPER PREMIUM',
            }"
          >
            {{ getSubscriptionType(job) }}
          </div>

          <!-- Card Top: Title + Toggle -->
          <div class="card-top">
            <div class="card-title-area">
              <h3 class="job-title">{{ job.job_title || 'Untitled Job' }}</h3>
              <div class="job-meta">
                <span class="job-id">{{ job.job_id || job.id }}</span>
                <span class="dot">·</span>
                <span class="job-date">{{ formatDate(job) }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button
                class="toggle-switch"
                :class="{ on: isActive(job) }"
                :disabled="togglingId === String(job.job_id ?? job.id)"
                @click.stop="toggleJob(job)"
                :title="isActive(job) ? 'Deactivate Job' : 'Activate Job'"
              >
                <Loader2 v-if="togglingId === String(job.job_id ?? job.id)" class="toggle-loader" :size="14" />
                <div v-else class="toggle-knob"></div>
              </button>
            </div>
          </div>

          <!-- Divider -->
          <div class="card-divider"></div>

          <!-- Job Details Grid -->
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-icon salary-icon">
                <IndianRupee :size="16" />
              </div>
              <div class="detail-content">
                <span class="detail-label">Salary</span>
                <span class="detail-value">{{ job.Salary_Range || 'N/A' }}</span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon location-icon">
                <MapPin :size="16" />
              </div>
              <div class="detail-content">
                <span class="detail-label">Location</span>
                <span class="detail-value">{{ getLocationName(job) || 'N/A' }}</span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon drivers-icon">
                <Users :size="16" />
              </div>
              <div class="detail-content">
                <span class="detail-label">No. of Drivers</span>
                <span class="detail-value">{{ job.number_of_drivers_required ?? 'N/A' }}</span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon expiry-icon">
                <CalendarDays :size="16" />
              </div>
              <div class="detail-content">
                <span class="detail-label">Expiry Date</span>
                <span class="detail-value">{{ formatExpiry(job) }}</span>
              </div>
            </div>
          </div>

          <!-- Status Badges -->
          <div class="status-row">
            <div class="status-group">
              <span class="status-label">Job Status</span>
              <span
                class="status-badge"
                :class="{
                  'badge-active': isActive(job),
                  'badge-inactive': !isActive(job),
                }"
              >
                <span class="status-dot"></span>
                {{ isActive(job) ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="status-group">
              <span class="status-label">Job Approval</span>
              <span
                class="status-badge"
                :class="{
                  'badge-approved': isApproved(job),
                  'badge-pending': !isApproved(job),
                }"
              >
                <span class="status-dot"></span>
                {{ isApproved(job) ? 'Approved' : 'Pending' }}
              </span>
            </div>
          </div>

          <!-- Invite Button (only when approved and active) -->
          <button
            v-if="canInvite(job)"
            class="invite-btn"
            @click="handleInvite(job)"
          >
            <UserPlus :size="18" />
            <span>Invite Drivers</span>
          </button>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="filteredJobs.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>{{ searchQuery.trim() ? 'No jobs found' : 'No jobs yet' }}</h3>
        <p>{{ searchQuery.trim() ? 'Try adjusting your search or filters' : "You haven't posted any jobs yet. Please add a job now." }}</p>
      </div>
    </div>

    <!-- Floating Add Job Button -->
    <button class="fab-add-job" @click="handleAddJob" title="Add New Job">
      <Plus :size="22" />
      <span>Add Job</span>
    </button>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

/* ─── Animations ─── */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes pulseGlow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.5; transform: scale(1.5); }
}

@keyframes fabBounce {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-4px); }
  100% { transform: translateY(0); }
}

/* ─── TransitionGroup ─── */
.card-list-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-list-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
.card-list-leave-to {
  opacity: 0;
  transform: translateX(-30px) scale(0.96);
}

/* ─── Body ─── */
.vj-body {
  padding: 32px 40px 100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeSlideIn 0.4s ease-out;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  position: relative;
  min-height: 100%;
}

/* ─── Header ─── */
.vj-header-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
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
}

.back-btn:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  transform: translateX(-2px);
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.job-count-badge {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  min-width: 28px;
  text-align: center;
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

/* ─── Toolbar ─── */
.vj-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 280px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
  pointer-events: none;
  transition: color 0.2s;
}

.search-wrapper:focus-within .search-icon {
  color: #2563eb;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: all 0.25s;
}

.search-input:focus {
  background: #ffffff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.search-input::placeholder {
  color: #94a3b8;
}

/* ─── View Toggle ─── */
.view-toggle {
  display: flex;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.toggle-btn {
  padding: 9px 12px;
  border: none;
  background: #ffffff;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.toggle-btn.active {
  background: #eff6ff;
  color: #1e40af;
}

.toggle-btn:first-child {
  border-right: 1px solid #e2e8f0;
}

/* ─── Jobs Container ─── */
.jobs-container {
  flex: 1;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grid-mode .jobs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  gap: 20px;
}

/* ─── Job Card ─── */
.job-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px 28px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardEnter 0.5s ease-out backwards;
  position: relative;
  overflow: hidden;
}

.job-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #7c3aed, #2563eb);
  background-size: 200% 100%;
  opacity: 0;
  transition: opacity 0.3s;
}

.job-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 12px 32px -8px rgba(37, 99, 235, 0.12),
              0 4px 8px -2px rgba(0, 0, 0, 0.04);
  transform: translateY(-3px);
}

.job-card:hover::before {
  opacity: 1;
  animation: gradientShift 2s linear infinite;
}

@keyframes gradientShift {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
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
  color: #2563eb;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Subscription Badge */
.subscription-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.5px;
}

.badge-premium {
  background: #FFD700;
  color: #000000;
}

.badge-super-premium {
  background: #E1AD01;
  color: #FFFFFF;
}

.card-premium {
  border-color: #FFD700 !important;
  border-width: 1.5px;
}

.card-super-premium {
  border-color: #E1AD01 !important;
  border-width: 2px;
}

/* Card Top */
.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.card-title-area {
  flex: 1;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.job-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.5;
  letter-spacing: -0.2px;
}

.job-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.job-id {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  background: #f1f5f9;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.dot { color: #cbd5e1; }

.job-date {
  font-weight: 500;
}

/* Toggle Switch */
.toggle-switch {
  width: 48px;
  height: 26px;
  border-radius: 14px;
  border: none;
  background: #cbd5e1;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
  flex-shrink: 0;
  padding: 0;
}

.toggle-switch.on {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}

.toggle-knob {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.toggle-switch.on .toggle-knob {
  transform: translateX(22px);
}

.toggle-switch:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.toggle-loader {
  color: #fff;
  animation: spin 0.8s linear infinite;
}

/* Card Divider */
.card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
  margin: 18px 0;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.job-card:hover .detail-icon {
  transform: scale(1.06);
}

.salary-icon {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.location-icon {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.drivers-icon {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.expiry-icon {
  background: #fdf2f8;
  color: #db2777;
  border: 1px solid #fbcfe8;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.detail-label {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

/* Status Row */
.status-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.status-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.views-group {
  margin-left: auto;
}

.status-label {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-active {
  background: #ecfdf5;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.badge-active .status-dot {
  background: #22c55e;
  animation: pulseGlow 2s infinite;
}

.badge-inactive {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.badge-inactive .status-dot {
  background: #94a3b8;
}

.badge-approved {
  background: #ecfdf5;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.badge-approved .status-dot {
  background: #22c55e;
}

.badge-pending {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.badge-pending .status-dot {
  background: #f59e0b;
  animation: pulseGlow 2s infinite;
}


/* Invite Button */
.invite-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 13px 24px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px -2px rgba(37, 99, 235, 0.35);
  letter-spacing: 0.2px;
}

.invite-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #172554);
  box-shadow: 0 8px 24px -4px rgba(37, 99, 235, 0.45);
  transform: translateY(-1px);
}

.invite-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* ─── Empty State ─── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  animation: fadeSlideIn 0.4s ease-out;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* ─── Floating Action Button ─── */
.fab-add-job {
  position: fixed;
  bottom: 32px;
  right: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563eb, #1e3a8a);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  box-shadow: 0 8px 32px -4px rgba(37, 99, 235, 0.5),
              0 4px 12px -2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 30;
  letter-spacing: 0.3px;
}

.fab-add-job:hover {
  background: linear-gradient(135deg, #1d4ed8, #172554);
  box-shadow: 0 12px 40px -4px rgba(37, 99, 235, 0.55),
              0 6px 16px -2px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
  animation: fabBounce 0.5s ease-out;
}

.fab-add-job:active {
  transform: translateY(0);
}
</style>
