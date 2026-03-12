<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle,
  CloudUpload,
} from 'lucide-vue-next'
import {
  fetchVerificationStatus,
  getDriverImageUrl,
  fetchDriverProfile,
  uploadDriverDocuments,
  type VerificationDriver,
} from '../../../services/verification/verificationApi'

const emit = defineEmits(['back', 'navigate'])

const loading = ref(true)
const drivers = ref<VerificationDriver[]>([])
const showUploadModal = ref(false)
const selectedDriver = ref<VerificationDriver | null>(null)
const uploadLoading = ref(false)
const formData = ref({
  name: '',
  Aadhar_Number: '',
  PAN_Number: '',
  address: '',
  License_Number: '',
  Expiry_date_of_License: '',
  Aadhar_Photo: null as File | null,
  Driving_License: null as File | null,
  PAN_Image: null as File | null,
})
const formErrors = ref<Record<string, string>>({})
const consentChecked = ref(false)

const pendingDrivers = computed(() =>
  drivers.value.filter((d) => !d?.documents?.all_uploaded)
)
const startedDrivers = computed(() =>
  drivers.value.filter((d) => d?.documents?.all_uploaded)
)
const activeTab = ref<'pending' | 'started'>('pending')
const displayList = computed(() =>
  activeTab.value === 'pending' ? pendingDrivers.value : startedDrivers.value
)

const getStatusText = (status?: string) => {
  switch (status) {
    case 'verified':
      return 'Verified'
    case 'rejected':
      return 'Rejected'
    case 'in_progress':
      return 'In Progress'
    default:
      return 'Pending'
  }
}

const getStatusClass = (status?: string) => {
  switch (status) {
    case 'verified':
      return 'verified'
    case 'rejected':
      return 'rejected'
    case 'in_progress':
      return 'in-progress'
    default:
      return 'pending'
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchVerificationStatus()
    drivers.value = res?.data || []
  } catch {
    drivers.value = []
  } finally {
    loading.value = false
  }
}

const openUploadModal = async (driver: VerificationDriver) => {
  selectedDriver.value = driver
  showUploadModal.value = true
  formData.value = {
    name: '',
    Aadhar_Number: '',
    PAN_Number: '',
    address: '',
    License_Number: '',
    Expiry_date_of_License: '',
    Aadhar_Photo: null,
    Driving_License: null,
    PAN_Image: null,
  }
  formErrors.value = {}
  consentChecked.value = false
  try {
    const profile = await fetchDriverProfile(String(driver.driver_id))
    formData.value = {
      name: String(profile?.name ?? ''),
      Aadhar_Number: String(profile?.Aadhar_Number ?? ''),
      PAN_Number: String(profile?.PAN_Number ?? ''),
      address: String(profile?.address ?? ''),
      License_Number: String(profile?.License_Number ?? ''),
      Expiry_date_of_License: (() => {
        const v = profile?.Expiry_date_of_License
        if (!v) return new Date().toISOString().slice(0, 10)
        const d = typeof v === 'string' ? new Date(v) : v instanceof Date ? v : new Date(String(v))
        return isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10)
      })(),
      Aadhar_Photo: null,
      Driving_License: null,
      PAN_Image: null,
    }
  } catch {
    formData.value.Expiry_date_of_License = new Date().toISOString().slice(0, 10)
  }
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedDriver.value = null
}

const onFileChange = (
  e: Event,
  field: 'Aadhar_Photo' | 'Driving_License' | 'PAN_Image'
) => {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (file) {
    formData.value = { ...formData.value, [field]: file }
    formErrors.value = { ...formErrors.value, [field]: '' }
  }
}

const validate = (): boolean => {
  const err: Record<string, string> = {}
  if (!formData.value.name?.trim()) err.name = 'Full name is required'
  if (!formData.value.Aadhar_Number?.trim()) err.aadharNumber = 'Aadhaar number is required'
  if (!formData.value.License_Number?.trim()) err.licenseNumber = 'License number is required'
  if (!formData.value.PAN_Number?.trim()) err.panNumber = 'PAN number is required'
  if (!formData.value.address?.trim()) err.address = 'Address is required'
  if (!formData.value.Aadhar_Photo) err.aadharPhoto = 'Aadhaar photo is required'
  if (!formData.value.Driving_License) err.drivingLicense = 'Driving license is required'
  if (!formData.value.PAN_Image) err.panImage = 'PAN image is required'
  if (!consentChecked.value) err.consent = 'Please accept the consent'
  formErrors.value = err
  return Object.keys(err).length === 0
}

