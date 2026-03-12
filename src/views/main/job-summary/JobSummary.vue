<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  MapPin,
  Map,
  Car,
  Clock,
  IndianRupee,
  Shield,
  Utensils,
  Gift,
  Home,
  Gauge,
  CreditCard,
  Users,
  Calendar,
  Wrench,
  FileText,
  Pencil,
} from 'lucide-vue-next'
import { useJobStore } from '../../../stores/job'
import { apiPostForm } from '../../../services/config/api'
import { END_POINTS } from '../../../services/config/api'
import JobPremiumModal from '../../../components/JobPremiumModal.vue'
import { cleanupRazorpayOverlay } from '../../../utils/razorpayCleanup'

const props = defineProps<{
  user?: { role?: string; id?: unknown; name?: string; mobile?: string; email?: string } | null
}>()

const emit = defineEmits(['back', 'navigate'])

const jobStore = useJobStore()
const draft = computed(() => jobStore.addJob)
const editingJob = computed(() => jobStore.editingJob)
const submitting = ref(false)
const showSuccess = ref(false)
const postedJobId = ref<string | null>(null)
const jobPremiumVisible = ref(false)

const notProvided = 'Not Provided'

// Helpers (mirror AddJob)
const toYesNo = (v: boolean | null) => (v === true ? 'yes' : 'no')
const expToApi = (s: string) => s.replace(/\s*years?\s*/gi, '').replace('-', '-') || s
const licenseToApi = (s: string) => {
  if (s.includes('LMV')) return 'LMV'
  if (s.includes('HMV')) return 'HMV'
  if (s.includes('HGMV')) return 'HGMV'
  if (s.includes('HPMV') || s.includes('HTV')) return 'HPMV/HTV'
  return s
}
const conditionToApi = (s: string) => {
  const m: Record<string, string> = {
    Excellent: 'excellent',
    Good: 'good',
    Average: 'average',
    'Old but running': 'old_running',
    'Made Road Ready': 'road_ready',
  }
  return m[s] || s.toLowerCase().replace(/\s+/g, '_')
}
const vehicleToApi = (s: string) => {
  const m: Record<string, string> = {
    'Trailer/Semi-Trailer': 'Trailer / Semi-Trailer Trucks',
    'Reefer Trucks': 'Refrigerator (Reefer) Trucks',
    'Container Truck': 'Container Trucks',
    'Tipper Trucks': 'Tipper Trucks',
    Tanker: 'Tankers',
  }
  return m[s] || s
}
const formatDeadline = (d: string) => {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

const getYesNoValue = (value: boolean | null, desc?: string, suffix?: string) => {
  if (value === true) return desc ? `Yes - ₹${desc}${suffix || '/day'}` : 'Yes'
  if (value === false) return 'No'
  return notProvided
}

const getYesNoValueMileage = (value: boolean | null, desc?: string) => {
  if (value === true) return desc ? `Yes - ${desc} km/l` : 'Yes'
  if (value === false) return 'No'
  return notProvided
}

const deadlineDisplay = computed(() => {
  const d = draft.value?.deadline
  if (!d) return notProvided
  const [y, m, day] = d.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const mi = parseInt(m || '1', 10) - 1
  return `${day} ${months[mi]} ${y}`
})

const salaryDisplay = computed(() => {
  const s = draft.value?.salary
  if (!s) return notProvided
  const [a, b] = s.split('-')
  return a && b ? `₹${parseInt(a, 10).toLocaleString()} - ${parseInt(b, 10).toLocaleString()}` : `₹${s}`
})

onMounted(() => {
  if (!draft.value && !editingJob.value) {
    emit('navigate', 'add-job')
  }
})

onBeforeUnmount(() => {
  cleanupRazorpayOverlay()
})

const goBack = () => {
  if (editingJob.value) {
    jobStore.clearEditingJob()
  }
  emit('back')
}

const goEdit = () => {
  if (editingJob.value) {
    jobStore.clearEditingJob()
    emit('back')
  } else {
    emit('back')
  }
}

const submitJob = async () => {
  const d = draft.value
  if (!d) return
  if (!d.consent) {
    alert('Please agree to the consent before posting.')
    return
  }
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('job_title', d.title)
    fd.append('job_location', d.location)
    fd.append('pincode', d.pincode || '')
    fd.append('area', d.area || '')
    fd.append('route', d.route || '')
    fd.append('vehicle_type', vehicleToApi(d.vehicleType))
    fd.append('Required_Experience', expToApi(d.experience))
    fd.append('Salary_Range', d.salary)
    fd.append('esi_pf', toYesNo(d.hasEsiPf))
    fd.append('food_allowance', toYesNo(d.hasFoodAllowance))
    fd.append('food_allowance_desc', d.foodAllowanceAmount || '')
    fd.append('trip_incentive', toYesNo(d.hasTripIncentive))
    fd.append('trip_incentive_desc', d.tripIncentiveAmount || '')
    fd.append('rahane_ki_suvidha', toYesNo(d.hasAccommodation))
    fd.append('mileage', toYesNo(d.hasMileage))
    fd.append('mileage_desc', d.mileageValue || '')
    fd.append('fast_tag_road_kharcha', toYesNo(d.hasFastag))
    fd.append('fast_tag_road_kharcha_desc', d.fastagAmount || '')
    fd.append('Type_of_License', licenseToApi(d.license))
    fd.append('Preferred_Skills', JSON.stringify(d.skills))
    fd.append('Application_Deadline', formatDeadline(d.deadline))
    fd.append('number_of_drivers_required', d.numberOfDrivers)
    fd.append('Job_Description', d.description)
    fd.append('truck_condition', d.truckCondition ? conditionToApi(d.truckCondition) : '')
    fd.append('consent_visible_driver', d.consent ? '1' : '0')

    const res = await apiPostForm<{ status?: boolean; data?: { unique_id?: string; id?: string }; job_id?: string }>(
      END_POINTS.TRANSPORTER_ADD_JOB,
      fd
    )
    const data = res as { status?: boolean; data?: { unique_id?: string; id?: string }; job_id?: string }
    if (data?.status) {
      const inner = data?.data
      const jobId = inner?.unique_id || inner?.id || data?.job_id || ''
      if (jobId) {
        postedJobId.value = String(jobId)
        jobPremiumVisible.value = true
      } else {
        showSuccess.value = true
        jobStore.clearAddJob()
        setTimeout(() => emit('navigate', 'view-jobs'), 2000)
      }
    } else {
      alert((data as { message?: string })?.message || 'Failed to post job')
    }
  } catch (e) {
    console.error('Add job error:', e)
    alert((e as Error)?.message || 'Something went wrong')
  } finally {
    submitting.value = false
  }
}

