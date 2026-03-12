/**
 * Driver Invites API service
 * Mirrors all-driver-list mobile flow
 */
import { apiGet, apiPost, apiPostForm, END_POINTS, BASE_URL } from '../config/api'

export interface FilterState {
  stateId: string
  vehicle_type: string
  min_experience: string
  max_experience: string
  type_of_license: string
  min_rating: string
  max_rating: string
}

export interface DriverItem {
  id: number
  unique_id?: string
  name?: string
  mobile?: string
  images?: string
  status?: string
  average_rating?: number
  state_name?: string
  Driving_Experience?: string
  Type_of_License?: string
  vehicle_type_name?: string
  [key: string]: unknown
}

export interface JobItem {
  id: number
  job_id?: string
  job_title?: string
  job_location?: string
  Required_Experience?: string
  Salary_Range?: string
  Type_of_License?: string
  vehicle_type?: string
  Preferred_Skills?: string
  active_inactive?: number
  status?: string
  [key: string]: unknown
}

export interface InviteItem {
  id: number
  transporter_id: number
  job_id: string
  driver_id: number
  status: string
  created_at: string
  updated_at: string
  driver: DriverItem
  job: JobItem
}

export interface TransporterInvitesResponse {
  status?: boolean
  accepted?: InviteItem[]
  pending?: InviteItem[]
  rejected?: InviteItem[]
}

export interface DriversAllResponse {
  status?: boolean
  data?: {
    data?: DriverItem[]
    last_page?: number
    current_page?: number
  }
}

function buildDriversUrl(params: {
  search?: string
  page?: number
  perPage?: number
  jobId?: string
  filters?: FilterState
}): string {
  const { search = '', page = 1, perPage = 10, jobId, filters = {} } = params
  let url = `api/transporter/drivers_all?per_page=${perPage}&page=${page}`
  if (search) url += `&search=${encodeURIComponent(search)}`
  if (jobId) url += `&jobId=${encodeURIComponent(jobId)}`
  if (filters.stateId) url += `&stateId=${filters.stateId}`
  if (filters.vehicle_type) url += `&vehicle_type=${filters.vehicle_type}`
  if (filters.min_experience) url += `&min_experience=${filters.min_experience}`
  if (filters.max_experience) url += `&max_experience=${filters.max_experience}`
  if (filters.type_of_license) url += `&type_of_license=${encodeURIComponent(filters.type_of_license)}`
  if (filters.min_rating) url += `&min_rating=${filters.min_rating}`
  if (filters.max_rating) url += `&max_rating=${filters.max_rating}`
  return url
}

/** Fetch all drivers with search and filters */
export async function fetchDrivers(params: {
  search?: string
  page?: number
  perPage?: number
  jobId?: string
  filters?: FilterState
}): Promise<{ drivers: DriverItem[]; lastPage: number }> {
  const url = buildDriversUrl(params)
  const res = await apiGet<DriversAllResponse>(url)
  if (!res?.status || !res?.data) {
    return { drivers: [], lastPage: 1 }
  }
  const pagination = res.data
  const drivers = pagination?.data || []
  const lastPage = pagination?.last_page ?? 1
  return { drivers, lastPage }
}

/** Fetch transporter invites (accepted, pending, rejected) */
export async function fetchTransporterInvites(): Promise<InviteItem[]> {
  const res = await apiGet<TransporterInvitesResponse>(END_POINTS.TRANSPORTER_INVITES)
  if (!res?.status) return []
  const accepted = res.accepted || []
  const pending = res.pending || []
  const rejected = res.rejected || []
  return [...pending, ...accepted, ...rejected]
}

/** Invite driver to job */
export async function inviteDriverToJob(driverId: number, jobId: string): Promise<{ message?: string }> {
  const formData = new FormData()
  formData.append('driver_id', String(driverId))
  formData.append('job_id', jobId)
  const res = await apiPostForm<{ status?: boolean; message?: string }>(END_POINTS.TRANSPORTERINVITE, formData)
  return { message: (res as { message?: string })?.message }
}

/** Fetch transporter's jobs for invite selection */
export async function fetchTransporterJobs(): Promise<JobItem[]> {
  const res = await apiGet<{ status?: boolean; data?: JobItem[] }>(END_POINTS.TRANSPORTER_ALL_JOBS(''))
  if (!res?.status || !Array.isArray((res as { data?: JobItem[] }).data)) return []
  const allJobs = (res as { data: JobItem[] }).data
  return allJobs.filter(
    (job) =>
      job.active_inactive === 1 ||
      job.active_inactive === '1' ||
      (job.status || '').toLowerCase() === 'active'
  )
}

/** Log call to driver */
export async function logCallToDriver(driverId: number, jobId: string): Promise<void> {
  const formData = new FormData()
  formData.append('id', String(driverId))
  formData.append('job_id', jobId)
  await apiPostForm(END_POINTS.CALL_TRANSPORTER, formData)
}

/** Get driver image URL */
export function getDriverImageUrl(images?: string, avatar?: string): string {
  if (images) return `${BASE_URL.replace(/\/$/, '')}/public/${images}`
  if (avatar) return `${BASE_URL.replace(/\/$/, '')}/public/${avatar}`
  return 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'
}

export interface StateItem {
  id: number
  name: string
  [key: string]: unknown
}

export interface VehicleTypeItem {
  id: number
  vehicle_name: string
  [key: string]: unknown
}

/** Fetch states for filter */
export async function fetchStates(): Promise<StateItem[]> {
  const res = await apiGet<{ status?: boolean; data?: StateItem[] }>(END_POINTS.GETSTATES)
  if (res?.status && Array.isArray((res as { data?: StateItem[] }).data)) {
    return (res as { data: StateItem[] }).data
  }
  return []
}

/** Fetch vehicle types for filter */
export async function fetchVehicleTypes(): Promise<VehicleTypeItem[]> {
  const res = await apiGet<{ status?: boolean; data?: VehicleTypeItem[] }>(END_POINTS.VEHICLE_TYPES)
  if (res?.status && Array.isArray((res as { data?: VehicleTypeItem[] }).data)) {
    return (res as { data: VehicleTypeItem[] }).data
  }
  return []
}
