<script setup lang="ts">
import { ref, computed } from 'vue'
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
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

/* ─── Sample Jobs Data ─── */
const jobs = ref([
  {
    id: 'TMJB00592',
    date: '23 Dec 2025',
    title: '₹18,000 सैलरी + ₹300 रोज़ का खाना + इंसेंटिव | HMV ड्राइवर चाहिए | 6 व्हीलर Tata Ultra 💰',
    salaryMin: 20000,
    salaryMax: 25000,
    location: 'Rajasthan',
    driversNeeded: 1,
    expiryDate: '20 Mar 2026',
    status: 'Active',
    approval: 'Approved',
    isActive: true,
  },
  {
    id: 'TMJB00593',
    date: '15 Jan 2026',
    title: '₹22,000 सैलरी + Accommodation | LMV Driver Required | Tata Ace Gold',
    salaryMin: 22000,
    salaryMax: 28000,
    location: 'Gujarat',
    driversNeeded: 2,
    expiryDate: '15 Apr 2026',
    status: 'Active',
    approval: 'Approved',
    isActive: true,
  },
  {
    id: 'TMJB00594',
    date: '02 Feb 2026',
    title: '₹25,000 + ₹500 Daily Allowance | HMV Driver for Long Route | Ashok Leyland 12 Wheeler',
    salaryMin: 25000,
    salaryMax: 32000,
    location: 'Maharashtra',
    driversNeeded: 3,
    expiryDate: '02 May 2026',
    status: 'Active',
    approval: 'Pending',
    isActive: true,
  },
])

const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('list')

const filteredJobs = computed(() => {
  if (!searchQuery.value.trim()) return jobs.value
  const q = searchQuery.value.toLowerCase()
  return jobs.value.filter(j =>
    j.title.toLowerCase().includes(q) ||
    j.id.toLowerCase().includes(q) ||
    j.location.toLowerCase().includes(q)
  )
})

const toggleJob = (job: any) => {
  job.isActive = !job.isActive
  job.status = job.isActive ? 'Active' : 'Inactive'
}

const formatSalary = (min: number, max: number) => {
  return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`
}
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

    <!-- Job Cards -->
    <div class="jobs-container" :class="{ 'grid-mode': viewMode === 'grid' }">
      <TransitionGroup name="card-list" tag="div" class="jobs-list">
        <div
          v-for="(job, index) in filteredJobs"
          :key="job.id"
          class="job-card"
          :style="{ animationDelay: index * 0.08 + 's' }"
        >
          <!-- Card Top: Title + Toggle -->
          <div class="card-top">
            <div class="card-title-area">
              <h3 class="job-title">{{ job.title }}</h3>
              <div class="job-meta">
                <span class="job-id">{{ job.id }}</span>
                <span class="dot">·</span>
                <span class="job-date">{{ job.date }}</span>
              </div>
            </div>
            <button
              class="toggle-switch"
              :class="{ on: job.isActive }"
              @click.stop="toggleJob(job)"
              :title="job.isActive ? 'Deactivate Job' : 'Activate Job'"
            >
              <div class="toggle-knob"></div>
            </button>
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
                <span class="detail-value">{{ formatSalary(job.salaryMin, job.salaryMax) }}</span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon location-icon">
                <MapPin :size="16" />
              </div>
              <div class="detail-content">
                <span class="detail-label">Location</span>
                <span class="detail-value">{{ job.location }}</span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon drivers-icon">
                <Users :size="16" />
              </div>
              <div class="detail-content">
                <span class="detail-label">No. of Drivers</span>
                <span class="detail-value">{{ job.driversNeeded }}</span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-icon expiry-icon">
                <CalendarDays :size="16" />
              </div>
              <div class="detail-content">
                <span class="detail-label">Expiry Date</span>
                <span class="detail-value">{{ job.expiryDate }}</span>
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
                  'badge-active': job.status === 'Active',
                  'badge-inactive': job.status === 'Inactive'
                }"
              >
                <span class="status-dot"></span>
                {{ job.status }}
              </span>
            </div>
            <div class="status-group">
              <span class="status-label">Job Approval</span>
              <span
                class="status-badge"
                :class="{
                  'badge-approved': job.approval === 'Approved',
                  'badge-pending': job.approval === 'Pending'
                }"
              >
                <span class="status-dot"></span>
                {{ job.approval }}
              </span>
            </div>

          </div>

          <!-- Action Button -->
          <button class="invite-btn">
            <UserPlus :size="18" />
            <span>Invite Drivers</span>
          </button>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="filteredJobs.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No jobs found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    </div>

    <!-- Floating Add Job Button -->
    <button class="fab-add-job" @click="emit('navigate', 'add-job')" title="Add New Job">
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