const onJobPremiumSuccess = () => {
  jobPremiumVisible.value = false
  showSuccess.value = true
  jobStore.clearAddJob()
  setTimeout(() => emit('navigate', 'view-jobs'), 2000)
}

const onJobPremiumSkip = () => {
  jobPremiumVisible.value = false
  showSuccess.value = true
  jobStore.clearAddJob()
  setTimeout(() => emit('navigate', 'view-jobs'), 2000)
}
</script>

<template>
  <div class="job-summary-wrapper">
    <!-- Header -->
    <div class="dash-header-area">
      <button class="back-btn" @click="goBack" title="Back">
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>
      <div class="page-title-row">
        <h2 class="page-title">Job Summary</h2>
        <p class="page-subtitle">Review all the details before posting your job</p>
      </div>
    </div>

    <!-- Success State -->
    <div v-if="showSuccess" class="success-block">
      <CheckCircle2 :size="64" color="#10b981" />
      <h2>Job Posted Successfully!</h2>
      <p>Taking you to your jobs...</p>
    </div>

    <!-- Edit Mode: viewing job from list -->
    <div v-else-if="editingJob" class="summary-scroll">
      <div class="summary-header">
        <h3>Job Details</h3>
        <p>Viewing job from your list</p>
      </div>
      <div class="summary-card">
        <div class="card-header">
          <div class="card-icon" style="background: #E8F4FD; color: #246BFD">
            <Briefcase :size="18" />
          </div>
          <span class="card-title">JOB TITLE</span>
          <button class="edit-btn" @click="goEdit" aria-label="Back to list">
            <Pencil :size="14" />
          </button>
        </div>
        <div class="card-value">{{ editingJob.job_title || notProvided }}</div>
      </div>
      <div class="summary-card">
        <div class="card-header">
          <div class="card-icon" style="background: #E8F8F0; color: #10B981">
            <MapPin :size="18" />
          </div>
          <span class="card-title">LOCATION</span>
        </div>
        <div class="card-value">{{ editingJob.job_location || notProvided }}</div>
      </div>
      <div class="summary-card">
        <div class="card-header">
          <div class="card-icon" style="background: #FEF3E8; color: #F59E0B">
            <IndianRupee :size="18" />
          </div>
          <span class="card-title">SALARY</span>
        </div>
        <div class="card-value">{{ editingJob.Salary_Range || notProvided }}</div>
      </div>
      <div class="summary-card">
        <div class="card-header">
          <div class="card-icon" style="background: #EBF4FF; color: #3B82F6">
            <Users :size="18" />
          </div>
          <span class="card-title">DRIVERS REQUIRED</span>
        </div>
        <div class="card-value">{{ editingJob.number_of_drivers_required ?? notProvided }}</div>
      </div>
      <div class="summary-card">
        <div class="card-header">
          <div class="card-icon" style="background: #FDF2F8; color: #DB2777">
            <Calendar :size="18" />
          </div>
          <span class="card-title">DEADLINE</span>
        </div>
        <div class="card-value">{{ editingJob.Application_Deadline || editingJob.application_deadline || notProvided }}</div>
      </div>
      <div class="action-row">
        <button class="primary-btn secondary" @click="goBack">Back to Jobs List</button>
      </div>
    </div>

    <template v-else-if="draft">
      <div class="summary-scroll">
        <div class="summary-header">
          <h3>Review Your Job</h3>
          <p>Please review all the details before posting your job</p>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #E8F4FD; color: #246BFD">
              <Briefcase :size="18" />
            </div>
            <span class="card-title">JOB TITLE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.title || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #E8F8F0; color: #10B981">
              <MapPin :size="18" />
            </div>
            <span class="card-title">LOCATION</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.location || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #EBF4FF; color: #3B82F6">
              <Map :size="18" />
            </div>
            <span class="card-title">ROUTE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.route || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #FEF3E8; color: #F59E0B">
              <Car :size="18" />
            </div>
            <span class="card-title">VEHICLE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.vehicleType || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #F3E8FF; color: #8B5CF6">
              <Clock :size="18" />
            </div>
            <span class="card-title">EXPERIENCE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.experience || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #E8FDF0; color: #059669">
              <IndianRupee :size="18" />
            </div>
            <span class="card-title">FIXED SALARY</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ salaryDisplay }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #F0F9FF; color: #0EA5E9">
              <Shield :size="18" />
            </div>
            <span class="card-title">ESI/PF</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">
            {{ draft.hasEsiPf === true ? 'Yes' : draft.hasEsiPf === false ? 'No' : notProvided }}
          </div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #FEF3E2; color: #F59E0B">
              <Utensils :size="18" />
            </div>
            <span class="card-title">FOOD ALLOWANCE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ getYesNoValue(draft.hasFoodAllowance, draft.foodAllowanceAmount) }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #F0FDF4; color: #16A34A">
              <Gift :size="18" />
            </div>
            <span class="card-title">TRIP INCENTIVE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ getYesNoValue(draft.hasTripIncentive, draft.tripIncentiveAmount) }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #EEF2FF; color: #6366F1">
              <Home :size="18" />
            </div>
            <span class="card-title">ACCOMMODATION FACILITY</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">
            {{ draft.hasAccommodation === true ? 'Yes' : draft.hasAccommodation === false ? 'No' : notProvided }}
          </div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #F0F9FF; color: #0EA5E9">
              <Gauge :size="18" />
            </div>
            <span class="card-title">MILEAGE REQUIRED</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ getYesNoValueMileage(draft.hasMileage, draft.mileageValue) }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #FEF3E2; color: #F59E0B">
              <CreditCard :size="18" />
            </div>
            <span class="card-title">FASTAG/ROAD KHARCHA</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ getYesNoValue(draft.hasFastag, draft.fastagAmount, '') }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #FEE8E8; color: #EF4444">
              <CreditCard :size="18" />
            </div>
            <span class="card-title">LICENSE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.license || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #E8F0FE; color: #3B82F6">
              <Users :size="18" />
            </div>
            <span class="card-title">DRIVERS</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.numberOfDrivers || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #FFF3E8; color: #F97316">
              <Calendar :size="18" />
            </div>
            <span class="card-title">APPLICATION DEADLINE</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ deadlineDisplay }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #E8F4FD; color: #246BFD">
              <Wrench :size="18" />
            </div>
            <span class="card-title">PREFERRED SKILLS</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value skills-row">
            <span v-for="s in draft.skills" :key="s" class="skill-chip">{{ s }}</span>
            <span v-if="!draft.skills?.length">{{ notProvided }}</span>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #F3E8FF; color: #8B5CF6">
              <FileText :size="18" />
            </div>
            <span class="card-title">JOB DESCRIPTION</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value card-desc">{{ draft.description || notProvided }}</div>
        </div>

        <div class="summary-card">
          <div class="card-header">
            <div class="card-icon" style="background: #FEF3E2; color: #F59E0B">
              <Wrench :size="18" />
            </div>
            <span class="card-title">TRUCK CONDITION</span>
            <button class="edit-btn" @click="goEdit" aria-label="Edit">
              <Pencil :size="14" />
            </button>
          </div>
          <div class="card-value">{{ draft.truckCondition || notProvided }}</div>
        </div>

        <div class="summary-actions">
          <button type="button" class="btn-secondary" @click="goEdit">Edit</button>
          <button type="button" class="submit-btn" :disabled="submitting" @click="submitJob">
            {{ submitting ? 'Posting...' : 'Post Job' }}
          </button>
        </div>
      </div>
    </template>

    <JobPremiumModal
      :visible="jobPremiumVisible"
      :job-id="postedJobId"
      :driver-count="parseInt(draft?.numberOfDrivers || '1') || 1"
      :user="user"
      @close="jobPremiumVisible = false"
      @success="onJobPremiumSuccess"
      @skip="onJobPremiumSkip"
    />
  </div>