const submitUpload = async () => {
  if (!validate() || !selectedDriver.value) return
  uploadLoading.value = true
  try {
    const fd = new FormData()
    fd.append('driver_id', String(selectedDriver.value.driver_id))
    fd.append('name', formData.value.name)
    fd.append('Aadhar_Number', formData.value.Aadhar_Number)
    fd.append('License_Number', formData.value.License_Number)
    fd.append('PAN_Number', formData.value.PAN_Number)
    fd.append('address', formData.value.address)
    fd.append('Expiry_date_of_License', formData.value.Expiry_date_of_License)
    if (formData.value.Aadhar_Photo)
      fd.append('Aadhar_Photo', formData.value.Aadhar_Photo)
    if (formData.value.Driving_License)
      fd.append('Driving_License', formData.value.Driving_License)
    if (formData.value.PAN_Image) fd.append('PAN_Image', formData.value.PAN_Image)

    const res = await uploadDriverDocuments(
      String(selectedDriver.value.driver_id),
      fd
    )
    if (res?.success) {
      closeUploadModal()
      fetchData()
    } else {
      alert(res?.message || 'Upload failed')
    }
  } catch (e) {
    console.error('Upload error:', e)
    alert('Upload failed. Please try again.')
  } finally {
    uploadLoading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="docs-master">
    <header class="page-header">
      <button class="icon-back-btn" @click="emit('back')" title="Go Back">
        <ArrowLeft :size="20" />
      </button>
      <div class="header-titles">
        <h1 class="main-title">Upload Driver Documents</h1>
        <p class="sub-title">
          Upload verification documents for drivers you've paid to verify.
        </p>
      </div>
    </header>

    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        Documents Pending
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'started' }"
        @click="activeTab = 'started'"
      >
        Verification Started
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 class="spin" :size="36" />
      <span>Loading...</span>
    </div>

    <div v-else-if="displayList.length === 0" class="empty-state">
      <CloudUpload :size="48" />
      <p>No drivers in this section.</p>
      <p class="hint">
        {{ activeTab === 'pending' ? 'Select drivers and complete payment from Verify Driver.' : 'Upload documents to move drivers here.' }}
      </p>
    </div>

    <div v-else class="driver-list">
      <div
        v-for="d in displayList"
        :key="d.driver_id"
        class="driver-card"
      >
        <img
          :src="getDriverImageUrl(d.images)"
          alt=""
          class="driver-avatar"
        />
        <div class="driver-info">
          <span class="driver-name">{{ d.driver_name }}</span>
          <span class="driver-id">{{ d.driver_unique_id }}</span>
          <span
            class="status-badge"
            :class="getStatusClass(d.overall_status)"
          >
            {{ getStatusText(d.overall_status) }}
          </span>
        </div>
        <div v-if="!d?.documents?.all_uploaded || d.overall_status === 'rejected'" class="driver-actions">
          <button class="btn-upload" @click="openUploadModal(d)">
            <Upload :size="16" />
            Upload Documents
          </button>
        </div>
        <div v-else-if="d?.documents?.all_uploaded && d.overall_status === 'pending'" class="uploaded-badge">
          <CheckCircle :size="16" />
          Documents Uploaded
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showUploadModal"
          class="modal-overlay"
          @click.self="closeUploadModal"
        >
          <div class="modal-content upload-modal">
            <div class="modal-header">
              <h3>Upload Documents</h3>
              <button class="close-btn" @click="closeUploadModal">
                <X :size="24" />
              </button>
            </div>
            <div class="modal-body">
              <p class="driver-name-modal">{{ selectedDriver?.driver_name }}</p>
              <div class="form-group">
                <label>Full Name *</label>
                <input v-model="formData.name" type="text" placeholder="Enter full name" />
                <span v-if="formErrors.name" class="error">{{ formErrors.name }}</span>
              </div>
              <div class="form-group">
                <label>Aadhaar Number *</label>
                <input v-model="formData.Aadhar_Number" type="text" placeholder="Enter Aadhaar" />
                <span v-if="formErrors.aadharNumber" class="error">{{ formErrors.aadharNumber }}</span>
              </div>
              <div class="form-group">
                <label>License Number *</label>
                <input v-model="formData.License_Number" type="text" placeholder="Enter license number" />
                <span v-if="formErrors.licenseNumber" class="error">{{ formErrors.licenseNumber }}</span>
              </div>
              <div class="form-group">
                <label>PAN Number *</label>
                <input v-model="formData.PAN_Number" type="text" placeholder="Enter PAN" />
                <span v-if="formErrors.panNumber" class="error">{{ formErrors.panNumber }}</span>
              </div>
              <div class="form-group">
                <label>Address *</label>
                <textarea v-model="formData.address" rows="3" placeholder="Enter address" />
                <span v-if="formErrors.address" class="error">{{ formErrors.address }}</span>
              </div>
              <div class="form-group">
                <label>License Expiry *</label>
                <input v-model="formData.Expiry_date_of_License" type="date" />
              </div>
              <div class="form-group">
                <label>Aadhaar Photo *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  @change="(e) => onFileChange(e, 'Aadhar_Photo')"
                />
                <span v-if="formData.Aadhar_Photo" class="file-name">{{ formData.Aadhar_Photo.name }}</span>
                <span v-if="formErrors.aadharPhoto" class="error">{{ formErrors.aadharPhoto }}</span>
              </div>
              <div class="form-group">
                <label>Driving License *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  @change="(e) => onFileChange(e, 'Driving_License')"
                />
                <span v-if="formData.Driving_License" class="file-name">{{ formData.Driving_License.name }}</span>
                <span v-if="formErrors.drivingLicense" class="error">{{ formErrors.drivingLicense }}</span>
              </div>
              <div class="form-group">
                <label>PAN Image *</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  @change="(e) => onFileChange(e, 'PAN_Image')"
                />
                <span v-if="formData.PAN_Image" class="file-name">{{ formData.PAN_Image.name }}</span>
                <span v-if="formErrors.panImage" class="error">{{ formErrors.panImage }}</span>
              </div>
              <div class="consent-row">
                <input
                  id="consent"
                  v-model="consentChecked"
                  type="checkbox"
                />
                <label for="consent">
                  I confirm that the information provided is accurate and I consent to the verification process.
                </label>
              </div>
              <span v-if="formErrors.consent" class="error">{{ formErrors.consent }}</span>
              <button
                class="btn-submit"
                :disabled="uploadLoading"
                @click="submitUpload"
              >
                <Loader2 v-if="uploadLoading" class="spin" :size="18" />
                <span v-else>Submit Documents</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.docs-master {
  padding: 40px;
  background: #fff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}
.icon-back-btn {
  width: 44px;
  height: 44px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-back-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.main-title {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}
.sub-title {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}
.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.tab {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.tab.active {
  background: #1e40af;
  color: #fff;
  border-color: #1e40af;
}
.loading-state,
.empty-state {
  padding: 48px;
  text-align: center;
  color: #64748b;
}
.loading-state .spin,
.btn-submit .spin {
  animation: spin 1s linear infinite;
}
.empty-state .hint {
  font-size: 13px;
  margin-top: 8px;
  color: #94a3b8;
}
.driver-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.driver-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
}
.driver-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.driver-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.driver-name {
  font-weight: 600;
  color: #0f172a;
}
.driver-id {
  font-size: 13px;
  color: #64748b;
}
.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  align-self: flex-start;
}
.status-badge.verified {
  background: #dcfce7;
  color: #166534;
}
.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}
.status-badge.in-progress {
  background: #fef3c7;
  color: #92400e;
}
.status-badge.pending {
  background: #f1f5f9;
  color: #475569;
}
.btn-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #1e40af;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-upload:hover {
  background: #1d4ed8;
}
.uploaded-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.upload-modal {
  background: #fff;
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.close-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #64748b;
  display: flex;
}
.modal-body {
  padding: 24px;
}
.driver-name-modal {
  font-weight: 600;
  margin-bottom: 20px;
  color: #0f172a;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
}
.form-group input[type='file'] {
  padding: 8px;
}
.file-name {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}
.error {
  display: block;
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
}
.consent-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 20px 0 16px;
}
.consent-row input {
  margin-top: 4px;
}
.consent-row label {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}
.btn-submit {
  width: 100%;
  padding: 14px;
  background: #1e40af;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-submit:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
