<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  FileText,
  ChevronDown,
  MapPin,
  CreditCard,
  CalendarDays,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Search,
  Shield,
  ShieldCheck,
  Star,
  Crown,
  BadgeCheck,
  LayoutGrid,
  List,
  X,
  AlertTriangle,
  PhoneCall,
  Briefcase,
  Loader2,
} from 'lucide-vue-next'
import { apiGet, apiPostForm, END_POINTS, BASE_URL } from '../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

/** API types */
interface DriverDetails {
  driver_id?: number
  unique_id?: string
  driver_name?: string
  driver_mobile?: string
  driver_email?: string
  driver_picture?: string
  images?: string
  city?: string
  states?: string
  state?: string
  driving_exp?: string
  license_type?: string
  license_no?: string
  license_expiry?: string
  payments_type?: string
  profile_completion?: number
  rating?: number
  father_name?: string
  dob?: string
  gender?: string
  marital_status?: string
  education?: string
  address?: string
  full_address?: string
  pincode?: string
  district?: string
  vehicle_type?: string
  pan?: string
  dl_name_verified?: string
  face_match_verified?: string | boolean
  court_check_status?: string | { status?: string }
  address_verification_status?: string | { status?: string }
  [key: string]: unknown
}

interface ApiApplication {
  application_id: number
  job_id: string
  job_title?: string
  current_status?: string
  driver_details?: DriverDetails
  interview_at?: string
  [key: string]: unknown
}

/** UI job with applicants (from API) */
interface JobGroup {
  id: string
  title: string
  fullTitle: string
  applicantCount: number
  expanded: boolean
  viewMode: 'grid' | 'list'
  activeTab: 'all' | 'accepted' | 'rejected'
  applicants: ApplicantDisplay[]
}

interface ApplicantDisplay {
  id: number
  name: string
  tmId: string
  location: string
  licenseType: string
  licenseNo: string
  licenseExp: string
  experience: string
  avatar: string
  status: 'pending' | 'accepted' | 'rejected'
  badge: 'trusted' | 'verified' | 'job-ready' | 'legacy' | null
  profileScore: number
  rating: number
  checks: { id: boolean; face: boolean; court: boolean; digitalAddress: boolean }
  /** Raw API item for actions */
  _raw: ApiApplication
}