</template>

<style scoped>
.job-summary-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #F8F9FA;
}
.dash-header-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #E9ECEF;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 15px;
  color: #246BFD;
  cursor: pointer;
  padding: 6px 0;
}
.page-title-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
}
.page-subtitle {
  font-size: 13px;
  color: #6C757D;
}
.success-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}
.success-block h2 {
  font-size: 20px;
  font-weight: 700;
  color: #10b981;
}
.success-block p {
  font-size: 14px;
  color: #6b7280;
}
.summary-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.summary-header {
  margin-bottom: 20px;
}
.summary-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 6px;
}
.summary-header p {
  font-size: 13px;
  color: #6C757D;
  line-height: 20px;
}
.summary-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #E9ECEF;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-title {
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  color: #6C757D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.edit-btn {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: #F0F7FF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #246BFD;
  cursor: pointer;
}
.edit-btn:hover {
  background: #D0E7FF;
}
.card-value {
  font-size: 15px;
  font-weight: 600;
  color: #212529;
  margin-left: 48px;
  line-height: 22px;
}
.card-desc {
  font-size: 14px;
  font-weight: 400;
  color: #495057;
  line-height: 22px;
}
.skills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.skill-chip {
  background: #F0F5FF;
  color: #246BFD;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}
.summary-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-bottom: 24px;
}
.btn-secondary {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
}
.submit-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  background: #246BFD;
  border: none;
  color: #fff;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
