/**
 * Job store - mirrors Redux job.reducer
 * Manages addJob (job draft for Add Job → Job Summary flow)
 */
import { defineStore } from 'pinia'

export interface JobDraftForm {
  title: string
  location: string
  pincode: string
  area: string
  route: string
  vehicleType: string
  experience: string
  license: string
  skills: string[]
  salary: string
  hasEsiPf: boolean | null
  hasFoodAllowance: boolean | null
  foodAllowanceAmount: string
  hasTripIncentive: boolean | null
  tripIncentiveAmount: string
  hasAccommodation: boolean | null
  hasMileage: boolean | null
  mileageValue: string
  hasFastag: boolean | null
  fastagAmount: string
  numberOfDrivers: string
  description: string
  truckCondition: string
  deadline: string
  consent: boolean
}

/** Raw job from TRANSPORTER_ALL_JOBS API (for edit flow) */
export interface ApiJob {
  job_id?: string
  id?: string | number
  job_title?: string
  Created_at?: string
  Salary_Range?: string
  job_location?: string | number
  number_of_drivers_required?: number
  Application_Deadline?: string
  application_deadline?: string
  active_inactive?: number
  status?: number
  subscription_plan_name?: string
  [key: string]: unknown
}

export const useJobStore = defineStore('job', {
  state: () => ({
    addJob: null as JobDraftForm | null,
    /** Job being edited (from ViewJobs list) */
    editingJob: null as ApiJob | null,
    /** Job ID for invite-drivers flow */
    inviteJobId: null as string | null,
  }),
  getters: {
    hasDraft: (state) => !!state.addJob,
    hasEditingJob: (state) => !!state.editingJob,
  },
  actions: {
    setAddJob(payload: JobDraftForm | null) {
      this.addJob = payload
    },
    clearAddJob() {
      this.addJob = null
    },
    setEditingJob(payload: ApiJob | null) {
      this.editingJob = payload
    },
    clearEditingJob() {
      this.editingJob = null
    },
    setInviteJobId(payload: string | null) {
      this.inviteJobId = payload
    },
    /** Clear all job-related state (e.g. when navigating to Add Job) */
    clearAll() {
      this.addJob = null
      this.editingJob = null
      this.inviteJobId = null
    },
  },
})