const jobs = ref<JobGroup[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const totalCount = ref(0)
const acceptRejectLoading = ref(false)
const acceptId = ref<number | null>(null)
const rejectId = ref<number | null>(null)
const callLoading = ref(false)

const selectedDriver = ref<ApplicantDisplay | null>(null)

const closeDriverDetails = () => {
  selectedDriver.value = null
}

/* ─── Badge Info Popups ─── */
const badgePopup = ref<{ jobIdx: number; appId: number; badge: string } | null>(null)
const showBadgePopup = (jobIdx: number, appId: number, badge: string | null | undefined) => {
  badgePopup.value = { jobIdx, appId, badge: badge ?? '' }
}
const hideBadgePopup = () => { badgePopup.value = null }
const isBadgePopupVisible = (jobIdx: number, appId: number) => {
  return badgePopup.value?.jobIdx === jobIdx && badgePopup.value?.appId === appId
}

/** Map payments_type to badge */
function getBadgeFromPayment(item: ApiApplication): ApplicantDisplay['badge'] {
  const pt = (item?.driver_details?.payments_type || item?.payment_type || '').toString().toLowerCase().trim()
  const amount = item?.amount ?? item?.driver_details?.amount
  if (amount === 49 || amount === 49.0 || pt === 'subscription') return 'legacy'
  if (pt === 'trusted') return 'trusted'
  if (pt === 'verified') return 'verified'
  if (pt === 'job_ready' || pt === 'job ready' || pt === 'jobready') return 'job-ready'
  return null
}

/** Map API item to ApplicantDisplay */
function mapToApplicant(item: ApiApplication): ApplicantDisplay {
  const d = item?.driver_details || {}
  const name = String(d.driver_name || d.name || 'Driver')
  const tmId = d.unique_id || ''
  const city = d.city || ''
  const state = d.states || d.state || ''
  const location = [city, state].filter(Boolean).join(', ') || '—'
  const licenseType = String(d.license_type || d.Type_of_License || '—').toUpperCase()
  const licenseNo = String(d.license_no || d.License_number || '')
  const licenseExpRaw = d.license_expiry || d.Expiry_date_of_license
  const licenseExp = licenseExpRaw
    ? new Date(licenseExpRaw as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  const experience = String(d.driving_exp || d.driving_experience || d.Driver_Experience || '—')
  const badge = getBadgeFromPayment(item)
  const profileCompletion = d.profile_completion ?? (badge === 'trusted' ? 100 : badge === 'verified' ? 85 : 60)
  const rating = Math.round(Number(d.rating) || 0)
  const avatar = d.driver_picture || d.images
    ? `${BASE_URL.replace(/\/$/, '')}/public/${d.driver_picture || d.images}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128`
  const statusStr = String(item.current_status || 'Pending').toLowerCase()
  const mappedStatus: ApplicantDisplay['status'] = statusStr === 'pending' ? 'pending' : statusStr === 'accepted' ? 'accepted' : 'rejected'
  const isIdVerified = d.dl_name_verified === 'verified'
  const isFaceVerified = d.face_match_verified === 'verified' || d.face_match_verified === true
  const isCourtVerified = d.court_check_status === 'verified' || (d.court_check_status as { status?: string })?.status === 'verified'
  const isAddrVerified = d.address_verification_status === 'verified' || (d.address_verification_status as { status?: string })?.status === 'verified'
  return {
    id: item.application_id,
    name,
    tmId,
    location,
    licenseType,
    licenseNo: licenseNo ? `${'X'.repeat(Math.max(0, licenseNo.length - 4))}${licenseNo.slice(-4)}` : '—',
    licenseExp,
    experience,
    avatar,
    status: mappedStatus,
    badge,
    profileScore: profileCompletion,
    rating,
    checks: { id: isIdVerified, face: isFaceVerified, court: isCourtVerified, digitalAddress: isAddrVerified },
    _raw: item,
  }
}

/** Group API list by job_id and sort by payment priority */
function groupAndMap(data: ApiApplication[]): JobGroup[] {
  const getPriority = (item: ApiApplication) => {
    const pt = (item?.driver_details?.payments_type || item?.payment_type || '').toString().toLowerCase()
    if (pt === 'trusted') return 3
    if (pt === 'verified') return 2
    if (pt === 'job_ready' || pt === 'jobready') return 1
    return 0
  }
  const grouped = new Map<string, ApiApplication[]>()
  for (const item of data) {
    const jid = String(item.job_id || '')
    if (!jid) continue
    if (!grouped.has(jid)) grouped.set(jid, [])
    grouped.get(jid)!.push(item)
  }
  for (const arr of grouped.values()) {
    arr.sort((a, b) => getPriority(b) - getPriority(a))
  }
  return Array.from(grouped.entries()).map(([jid, apps]) => {
    const first = apps[0]
    const title = (first?.job_title || '').length > 45 ? (first?.job_title || '').slice(0, 45) + '...' : (first?.job_title || 'Job')
    return {
      id: jid,
      title,
      fullTitle: first?.job_title || 'Job',
      applicantCount: apps.length,
      expanded: false,
      viewMode: 'list' as const,
      activeTab: 'all' as const,
      applicants: apps.map(mapToApplicant),
    }
  })
}

/** Fetch applied jobs */
async function fetchJobs(page = 1, isLoadMore = false) {
  try {
    if (isLoadMore) loadingMore.value = true
    else loading.value = true
    const res: any = await apiGet(`${END_POINTS.TRANSPORTER_APPLIED_JOBS_LIST}?page=${page}`)
    const newData = res?.data || []
    const pagination = res?.pagination
    if (pagination) {
      currentPage.value = pagination.current_page ?? 1
      lastPage.value = pagination.last_page ?? 1
      totalCount.value = pagination.total ?? 0
    }
    const mapped = groupAndMap(Array.isArray(newData) ? newData : [])
    if (isLoadMore && page > 1) {
      const existingAppIds = new Set<string>()
      for (const j of jobs.value) {
        for (const a of j.applicants) existingAppIds.add(String(a.id))
      }
      for (const j of mapped) {
        const existing = jobs.value.find((x) => x.id === j.id)
        if (existing) {
          for (const a of j.applicants) {
            if (!existingAppIds.has(String(a.id))) {
              existing.applicants.push(a)
              existingAppIds.add(String(a.id))
            }
          }
          existing.applicantCount = existing.applicants.length
        } else {
          jobs.value.push(j)
        }
      }
    } else {
      jobs.value = mapped
    }
  } catch (err) {
    console.error('Error fetching applied jobs:', err)
    if (!loadingMore.value) jobs.value = []
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  const cp = currentPage.value
  const lp = lastPage.value
  if (!loadingMore.value && cp < lp) {
    fetchJobs(cp + 1, true)
  }
}

/** Accept application */
async function acceptApplicant(app: ApplicantDisplay) {
  const aid = app._raw?.application_id
  if (!aid) return
  acceptId.value = aid
  acceptRejectLoading.value = true
  try {
    const fd = new FormData()
    fd.append('status', 'Accepted')
    const res: any = await apiPostForm(END_POINTS.TRANSPORTER_JOB_ACCEPT_REJECT(aid), fd)
    if (res?.status) {
      app.status = 'accepted'
    }
  } catch (err) {
    console.error('Accept error:', err)
  } finally {
    acceptId.value = null
    acceptRejectLoading.value = false
  }
}

/** Reject application */
async function rejectApplicant(app: ApplicantDisplay) {
  const aid = app._raw?.application_id
  if (!aid) return
  rejectId.value = aid
  acceptRejectLoading.value = true
  try {
    const fd = new FormData()
    fd.append('status', 'Rejected')
    const res: any = await apiPostForm(END_POINTS.TRANSPORTER_JOB_ACCEPT_REJECT(aid), fd)
    if (res?.status) {
      app.status = 'rejected'
    }
  } catch (err) {
    console.error('Reject error:', err)
  } finally {
    rejectId.value = null
    acceptRejectLoading.value = false
  }
}

/** Call driver - log then open tel: */
async function callDriver(app: ApplicantDisplay) {
  const item = app?._raw
  const d = item?.driver_details
  const mobile = d?.driver_mobile
  if (!mobile) return
  callLoading.value = true
  try {
    const fd = new FormData()
    fd.append('id', String(d?.driver_id ?? ''))
    fd.append('job_id', String(item?.job_id ?? ''))
    await apiPostForm(END_POINTS.CALL_TRANSPORTER, fd)
  } catch {
    /* continue to open tel */
  } finally {
    callLoading.value = false
  }
  window.location.href = `tel:${mobile}`
  closeDriverDetails()
}

const toggleJob = (index: number) => {
  const j = jobs.value[index]
  if (j) j.expanded = !j.expanded
}

const setTab = (jobIndex: number, tab: 'all' | 'accepted' | 'rejected') => {
  const j = jobs.value[jobIndex]
  if (j) j.activeTab = tab
}

const getFilteredApplicants = (job: JobGroup) => {
  if (job.activeTab === 'all') return job.applicants
  return job.applicants.filter((a) => a.status === job.activeTab)
}

const getTabCounts = (job: JobGroup) => {
  const all = job.applicants.length
  const accepted = job.applicants.filter((a) => a.status === 'accepted').length
  const rejected = job.applicants.filter((a) => a.status === 'rejected').length
  return { all, accepted, rejected }
}

/** Filter jobs by search (client-side) */
const filteredJobs = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return jobs.value
  return jobs.value.filter(
    (j) =>
      j.fullTitle.toLowerCase().includes(q) ||
      j.id.toLowerCase().includes(q)
  )
})

const getScoreTrack = (score: number) => {
  const C = 113
  return C - (score / 100) * C
}

const getBadgeBorderColor = (badge: string | null | undefined): string => {
  switch (badge) {
    case 'trusted': return '#7c3aed'
    case 'verified': return '#2563eb'
    case 'job-ready': return '#e2e8f0'
    case 'legacy': return '#e2e8f0'
    default: return '#e2e8f0'
  }
}

const maskMobile = (m: string) => {
  if (!m || m.length < 4) return 'N/A'
  return `XXXXXX${m.slice(-4)}`
}
const maskEmail = (e: string) => {
  if (!e) return 'N/A'
  const [local, domain] = e.split('@')
  return local && domain ? `${local[0]}***@${domain}` : 'N/A'
}

onMounted(() => fetchJobs(1))
</script>

<template>
  <div class="va-body">
    <!-- Main Left Column -->
    <div class="va-main-col">

    <!-- Header -->
    <div class="va-header-area">
      <button class="back-btn" @click="emit('back')" title="Back">
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>
      <div class="page-title-row">
        <div class="page-title-icon">
          <FileText :size="22" color="#1e40af" />
        </div>
        <div>
          <h2 class="page-title">View Applications</h2>
          <p class="page-subtitle">Review and manage driver applications for your jobs</p>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="va-toolbar">
      <div class="search-wrapper">
        <Search class="search-icon" :size="18" />
        <input v-model="searchQuery" type="text" placeholder="Search by job title or ID..." class="search-input" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="va-loading">
      <Loader2 class="va-loading-spinner" :size="40" />
      <p>Loading applications...</p>
    </div>

    <!-- Job Accordion Cards -->
    <div v-else class="jobs-accordion">
      <div
        v-for="(job, jobIndex) in filteredJobs"
        :key="job.id"
        class="accordion-item"
        :class="{ expanded: job.expanded }"
        :style="{ animationDelay: jobIndex * 0.1 + 's' }"
      >
        <button class="accordion-header" @click="toggleJob(jobIndex)">
          <div class="acc-header-left">
            <div class="acc-truck-icon">🚛</div>
            <div class="acc-header-info">
              <h3 class="acc-title">{{ job.title }}</h3>
              <div class="acc-meta">
                <span class="acc-job-id">Job ID: {{ job.id }}</span>
                <span class="acc-dot">·</span>
                <span class="acc-count">{{ job.applicantCount }} Applicants</span>
              </div>
            </div>
          </div>
          <div class="acc-chevron" :class="{ rotated: job.expanded }">
            <ChevronDown :size="22" />
          </div>
        </button>

        <!-- Expanded Content -->
        <Transition name="expand">
          <div v-if="job.expanded" class="accordion-content">
            <!-- Tabs + View Toggle Row -->
            <div class="content-toolbar">
              <div class="app-tabs">
                <button class="tab-btn tab-all" :class="{ active: job.activeTab === 'all' }" @click="setTab(jobIndex, 'all')">
                  All <span class="tab-count">{{ getTabCounts(job).all }}</span>
                </button>
                <button class="tab-btn tab-accepted" :class="{ active: job.activeTab === 'accepted' }" @click="setTab(jobIndex, 'accepted')">
                  <CheckCircle :size="14" /> Accepted <span class="tab-count">{{ getTabCounts(job).accepted }}</span>
                </button>
                <button class="tab-btn tab-rejected" :class="{ active: job.activeTab === 'rejected' }" @click="setTab(jobIndex, 'rejected')">
                  <XCircle :size="14" /> Rejected <span class="tab-count">{{ getTabCounts(job).rejected }}</span>
                </button>
              </div>
              <div class="view-toggle">
                <button class="vt-btn" :class="{ active: job.viewMode === 'list' }" @click="job.viewMode = 'list'" title="List View">
                  <List :size="16" />
                </button>
                <button class="vt-btn" :class="{ active: job.viewMode === 'grid' }" @click="job.viewMode = 'grid'" title="Grid View">
                  <LayoutGrid :size="16" />
                </button>
              </div>
            </div>

            <!-- Applicant Cards -->
            <TransitionGroup name="card-anim" tag="div" class="applicants-container" :class="{ 'grid-mode': job.viewMode === 'grid' }">
              <div
                v-for="(app, i) in getFilteredApplicants(job)"
                :key="app.id"
                class="applicant-card"
                :class="{
                  'card-accepted': app.status === 'accepted',
                  'card-rejected': app.status === 'rejected',
                }"
                :style="{
                  animationDelay: i * 0.05 + 's',
                  borderColor: getBadgeBorderColor(app.badge),
                  borderWidth: '2px',
                }"
              >
                <!-- Driver Badge -->
                <div
                  class="driver-badge"
                  :class="{
                    'badge-trusted': app.badge === 'trusted',
                    'badge-verified': app.badge === 'verified',
                    'badge-job-ready': app.badge === 'job-ready',
                    'badge-legacy': app.badge === 'legacy',
                  }"
                  @mouseenter="showBadgePopup(jobIndex, app.id, app.badge)"
                  @mouseleave="hideBadgePopup"
                >
                  <Crown v-if="app.badge === 'trusted'" :size="13" />
                  <ShieldCheck v-else-if="app.badge === 'verified'" :size="13" />
                  <BadgeCheck v-else-if="app.badge === 'job-ready'" :size="13" />
                  <BadgeCheck v-else-if="app.badge === 'legacy'" :size="13" />
                  <span v-if="app.badge === 'trusted'">Trusted<br/>Driver</span>
                  <span v-else-if="app.badge === 'verified'">Verified<br/>Driver</span>
                  <span v-else-if="app.badge === 'job-ready'">Job Ready Driver</span>
                  <span v-else-if="app.badge === 'legacy'">Legacy Driver</span>

                  <!-- Badge Popup -->
                  <Transition name="popup-fade">
                    <div v-if="isBadgePopupVisible(jobIndex, app.id)" class="badge-popup" @click.stop>
                      <!-- TRUSTED POPUP -->
                      <template v-if="app.badge === 'trusted'">
                        <div class="popup-header">
                          <div class="popup-dot dot-purple"></div>
                          <h4>Trusted Driver – What does it mean?</h4>
                          <button class="popup-close" @click.stop="hideBadgePopup"><X :size="16" /></button>
                        </div>
                        <p class="popup-desc">Trusted Driver is a 100% verified and highly reliable driver on TruckMitr.</p>
                        <h5 class="popup-subtitle">Why this driver is Trusted?</h5>
                        <ul class="popup-checks">
                          <li class="check-pass"><CheckCircle :size="16" /> Government ID verified</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Face verification completed</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Court / criminal record check done</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Digital address verified</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Driving license verified</li>
                          <li class="check-star"><Star :size="16" /> High verification score &amp; trust rating</li>
                        </ul>
                        <div class="popup-best">
                          <strong>Best for:</strong> Transporters who want maximum safety, zero risk, and peace of mind while hiring drivers.
                        </div>
                        <div class="popup-tip">👉 <strong>Recommended for</strong> long trips, high-value goods, and critical assignments.</div>
                      </template>

                      <!-- VERIFIED POPUP -->
                      <template v-else-if="app.badge === 'verified'">
                        <div class="popup-header">
                          <div class="popup-dot dot-blue"></div>
                          <h4>Verified Driver – What does it mean?</h4>
                          <button class="popup-close" @click.stop="hideBadgePopup"><X :size="16" /></button>
                        </div>
                        <p class="popup-desc">Verified Driver is a background-checked driver with essential verifications completed.</p>
                        <h5 class="popup-subtitle">What is verified?</h5>
                        <ul class="popup-checks">
                          <li class="check-pass"><CheckCircle :size="16" /> Government ID verified</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Driving license verified</li>
                          <li class="check-warn"><AlertTriangle :size="16" /> Some advanced checks may be pending or optional</li>
                        </ul>
                        <div class="popup-best">
                          <strong>Best for:</strong> Transporters looking for quick hiring with basic safety assurance.
                        </div>
                        <div class="popup-tip">👉 <strong>Suitable for</strong> short routes, local trips, or urgent driver requirements.</div>
                      </template>

                      <!-- JOB READY POPUP -->
                      <template v-else-if="app.badge === 'job-ready'">
                        <div class="popup-header">
                          <div class="popup-dot dot-green"></div>
                          <h4>Job Ready Driver – What does it mean?</h4>
                          <button class="popup-close" @click.stop="hideBadgePopup"><X :size="16" /></button>
                        </div>
                        <p class="popup-desc">Job Ready Drivers are drivers who have completed their profile and are ready to work, but verification is not completed yet.</p>
                        <h5 class="popup-subtitle">What this means for you:</h5>
                        <ul class="popup-checks">
                          <li class="check-pass"><CheckCircle :size="16" /> Profile details filled (personal &amp; driving info)</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Actively looking for jobs</li>
                          <li class="check-fail"><XCircle :size="16" /> Background verification not completed yet</li>
                        </ul>
                        <div class="popup-best">
                          <strong>Best for:</strong> Transporters who need immediate driver availability and are comfortable proceeding without full verification.
                        </div>
                        <div class="popup-tip">👉 <strong>You may choose to</strong> verify documents manually before hiring.</div>
                      </template>

                      <!-- LEGACY POPUP -->
                      <template v-else-if="app.badge === 'legacy'">
                        <div class="popup-header">
                          <div class="popup-dot dot-brown"></div>
                          <h4>Legacy Driver – What does it mean?</h4>
                          <button class="popup-close" @click.stop="hideBadgePopup"><X :size="16" /></button>
                        </div>
                        <p class="popup-desc">Legacy Drivers are drivers who joined TruckMitr at a very early stage and have been part of the platform since the beginning.</p>
                        <h5 class="popup-subtitle">Why they are called Legacy Drivers:</h5>
                        <ul class="popup-checks">
                          <li class="check-pass"><CheckCircle :size="16" /> Early subscribers of TruckMitr</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Familiar with the app and its processes</li>
                          <li class="check-pass"><CheckCircle :size="16" /> Long-term association with the platform</li>
                        </ul>
                        <div class="popup-best">
                          <strong>Best for:</strong> Transporters who value experience, platform familiarity, and early trust built over time.
                        </div>
                        <div class="popup-tip">👉 <strong>Legacy status</strong> reflects loyalty, not verification level.</div>
                      </template>
                    </div>
                  </Transition>
                </div>

                <!-- Top Row -->
                <div class="app-top-row">
                  <div class="app-avatar-wrap">
                    <svg class="score-ring" width="62" height="62" viewBox="0 0 44 44">
                      <circle class="score-ring-bg" cx="22" cy="22" r="18" />
                      <circle class="score-ring-fill" cx="22" cy="22" r="18"
                        :style="{ strokeDashoffset: getScoreTrack(app.profileScore) }" />
                    </svg>
                    <img :src="app.avatar" :alt="app.name" class="app-avatar" />
                    <div class="score-label">{{ app.profileScore }}%</div>
                  </div>
                  <div class="app-info">
                    <h4 class="app-name">{{ app.name }}</h4>
                    <div class="app-tm-id">{{ app.tmId }}</div>
                    <div class="star-row">
                      <Star v-for="s in 5" :key="s" :size="14" :class="{ filled: s <= app.rating }" class="star-icon" />
                    </div>
                  </div>
                </div>

                <!-- Details -->
                <div class="app-details-block">
                  <div class="detail-line"><MapPin :size="13" class="detail-ico" /><span>Location: <strong>{{ app.location }}</strong></span></div>
                  <div class="detail-line"><CreditCard :size="13" class="detail-ico" /><span>License: <strong>{{ app.licenseType }}</strong></span></div>
                  <div class="detail-line"><Shield :size="13" class="detail-ico" /><span>License No.: <strong>{{ app.licenseNo }}</strong></span></div>
                  <div class="detail-line"><CalendarDays :size="13" class="detail-ico" /><span>License Exp: <strong>{{ app.licenseExp }}</strong></span></div>
                </div>

                <!-- Verification Checks -->
                <div class="verification-row">
                  <div class="vcheck" :class="{ pass: app.checks.id, fail: !app.checks.id }">
                    <component :is="app.checks.id ? CheckCircle : XCircle" :size="13" /> <span>ID</span>
                  </div>
                  <div class="vcheck" :class="{ pass: app.checks.face, fail: !app.checks.face }">
                    <component :is="app.checks.face ? CheckCircle : XCircle" :size="13" /> <span>Face</span>
                  </div>
                  <div class="vcheck" :class="{ pass: app.checks.court, fail: !app.checks.court }">
                    <component :is="app.checks.court ? CheckCircle : XCircle" :size="13" /> <span>Court</span>
                  </div>
                  <div class="vcheck" :class="{ pass: app.checks.digitalAddress, fail: !app.checks.digitalAddress }">
                    <component :is="app.checks.digitalAddress ? CheckCircle : XCircle" :size="13" /> <span>Digital Address</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="app-actions">
                  <button v-if="app.status === 'pending'" class="action-reject" :disabled="acceptRejectLoading" @click="rejectApplicant(app)">
                    <Loader2 v-if="rejectId === app.id" class="btn-loader" :size="14" />
                    <XCircle v-else :size="15" /> Reject
                  </button>
                  <button v-if="app.status === 'pending'" class="action-accept" :disabled="acceptRejectLoading" @click="acceptApplicant(app)">
                    <Loader2 v-if="acceptId === app.id" class="btn-loader" :size="14" />
                    <CheckCircle v-else :size="15" /> Accept
                  </button>
                  <span v-if="app.status === 'accepted'" class="accepted-label"><CheckCircle :size="15" /> Accepted</span>
                  <span v-if="app.status === 'rejected'" class="rejected-label"><XCircle :size="15" /> Rejected</span>
                </div>

                <button class="action-view-full" @click="selectedDriver = app">
                  <Eye :size="15" /> View Driver Details
                </button>
              </div>
            </TransitionGroup>

            <div v-if="getFilteredApplicants(job).length === 0" class="empty-tab">
              <span class="empty-emoji">📋</span>
              <p>No applicants in this category</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Empty State -->
      <div v-if="filteredJobs.length === 0" class="va-empty">
        <div class="va-empty-icon">📋</div>
        <h3>No applications yet</h3>
        <p>Applications from drivers will appear here when they apply to your jobs.</p>
      </div>

      <!-- Load More -->
      <div v-if="currentPage < lastPage && filteredJobs.length > 0" class="va-load-more">
        <button class="load-more-btn" :disabled="loadingMore" @click="loadMore">
          <Loader2 v-if="loadingMore" class="btn-loader" :size="18" />
          <span v-else>Load more</span>
        </button>
      </div>
    </div>

    </div>

    <!-- Right Side Panel for Driver Details -->
    <Transition name="panel-slide">
      <div v-if="selectedDriver" class="va-side-col">
        <div class="driver-modal-content">
          <button class="modal-close-icon" @click="closeDriverDetails">
            <X :size="20" />
          </button>
          
          <!-- Top Card: Avatar, Badge, Rating -->
          <div class="dm-header">
            <div class="dm-avatar-wrap">
              <img :src="selectedDriver.avatar" :alt="selectedDriver.name" class="dm-avatar" :style="{ borderColor: getBadgeBorderColor(selectedDriver.badge) }" />
              <div
                class="dm-badge"
                :class="{
                  'badge-trusted': selectedDriver.badge === 'trusted',
                  'badge-verified': selectedDriver.badge === 'verified',
                  'badge-job-ready': selectedDriver.badge === 'job-ready',
                  'badge-legacy': selectedDriver.badge === 'legacy',
                }"
              >
                <Crown v-if="selectedDriver.badge === 'trusted'" :size="11" />
                <ShieldCheck v-else-if="selectedDriver.badge === 'verified'" :size="11" />
                <BadgeCheck v-else-if="selectedDriver.badge === 'job-ready'" :size="11" />
                <BadgeCheck v-else-if="selectedDriver.badge === 'legacy'" :size="11" />
                <span v-if="selectedDriver.badge === 'trusted'">Trusted Driver</span>
                <span v-else-if="selectedDriver.badge === 'verified'">Verified Driver</span>
                <span v-else-if="selectedDriver.badge === 'job-ready'">Job Ready Driver</span>
                <span v-else-if="selectedDriver.badge === 'legacy'">Legacy Driver</span>
              </div>
            </div>

            <h3 class="dm-name">{{ selectedDriver.name }}</h3>
            <div class="dm-tmid">{{ selectedDriver.tmId }}</div>
            <div class="dm-rating-pill">
              <Star :size="13" class="star-filled" />
              <span>{{ selectedDriver.rating }}.0</span>
            </div>
          </div>

          <div class="dm-scroll-area">
            <!-- Contact Info -->
            <div class="dm-section">
              <div class="dm-sec-title"><PhoneCall :size="18" /> Contact Information</div>
              <div class="dm-sec-content">
                <div class="dm-row"><span>Email</span><strong>{{ selectedDriver._raw?.driver_details?.driver_email ? maskEmail(selectedDriver._raw.driver_details.driver_email) : 'N/A' }}</strong></div>
                <div class="dm-row"><span>Mobile</span><strong>{{ selectedDriver._raw?.driver_details?.driver_mobile ? maskMobile(selectedDriver._raw.driver_details.driver_mobile) : 'N/A' }}</strong></div>
              </div>
            </div>

            <!-- Personal Info -->
            <div class="dm-section">
              <div class="dm-sec-title"><User :size="18" /> Personal Information</div>
              <div class="dm-sec-content">
                <div class="dm-row"><span>Father's Name</span><strong>{{ selectedDriver._raw?.driver_details?.father_name || 'N/A' }}</strong></div>
                <div class="dm-row"><span>Date Of Birth</span><strong>{{ selectedDriver._raw?.driver_details?.dob ? new Date(selectedDriver._raw.driver_details.dob).toLocaleDateString('en-IN') : 'N/A' }}</strong></div>
                <div class="dm-row"><span>Gender</span><strong>{{ selectedDriver._raw?.driver_details?.gender || 'N/A' }}</strong></div>
                <div class="dm-row"><span>Marital Status</span><strong>{{ selectedDriver._raw?.driver_details?.marital_status || 'N/A' }}</strong></div>
                <div class="dm-row"><span>Education</span><strong>{{ selectedDriver._raw?.driver_details?.education || 'N/A' }}</strong></div>
              </div>
            </div>

            <!-- Address Details -->
            <div class="dm-section">
              <div class="dm-sec-title"><MapPin :size="18" /> Address Details</div>
              <div class="dm-sec-content">
                <div class="dm-row"><span>Address</span><strong>{{ selectedDriver._raw?.driver_details?.address || selectedDriver._raw?.driver_details?.full_address || 'N/A' }}</strong></div>
                <div class="dm-row"><span>Pincode</span><strong>{{ selectedDriver._raw?.driver_details?.pincode || 'N/A' }}</strong></div>
                <div class="dm-row"><span>District</span><strong>{{ selectedDriver._raw?.driver_details?.district || 'N/A' }}</strong></div>
                <div class="dm-row"><span>State</span><strong>{{ selectedDriver._raw?.driver_details?.states || selectedDriver._raw?.driver_details?.state || selectedDriver.location || 'N/A' }}</strong></div>
              </div>
            </div>

            <!-- Driving Details -->
            <div class="dm-section">
              <div class="dm-sec-title"><Briefcase :size="18" /> Driving Details</div>
              <div class="dm-sec-content">
                <div class="dm-row"><span>Vehicle Type</span><strong>{{ selectedDriver._raw?.driver_details?.vehicle_type || 'N/A' }}</strong></div>
                <div class="dm-row"><span>Driving Experience</span><strong>{{ selectedDriver.experience }}</strong></div>
                <div class="dm-row"><span>Preferred Location</span><strong>{{ selectedDriver.location }}</strong></div>
                <div class="dm-row"><span>License Type</span><strong>{{ selectedDriver.licenseType }}</strong></div>
              </div>
            </div>

            <!-- License Documents -->
            <div class="dm-section">
              <div class="dm-sec-title"><FileText :size="18" /> License Documents</div>
              <div class="dm-sec-content">
                <div class="dm-row"><span>License Type</span><strong>{{ selectedDriver.licenseType }}</strong></div>
                <div class="dm-row"><span>License No.</span><strong>{{ selectedDriver.licenseNo }}</strong></div>
                <div class="dm-row"><span>License Expiry</span><strong>{{ selectedDriver.licenseExp }}</strong></div>
                <div class="dm-row"><span>PAN Number</span><strong>{{ selectedDriver._raw?.driver_details?.pan ? (String(selectedDriver._raw.driver_details.pan).slice(0,2) + 'XXXXX' + String(selectedDriver._raw.driver_details.pan).slice(-2)) : 'N/A' }}</strong></div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="dm-footer">
            <button class="btn-call-driver" :disabled="callLoading" @click="callDriver(selectedDriver)">
              <Loader2 v-if="callLoading" class="btn-loader" :size="18" />
              <PhoneCall v-else :size="18" /> {{ callLoading ? 'Calling...' : 'Call Driver' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardPop { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes badgeShine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }

.expand-enter-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.expand-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 8000px; }

.card-anim-enter-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.card-anim-leave-active { transition: all 0.25s ease-in; }
.card-anim-enter-from { opacity: 0; transform: translateY(16px) scale(0.97); }
.card-anim-leave-to { opacity: 0; transform: translateX(-20px) scale(0.97); }

.popup-fade-enter-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.popup-fade-leave-active { transition: all 0.2s ease-in; }
.popup-fade-enter-from { opacity: 0; transform: translateY(8px) scale(0.95); }
.popup-fade-leave-to { opacity: 0; transform: translateY(4px) scale(0.98); }

/* ─── Body & Layout ─── */
.va-body {
  padding: 32px 40px 48px;
  display: flex; gap: 24px;
  font-family: 'Inter', sans-serif; color: #0f172a;
  min-height: 100%;
}
.va-main-col {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 24px;
}
.va-side-col {
  width: 420px; flex-shrink: 0;
}

/* ─── Header ─── */
.va-header-area { display: flex; flex-direction: column; align-items: flex-start; gap: 20px; }

.back-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 20px;
  border: 1px solid #e2e8f0; background: #ffffff;
  color: #475569; font-size: 13px; font-weight: 600;
  font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s;
}
.back-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; transform: translateX(-2px); }

