// ── Base URLs
export const BASE_URL = 'https://development.truckmitr.com/'
// export const BASE_URL = 'https://truckmitr.com/'
// export const BASE_URL = 'http://192.168.29.156:8000/'
// export const BASE_URL = 'http://192.168.29.246:8000/'
// export const BASE_URL = 'https://devtruckmitr.in/'
export const DRIVER_KI_AWAZ_BASE = 'https://driverkiawaz.truckmitr.com/'
export const AWAZ_URL = 'https://truckmitr.com/'

export const STATICS = {
  RAYZORPAY_KEY_ID: 'rzp_live_sZcCjZPcBGzMSm',  // live
  RAYZORPAY_SECRET: 'Jo14oUIoX75fb0WJejakbRvQ', // live
  // RAYZORPAY_KEY_ID: 'rzp_test_bbrUGMV7qq3mYP',  // testing
  // RAYZORPAY_SECRET: 'fU9jFstLp7qdUkNC3KNhuMnS'  // testing
}

interface FilterState {
  stateId: string
  vehicle_type: string
  min_experience: string
  max_experience: string
  type_of_license: string
  min_rating: string
  max_rating: string
}

export const END_POINTS = {
  LOGIN: 'api/login',
  SIGNUP: 'api/signup',
  OTP_VERIFY: 'api/verifyOtp',
  LOGIN_OTP_VERIFY: 'api/verify-login-otp',
  GET_PROFILE: 'api/get-profile',
  LOGOUT: 'api/logout',
  GETSTATES: 'api/states',
  EDIT_PROFILE: 'api/profile/update',
  VEHICLE_TYPES: 'api/vehicle-types',
  VIDEO_MODULES: 'api/videos-modules',
  HEALTH_HYGINE: 'api/health-hygine',
  VIDEO_WATCH_ACTIVITY: 'api/video/watch-activity',
  RECOMMENDED_JOBS: 'api/jobs/recommended-jobs',
  ALL_JOBS_AND_SEARCH: (payload: any) => `api/jobs/all?search=${payload}`,
  JOBS_FILTER: (payload: any) => `api/jobs/filter?salary=${payload?.salary}&experience=${payload?.experience || ''}&job_location=${payload?.jobLocation || ''}`,
  JOB_THAT_SUITS_YOU: 'api/jobs-suits/jobs-by-state',
  APPLIED_JOBS: 'api/jobs/applied-jobs',
  APPLY_JOB: (payload: any) => `api/jobs/apply-jobs/${payload}`,
  QUIZ_LIST: 'api/quiz/list',
  ATTEMPT_QUIZ: 'api/quiz/attempt',
  QUIZ_RESULT: 'api/quiz/result',
  REATE_US: 'api/rate-us',
  DELETE_ACCOUNT: 'api/delete-account',
  PRIVACY_POLICY: 'api/privacy-policy',
  TERMS_AND_CONDITIONS: 'api/terms-and-conditions',
  DRIVER_CONSENT: 'api/driver-consent-for-job-application-data-sharing',
  TRANSPORTER_CONSENT: 'api/transporter-consent-for-job-posting-data-sharing',
  SUBSCRIPTION_CONSENT: 'api/subscription-consent-and-disclaimer',
  ACCEPTED_JOBS: 'api/jobs/accepted-jobs',
  ACCEPTED_JOBS_DRIVERS: 'api/jobs/accepted-jobs-drivers',
  CALL_LOGS_INITIATED: 'api/jobs/call-logs-initiated',
  TRANSPORTER_ADD_JOB: 'api/transporter/add-job',
  TRANSPORTER_EDIT_JOB: (id: any) => `api/transporter/edit-job/${id}`,
  TRANSPORTER_ALL_JOBS: (payload: any) => `api/all-jobs?search=${payload}`,
  JOB_UPDATE_STATUS: 'api/job/update-status',
  TRANSPORTER_APPLIED_JOBS_LIST: 'api/transporter/applied-jobs',
  TRANSPORTER_SCHEDULE_INTERVIEW: 'api/schedule/interview',
  TRANSPORTER_JOB_ACCEPT_REJECT: (id: any) => `api/transporter/job-application/${id}`,
  DRIVER_IMPORT: 'api/transporter/drivers/import',
  TRANSPORTER_DRIVER_CREATE: 'api/transporter/drivers/create',
  TRANSPORTER_DRIVERS: (payload: any) => `api/transporter/drivers?search=${payload}`,
  TRANSPORTER_UPDATE_DRIVERS_PROFILE: (payload: any) => `api/transporter/driver/update/${payload}`,
  TRANSPORTER_DELETE_DRIVERS: (payload: any) => `api/transporter/driver/delete/${payload}`,
  MOBILE_BANNERS: 'api/mobile-banners',

  PAYMENT_SUBSCRIPTION_CAPTURE: 'api/payment/subscription/capture',
  PAYMENT_SUBSCRIPTION_DETAILS: 'api/payment/subscription/details',
  PAYMENT_SUBSCRIPTION_CREATE: 'api/subscription/create',
  PAYMENT_SUBSCRIPTION_UPDATE: (role: any) => `api/subscription/plansByUser?role=${role}`,
  CANCEL_SUBSCRIPTION: 'api/subscription/cancel',

  SUBSCRIPTION_PLANS: (role: string) => `api/subscription/plans?role=${role}`,
  PUBLIC_SAVE_FCM_TOKEN: 'api/public/save-fcm-token',
  TRUCKMITRBANNERS: 'api/banners',
  GENERATECERTIFICATE: (id: any) => `api/certificates/${id}`,

  PAYMENT_SEND_INVOICE_EMAIL: 'api/payment/send-invoice-email',
  DRIVERVERIFICATIONSTATUS: 'api/driver-verification/status',
  DRIVERVERIFICATIONSTART: 'api/driver-verification/start',
  DRIVERVERIFICATIONUPLOADDOCUMENTS: 'api/driver-verification/upload-documents',
  DRIVERVERIFICATIONPAYMENTCAPTURE: 'api/driver-verification/payment/capture',
  DRIVERVERIFICATIONDLVERIFICATION: (user_id: any, dl_number: any) => `api/kyc/dl-verification?user_id=${user_id}&dl_number=${dl_number}`,
  DRIVERVERIFICATIONPANVERIFICATION: (user_id: any, pan_number: any) => `api/kyc/pan-verification?user_id=${user_id}&pan=${pan_number}`,
  SUBSCRIPTION_ORDER: 'api/subscription/order',

  // Transporter Verification Endpoints
  TRANSPORTER_BULK_VERIFICATION: 'api/driver-verification/transporter-bulk-verification',
  TRANSPORTER_VERIFICATION_CREATE_ORDER: 'api/driver-verification/create-order',
  TRANSPORTER_VERIFICATION_STATUS: 'api/driver-verification/transporter-status',
  TRANSPORTER_VERIFICATION_UPLOAD_DOCUMENTS: 'api/transporter-verification/upload-documents',
  TRANSPORTER_VERIFICATION_PAYMENT_CAPTURE: 'api/transporter-verification/payment/capture',
  CALLBACK_REQUEST: 'api/callback-request',
  TRANSPORTERINVITE: 'api/transporter/invite',
  TRANSPORTERDRIVERSEARCH: (search: string, page: number = 1, perPage: number = 10) =>
    `api/transporter/drivers_all?per_page=${perPage}&page=${page}&search=${search}`,
  TRANSPORTERDRIVERFILTER: (filters: FilterState, page: number = 1, perPage: number = 10) => {
    let url = `api/transporter/drivers_all?per_page=${perPage}&page=${page}`
    if (filters.stateId) url += `&stateId=${filters.stateId}`
    if (filters.vehicle_type) url += `&vehicle_type=${filters.vehicle_type}`
    if (filters.min_experience) url += `&min_experience=${filters.min_experience}`
    if (filters.max_experience) url += `&max_experience=${filters.max_experience}`
    if (filters.type_of_license) url += `&type_of_license=${filters.type_of_license}`
    if (filters.min_rating) url += `&min_rating=${filters.min_rating}`
    if (filters.max_rating) url += `&max_rating=${filters.max_rating}`
    return url
  },

  DRIVER_INVITES: 'api/driver/invites',
  RESPOND_INVITE: 'api/driver/respond-invite',
  TRANSPORTER_INVITES: 'api/transporter/accepted-drivers',
  POPUP_MESSAGE: 'api/popup-messages',
  MOBILE_POPUP: 'api/mobile-popup',
  GET_ACTIVE_SURVEY: (role: any) => `api/surveys/active?role=${role}`,
  SUBMIT_SURVEY_RESPONSE: 'api/surveys/submit-response',

  CREATE_ORDER: 'api/payment/create-order',
  PAYMENT_DETAIL: 'api/orders/payments_details',
  REFERRAL: 'api/referrals/send',
  CALL_TRANSPORTER: 'api/call-logs/logCallTransporter',
  VIDEO_CALL_TRANSPORTER: 'api/call-logs/video-interview',
  DRIVER_INTERVIEW: 'api/driver/interviews',
  INVOICE_DOWNLOAD: (payment_id: any) => `api/invoice/${payment_id}`,
  GET_DRIVERS_PROFILE: (driver_id: any) => `api/profile?driver_id=${driver_id}`,
  DRIVER_UPLOAD_DOCUMENTS_BY_TRANSPORTER: (driver_id: any) => `api/driver-verification/upload-documents?driver_id=${driver_id}`,
  VERIFICATION_VIDEO: 'api/driver-verification/verification-video',
  LOG_USER_EVENT: 'api/user-logs',
  COURT_CHECK_CASE_STATUS: 'api/kyc/courtcheck/addcase',
  COURT_CHECK_AND_REPORT: 'api/kyc/courtcheck/case-results-with-reports',

  // Driving License Verification
  DL_VERIFY: 'api/kyc/dl',
  PAN_VERIFY: 'api/kyc/pan',
  AADHAAR_VERIFY: 'api/kyc/aadhaar',
  AADHAAR_MASKING: 'api/kyc/aadhar-masking',
  AADHAAR_VERIFICATION_STATUS: 'api/kyc/aadhar-verification',
  AADHAAR_PAN_MATCH: 'api/kyc/aadhar-pan-match',
  VOTER_VERIFY: 'api/kyc/voter',
  CHALLAN_VERIFY: 'api/kyc/challan',
  DIGITAL_ADDRESS_VERIFY: 'api/kyc/dav',
  DAV_PROFILE: 'api/kyc/dav-profile',
  CHALLAN_HISTORY: 'api/kyc/challans',
  COURT_CASE: (user_id: any) => `api/kyc/court-case/user_id/${user_id}`,
  CHALLAN_VERIFY_VEHICLE_NUMBER: (vehicle_number: any) => `api/kyc/challan/${vehicle_number}`,

  // RC Verification
  RC_VERIFY: 'api/kyc/rc',
  RC_HISTORY: 'api/kyc/rcs',

  // Face Match Verification
  FACE_MATCH_VERIFY: 'api/kyc/face-match/verify',

  // Document Verification (DigiLocker)
  DOC_VERIFY: 'api/kyc/doc-verify',
  // Driver ki Awaz

  DKA_POST: `${DRIVER_KI_AWAZ_BASE}api/feed/post`,
  DKA_FEED: `${DRIVER_KI_AWAZ_BASE}api/feed`,
  DKA_STREAM: `${DRIVER_KI_AWAZ_BASE}api/feed/stream`,
  DKA_LIKE: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/feed/${id}/like`,
  DKA_COMMENT: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/feed/${id}/comment`,
  DKA_GET_COMMENTS: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/feed/${id}/getcomments`,
  DKA_SHARE: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/feed/${id}/share`,
  DKA_EDIT_POST: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/feed/${id}`,
  DKA_DELETE_POST: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/feed/${id}`,
  DKA_USER_FEED: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/feed/user/${id}`,
  DKA_USER_DASHBOARD: (id: any) => `${DRIVER_KI_AWAZ_BASE}api/users/${id}/dashboard`,
  TRUCKER_AVAILABLE_LOADS: 'api/trucker/available-loads',
  TRUCKER_DASHBOARD_STATS: 'api/trucker/dashboard-stats',
  TRUCKER_APPLIED_LOADS: 'api/trucker/applied-loads',
  TRUCKER_APPLY_LOAD: 'api/trucker/apply-load',
  TRUCKER_GET_VEHICLES: 'api/trucker/get-vehicles',
  TRUCKER_GET_DRIVERS: 'api/trucker/get-drivers',
  TRUCKER_TRACKING: (id: any) => `api/trucker/tracking?load_id=${id}`,
  TRUCKER_TRACKING_DASHBOARD: (id: any) => `api/trucker/tracking-dashboard?load_id=${id}`,
  TRUCKER_START_TRIP: 'api/trucker/start-trip',
  TRUCKER_UPDATE_STATUS: 'api/trucker/update-status',
  TRUCKER_UPDATE_LOCATION: 'api/trucker/update-location',
  TRUCKER_UPLOAD_BUILTY: 'api/trucker/upload-builty',
  TRUCKER_UPLOAD_POD: 'api/trucker/upload-pod',
  TRUCKER_UPDATE_VEHICLE_NUMBER: 'api/trucker/update-vehicle-number',
  TRUCKER_BANK_DETAILS_FETCH: 'api/bank-details',
  TRUCKER_BANK_DETAILS_UPDATE: 'api/bank-details/update',
  TRUCKER_PAYMENT_HISTORY: (page: any = 1) => `api/payment/payment-history?page=${page}`,
  TRUCKER_VEHICLE_BODY_LIST: 'api/trucker/vehicle-body-list',
  TRUCKER_VEHICLE_TYPE_LIST: 'api/trucker/vehicle-type-list',
  TRUCKER_VERIFY_RC: 'api/kyc/rc',
  TRUCKER_ADD_VEHICLE: 'api/trucker/add-vehicle',
}

// ── Bearer token storage
const AUTH_TOKEN_KEY = 'truckmitr_auth_token'
const USER_KEY = 'truckmitr_user'

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function setUser(user: object) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): object | null {
  try {
    const saved = localStorage.getItem(USER_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}

// ── Build full URL from endpoint
function buildUrl(endpoint: string): string {
  const base = BASE_URL.replace(/\/$/, '')
  const path = endpoint.charAt(0) === '/' ? endpoint : `/${endpoint}`
  return `${base}${path}`
}

// ── Common headers
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
  const token = getAuthToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiOptions {
  method?: ApiMethod
  body?: FormData | Record<string, unknown> | null
  headers?: Record<string, string>
}

/**
 * Generic API fetch with bearer token support.
 * Use END_POINTS for endpoint paths.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'POST', body, headers: extraHeaders = {} } = options
  const url = buildUrl(endpoint)
  const headers = { ...getHeaders(), ...extraHeaders }

  // For FormData, don't set Content-Type (browser sets it with boundary)
  const isFormData = body instanceof FormData
  if (!isFormData && body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json'
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'omit',
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(url, config)

  let data: any
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server connection error (Status ${response.status})`)
  }

  if (!response.ok) {
    throw new Error(data.message || `API request failed with status ${response.status}`)
  }

  return data as T
}

/**
 * POST with FormData (for login, file uploads, etc.)
 */
export async function apiPostForm<T = unknown>(endpoint: string, formData: FormData): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'POST', body: formData })
}

/**
 * POST with JSON body
 */
export async function apiPost<T = unknown>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'POST', body: body ?? null })
}

/**
 * GET request
 */
export async function apiGet<T = unknown>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'GET' })
}

/**
 * PUT request
 */
export async function apiPut<T = unknown>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'PUT', body: body ?? null })
}

/**
 * PATCH request
 */
export async function apiPatch<T = unknown>(endpoint: string, body?: Record<string, unknown>): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'PATCH', body: body ?? null })
}

/**
 * DELETE request
 */
export async function apiDelete<T = unknown>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'DELETE' })
}