.page-title-row { display: flex; align-items: center; gap: 14px; }

.page-title-icon {
  width: 48px; height: 48px; background: #eff6ff;
  border-radius: 14px; border: 1px solid #bfdbfe;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.page-title { margin: 0 0 2px 0; font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; }
.page-subtitle { margin: 0; font-size: 13px; color: #64748b; }

/* ─── Search ─── */
.va-toolbar { display: flex; align-items: center; gap: 16px; }
.search-wrapper { flex: 1; min-width: 280px; position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 16px; color: #94a3b8; pointer-events: none; transition: color 0.2s; }
.search-wrapper:focus-within .search-icon { color: #2563eb; }

.search-input {
  width: 100%; padding: 12px 16px 12px 44px;
  border: 1.5px solid #e2e8f0; border-radius: 14px;
  font-size: 14px; font-family: 'Inter', sans-serif;
  color: #0f172a; background: #f8fafc; outline: none; transition: all 0.25s;
}
.search-input:focus { background: #ffffff; border-color: #93c5fd; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08); }
.search-input::placeholder { color: #94a3b8; }

/* ─── Loading & Empty ─── */
.va-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; padding: 80px 24px; color: #64748b; font-size: 14px;
}
.va-loading-spinner { animation: spin 0.8s linear infinite; color: #2563eb; }
@keyframes spin { to { transform: rotate(360deg); } }
.va-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 60px 24px; text-align: center; color: #64748b;
}
.va-empty-icon { font-size: 48px; }
.va-empty h3 { margin: 0; font-size: 18px; color: #0f172a; }
.va-empty p { margin: 0; font-size: 14px; }
.va-load-more { display: flex; justify-content: center; padding: 24px; }
.load-more-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 12px; border: 1.5px solid #e2e8f0;
  background: #ffffff; color: #475569; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.load-more-btn:hover:not(:disabled) { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
.load-more-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-loader { animation: spin 0.8s linear infinite; }

/* ─── Accordion ─── */
.jobs-accordion { display: flex; flex-direction: column; gap: 16px; }

.accordion-item {
  border: 1.5px solid #e2e8f0; border-radius: 18px;
  background: #ffffff; overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: cardPop 0.45s ease-out backwards;
}
.accordion-item:hover { border-color: #c7d2fe; box-shadow: 0 4px 16px -4px rgba(37, 99, 235, 0.1); }
.accordion-item.expanded { border-color: #93c5fd; box-shadow: 0 8px 28px -6px rgba(37, 99, 235, 0.14); }

.accordion-header {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border: none;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: #ffffff; cursor: pointer; transition: all 0.25s; font-family: 'Inter', sans-serif;
}
.accordion-header:hover { background: linear-gradient(135deg, #172554, #1d4ed8); }

.acc-header-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.acc-truck-icon { font-size: 24px; flex-shrink: 0; }
.acc-header-info { flex: 1; min-width: 0; text-align: left; }
.acc-title { margin: 0 0 4px 0; font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #ffffff; }
.acc-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #bfdbfe; }
.acc-job-id { font-family: 'JetBrains Mono', monospace; font-weight: 500; }
.acc-dot { opacity: 0.5; }
.acc-count { font-weight: 600; }
.acc-chevron { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
.acc-chevron.rotated { transform: rotate(180deg); background: rgba(255,255,255,0.25); }

/* ─── Accordion Content ─── */
.accordion-content { padding: 20px 24px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }

/* ─── Content Toolbar: Tabs + View Toggle ─── */
.content-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.app-tabs { display: flex; gap: 8px; flex-wrap: wrap; }

.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; border: 1.5px solid #e2e8f0; border-radius: 12px;
  background: #ffffff; color: #64748b; font-size: 13px; font-weight: 600;
  font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.25s;
}
.tab-btn:hover { border-color: #bfdbfe; color: #1e40af; }

.tab-all.active { background: linear-gradient(135deg, #2563eb, #1e40af); color: #ffffff; border-color: transparent; box-shadow: 0 4px 12px -2px rgba(37,99,235,0.3); }
.tab-accepted.active { background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; border-color: transparent; box-shadow: 0 4px 12px -2px rgba(22,163,74,0.3); }
.tab-rejected.active { background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; border-color: transparent; box-shadow: 0 4px 12px -2px rgba(239,68,68,0.3); }

.tab-count { background: rgba(255,255,255,0.2); padding: 1px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; }
.tab-btn:not(.active) .tab-count { background: #f1f5f9; color: #475569; }

/* View Toggle */
.view-toggle { display: flex; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
.vt-btn {
  padding: 9px 12px; border: none; background: #ffffff; color: #94a3b8;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center;
}
.vt-btn.active { background: #eff6ff; color: #1e40af; }
.vt-btn:first-child { border-right: 1px solid #e2e8f0; }

/* ─── Applicants Container ─── */
.applicants-container {
  display: flex; flex-direction: column; gap: 16px;
}
.applicants-container.grid-mode {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

/* ─── Applicant Card ─── */
.applicant-card {
  background: #ffffff; border: 2px solid #e2e8f0; border-radius: 18px;
  padding: 22px; position: relative;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  animation: cardPop 0.4s ease-out backwards;
  display: flex; flex-direction: column; gap: 16px; overflow: visible;
  z-index: 1;
}
.applicant-card:hover { box-shadow: 0 8px 24px -6px rgba(37,99,235,0.12); transform: translateY(-2px); z-index: 20; }

/* ─── Driver Badges ─── */
.driver-badge {
  position: absolute; top: 0; right: 16px;
  padding: 6px 10px; border-radius: 0 0 10px 10px;
  font-size: 10px; font-weight: 800; color: #ffffff; text-align: center;
  line-height: 1.3; display: flex; align-items: center; gap: 4px;
  letter-spacing: 0.2px; z-index: 5; cursor: pointer;
}

.badge-trusted {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  box-shadow: 0 4px 12px -2px rgba(124,58,237,0.4);
}
.badge-trusted::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit;
  background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
  background-size: 200% 100%; animation: badgeShine 3s infinite;
}

.badge-verified {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 4px 12px -2px rgba(37,99,235,0.4);
}

.badge-job-ready {
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 4px 12px -2px rgba(22,163,74,0.4);
}

.badge-legacy {
  background: linear-gradient(135deg, #b45309, #92400e);
  box-shadow: 0 4px 12px -2px rgba(180,83,9,0.4);
}

/* ─── Badge Popup ─── */
.badge-popup {
  position: absolute;
  top: calc(100% + 8px);
  right: -8px;
  width: 290px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 40px -10px rgba(0,0,0,0.25), 0 4px 12px -4px rgba(0,0,0,0.1);
  padding: 16px;
  z-index: 100;
  cursor: default;
  color: #0f172a;
  text-align: left;
  font-weight: 400;
  border: 1px solid #e2e8f0;
}

.popup-header {
  display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px;
}
.popup-header h4 {
  margin: 0; font-size: 14px; font-weight: 700; flex: 1; line-height: 1.35;
}
.popup-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
}
.dot-purple { background: #7c3aed; }
.dot-blue { background: #2563eb; }
.dot-green { background: #16a34a; }
.dot-brown { background: #b45309; }

.popup-close {
  background: none; border: none; color: #94a3b8; cursor: pointer;
  padding: 2px; border-radius: 6px; transition: all 0.2s; flex-shrink: 0;
  margin-top: -2px; margin-right: -4px;
}
.popup-close:hover { color: #475569; background: #f1f5f9; }

.popup-desc {
  margin: 0 0 12px 0; font-size: 12px; color: #64748b; line-height: 1.4;
}

.popup-subtitle {
  margin: 0 0 8px 0; font-size: 12.5px; font-weight: 700; color: #0f172a;
}

.popup-checks {
  list-style: none; padding: 0; margin: 0 0 12px 0;
  display: flex; flex-direction: column; gap: 6px;
}
.popup-checks li {
  display: flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 500;
}
.check-pass { color: #16a34a; }
.check-fail { color: #ef4444; }
.check-warn { color: #d97706; }
.check-star { color: #f59e0b; }

.popup-best {
  font-size: 11.5px; color: #475569; line-height: 1.4;
  padding: 10px 0; border-top: 1px solid #f1f5f9; margin-bottom: 6px;
}
.popup-best strong { color: #0f172a; }

.popup-tip {
  font-size: 11.5px; color: #475569; line-height: 1.4;
}
.popup-tip strong { color: #0f172a; }

/* ─── Top Row ─── */
.app-top-row { display: flex; align-items: center; gap: 14px; padding-right: 90px; }

.app-avatar-wrap { position: relative; flex-shrink: 0; width: 62px; height: 62px; }

.score-ring { position: absolute; top: 0; left: 0; transform: rotate(-90deg); }
.score-ring-bg { fill: none; stroke: #e2e8f0; stroke-width: 2.5; }
.score-ring-fill {
  fill: none; stroke: #f97316; stroke-width: 2.5;
  stroke-dasharray: 113; stroke-linecap: round;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1);
}

.app-avatar {
  width: 46px; height: 46px; border-radius: 50%; object-fit: cover;
  position: absolute; top: 8px; left: 8px; border: 2px solid #ffffff;
}

.score-label {
  position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
  padding: 1px 7px; border-radius: 8px; font-size: 9px; font-weight: 800;
  color: #ffffff; background: #f97316; border: 2px solid #ffffff; z-index: 1; white-space: nowrap;
}

.app-info { flex: 1; min-width: 0; }
.app-name { margin: 0 0 2px 0; font-size: 15px; font-weight: 700; color: #0f172a; }
.app-tm-id { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; margin-bottom: 4px; }

.star-row { display: flex; gap: 2px; }
.star-icon { color: #d1d5db; fill: #d1d5db; }
.star-icon.filled { color: #f59e0b; fill: #f59e0b; }

/* ─── Details Block ─── */
.app-details-block {
  display: flex; flex-direction: column; gap: 6px;
  padding: 12px 14px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;
}
.detail-line { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #475569; }
.detail-ico { color: #94a3b8; flex-shrink: 0; }
.detail-line strong { color: #0f172a; }

/* ─── Verification Checks ─── */
.verification-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.vcheck { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }
.vcheck.pass { color: #16a34a; }
.vcheck.fail { color: #ef4444; }

/* ─── Actions ─── */
.app-actions { display: flex; align-items: center; gap: 10px; }

.action-reject {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 18px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff;
  font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif;
  cursor: pointer; transition: all 0.25s;
  box-shadow: 0 3px 10px -2px rgba(239,68,68,0.35);
}
.action-reject:hover { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 5px 14px -2px rgba(239,68,68,0.45); transform: translateY(-1px); }

.action-accept {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 18px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff;
  font-size: 13px; font-weight: 700; font-family: 'Inter', sans-serif;
  cursor: pointer; transition: all 0.25s;
  box-shadow: 0 3px 10px -2px rgba(34,197,94,0.35);
}
.action-accept:hover { background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 5px 14px -2px rgba(34,197,94,0.45); transform: translateY(-1px); }

.accepted-label {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 18px; border-radius: 12px; background: #ecfdf5;
  color: #16a34a; font-size: 13px; font-weight: 700; border: 1.5px solid #bbf7d0;
}

.rejected-label {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 18px; border-radius: 12px; background: #fef2f2;
  color: #dc2626; font-size: 13px; font-weight: 700; border: 1.5px solid #fecaca;
}

.action-view-full {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px 18px; border: 1.5px solid #e2e8f0; border-radius: 12px;
  background: #ffffff; color: #1e40af; font-size: 13px; font-weight: 700;
  font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.25s;
}
.action-view-full:hover { background: #eff6ff; border-color: #93c5fd; box-shadow: 0 4px 14px -4px rgba(37,99,235,0.2); transform: translateY(-1px); }

/* ─── Empty ─── */
.empty-tab { display: flex; flex-direction: column; align-items: center; padding: 48px 16px; text-align: center; }
.empty-emoji { font-size: 40px; margin-bottom: 12px; }
.empty-tab p { margin: 0; font-size: 14px; color: #64748b; font-weight: 500; }

/* ─── Driver Details Side Panel ─── */
.panel-slide-enter-active, .panel-slide-leave-active { transition: all 0.35s cubic-bezier(0.16,1,0.3,1); }
.panel-slide-enter-from, .panel-slide-leave-to { opacity: 0; transform: translateX(30px); }

.driver-modal-content {
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 100px);
  position: sticky;
  top: 32px;
  overflow: hidden;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

.modal-close-icon {
  position: absolute; top: 20px; left: 20px; background: transparent; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; z-index: 10;
}
.modal-close-icon:hover { background: #f1f5f9; color: #0f172a; }

.dm-header {
  display: flex; flex-direction: column; align-items: center; padding: 36px 24px 20px; background: #ffffff; border-bottom: 1px solid #f1f5f9;
}

.dm-avatar-wrap {
  position: relative; width: 84px; height: 84px; margin-bottom: 16px;
}
.dm-avatar {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid #e2e8f0; background: #f1f5f9;
}
.dm-badge {
  position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); padding: 5px 12px; border-radius: 12px; font-size: 10.5px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 4px; white-space: nowrap; box-shadow: 0 4px 10px -2px rgba(0,0,0,0.15);
}

.dm-name { margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #0f172a; display: flex; align-items: center; justify-content: center; }
.dm-tmid { margin: 0 0 12px 0; font-size: 13px; color: #64748b; font-weight: 500; }

.dm-rating-pill {
  display: flex; align-items: center; gap: 6px; background: #fef3c7; color: #b45309; padding: 5px 12px; border-radius: 14px; font-size: 13px; font-weight: 700;
}
.star-filled { fill: #f59e0b; color: #f59e0b; }

.dm-scroll-area {
  flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px;
}

.dm-section {
  background: #f8fafc; border: none; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; gap: 14px;
}
.dm-sec-title {
  display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 700; color: #1e40af; padding: 0 0 6px 0; background: transparent; border-bottom: none;
}
.dm-sec-content {
  padding: 0; display: flex; flex-direction: column; gap: 12px;
}
.dm-row {
  display: flex; justify-content: space-between; align-items: flex-start; font-size: 13px; line-height: 1.4;
}
.dm-row span { color: #64748b; font-weight: 500; flex: 1; padding-right: 16px; }
.dm-row strong { color: #0f172a; font-weight: 700; text-align: right; word-break: break-word; max-width: 60%; }

.dm-footer {
  padding: 20px 24px 24px; background: #ffffff; border-top: 1px solid #e2e8f0;
}
.btn-call-driver {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 15px; border: none; border-radius: 14px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.25s; box-shadow: 0 6px 16px -4px rgba(37,99,235,0.4);
}
.btn-call-driver:hover { background: linear-gradient(135deg, #1d4ed8, #1e40af); transform: translateY(-2px); box-shadow: 0 8px 20px -4px rgba(37,99,235,0.5); }
</style>
