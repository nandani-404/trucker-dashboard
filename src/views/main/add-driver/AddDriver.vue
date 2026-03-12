<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  PlusCircle,
  Download,
  Upload,
  FileSpreadsheet,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next'
import { apiGet, apiPostForm, END_POINTS, BASE_URL } from '../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

type TabType = 'single' | 'bulk'
const activeTab = ref<TabType>('single')

const form = ref({
  fullName: '',
  mobile: '',
  email: '',
  state: '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const locations = ref<{ id?: number; name?: string }[]>([])
const loading = ref(false)
const bulkLoading = ref(false)
const bulkFile = ref<File | null>(null)
const bulkError = ref('')
const bulkErrorModal = ref(false)
const bulkErrorList = ref<{ row: string; message: string }[]>([])
const bulkErrorTitle = ref('')

/** Fetch states from API */
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

function validate(): boolean {
  if (!form.value.fullName?.trim()) {
    alert('Please enter the driver\'s full name.')
    return false
  }
  if (!form.value.mobile?.trim()) {
    alert('Please enter the mobile number.')
    return false
  }
  if (form.value.mobile.replace(/\D/g, '').length < 10) {
    alert('Mobile number must be at least 10 digits.')
    return false
  }
  if (form.value.email?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      alert('Please enter a valid email address.')
      return false
    }
  }
  if (!form.value.state) {
    alert('Please select a state.')
    return false
  }
  return true
}

async function handleAddDriver() {
  if (!validate()) return
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('name', form.value.fullName.trim())
    fd.append('mobile', form.value.mobile.trim())
    fd.append('email', form.value.email?.trim() || '')
    fd.append('states', form.value.state)
    const res: any = await apiPostForm(END_POINTS.TRANSPORTER_DRIVER_CREATE, fd)
    if (res?.success) {
      alert('Driver added successfully!')
      form.value = { fullName: '', mobile: '', email: '', state: '' }
      emit('navigate', 'driver-list')
    } else {
      alert(res?.message || 'Failed to add driver')
    }
  } catch (err: any) {
    console.error('Add driver error:', err)
    alert(err?.message || 'Something went wrong')
  } finally {
    loading.value = false
  }
}

/** Download template - use public URL if available */
const TEMPLATE_URL = `${BASE_URL.replace(/\/$/, '')}/public/Bulk-Driver-Registration-Format.xlsx`

function handleDownloadTemplate() {
  window.open(TEMPLATE_URL, '_blank')
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const isValid = file.name?.toLowerCase().endsWith('.xlsx') || file.type?.includes('sheet')
  if (!isValid) {
    bulkError.value = 'Please select a valid .xlsx Excel file.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    bulkError.value = 'File size must be under 10MB.'
    return
  }
  bulkFile.value = file
  bulkError.value = ''
  input.value = ''
}

function clearBulkFile() {
  bulkFile.value = null
  bulkError.value = ''
}

async function handleBulkUpload() {
  if (!bulkFile.value) {
    bulkError.value = 'Please select an Excel file to upload.'
    return
  }
  bulkLoading.value = true
  bulkError.value = ''
  bulkErrorModal.value = false
  try {
    const fd = new FormData()
    fd.append('file', bulkFile.value)
    const res: any = await apiPostForm(END_POINTS.DRIVER_IMPORT, fd)
    if (res?.success) {
      alert('File uploaded successfully!')
      bulkFile.value = null
      emit('navigate', 'driver-list')
    } else {
      bulkErrorTitle.value = res?.message || 'Upload failed'
      const errs = res?.errors
      if (errs && typeof errs === 'object') {
        bulkErrorList.value = Object.entries(errs).map(([row, message]) => ({
          row,
          message: String(message),
        }))
      } else {
        bulkErrorList.value = []
      }
      bulkErrorModal.value = true
    }
  } catch (err: any) {
    console.error('Bulk upload error:', err)
    bulkError.value = err?.message || 'Upload failed'
  } finally {
    bulkLoading.value = false
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const isValid = file.name?.toLowerCase().endsWith('.xlsx') || file.type?.includes('sheet')
  if (!isValid) {
    bulkError.value = 'Please select a valid .xlsx Excel file.'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    bulkError.value = 'File size must be under 10MB.'
    return
  }
  bulkFile.value = file
  bulkError.value = ''
}

onMounted(() => fetchLocations())
</script>

<template>
  <div class="add-driver-master">
    <div class="page-container">
      <!-- Top Header -->
      <header class="page-header">
        <button class="icon-back-btn" @click="emit('back')" title="Go Back">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-titles">
          <h1 class="main-title">Add New Driver</h1>
          <p class="sub-title">Register an individual driver safely or scale up with a bulk import worksheet.</p>
        </div>
      </header>

      <!-- Unified Card Layout -->
      <div class="unified-container">
        
        <!-- Sidebar Navigation (Inside the card) -->
        <aside class="sidebar-nav">
          <h3 class="nav-heading">Entry Method</h3>
          <div class="nav-menu">
            <button 
              class="nav-btn" 
              :class="{ active: activeTab === 'single' }" 
              @click="activeTab = 'single'"
            >
              <div class="nav-btn-icon"><User :size="18" /></div>
              <div class="nav-btn-text">
                <span class="nav-title">Manual Entry</span>
                <span class="nav-desc">Add one at a time</span>
              </div>
            </button>

            <button 
              class="nav-btn" 
              :class="{ active: activeTab === 'bulk' }" 
              @click="activeTab = 'bulk'"
            >
              <div class="nav-btn-icon"><FileSpreadsheet :size="18" /></div>
              <div class="nav-btn-text">
                <span class="nav-title">Bulk Import</span>
                <span class="nav-desc">Upload via Excel</span>
              </div>
            </button>
          </div>
          
          <div class="nav-footer-info">
            <ShieldCheck :size="18" class="text-green" />
            <p>All driver data is end-to-end encrypted and secured.</p>
          </div>
        </aside>

        <!-- Right Content Area (Inside the card) -->
        <main class="content-area">
          <transition name="fade-slide" mode="out-in">

            <!-- Single Driver Entry -->
            <div v-if="activeTab === 'single'" key="single" class="content-wrapper">
              <div class="content-header">
                <div class="header-icon-box blue-box">
                  <User :size="24" color="#1d4ed8" />
                </div>
                <div>
                  <h2>Manual Driver Registration</h2>
                  <p>Provide the essential details to set up a new driver profile in the network.</p>
                </div>
              </div>

              <form @submit.prevent="handleAddDriver" class="unified-form">
                <div class="form-grid">
                  <div class="input-cell full-width">
                    <label>Full Name <span class="required">*</span></label>
                    <div class="custom-input-box">
                      <User :size="18" class="c-icon" />
                      <input type="text" v-model="form.fullName" placeholder="e.g. Rahul Kumar" required />
                    </div>
                  </div>
                  
                  <div class="input-cell">
                    <label>Mobile Number <span class="required">*</span></label>
                    <div class="custom-input-box">
                      <Phone :size="18" class="c-icon" />
                      <input type="tel" v-model="form.mobile" placeholder="e.g. 9876543210" required />
                    </div>
                  </div>
                  
                  <div class="input-cell">
                    <label>E-mail Address</label>
                    <div class="custom-input-box">
                      <Mail :size="18" class="c-icon" />
                      <input type="email" v-model="form.email" placeholder="e.g. rahul@example.com" />
                    </div>
                  </div>
                  
                  <div class="input-cell full-width">
                    <label>State <span class="required">*</span></label>
                    <div class="custom-input-box">
                      <MapPin :size="18" class="c-icon" />
                      <select v-model="form.state" required>
                        <option value="" disabled>Select the state of operation</option>
                        <option v-for="loc in locations" :key="loc.id ?? loc.name" :value="String(loc.id ?? loc.name ?? '')">{{ loc.name }}</option>
                      </select>
                      <ChevronDown :size="18" class="dropdown-icon" />
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary full-width-btn" :disabled="loading">
                    <Loader2 v-if="loading" class="btn-loader" :size="18" />
                    <PlusCircle v-else :size="18" /> {{ loading ? 'Registering...' : 'Register Driver' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Bulk Excel Upload -->
            <div v-else key="bulk" class="content-wrapper">
              <div class="content-header">
                <div class="header-icon-box green-box">
                  <FileSpreadsheet :size="24" color="#059669" />
                </div>
                <div>
                  <h2>Bulk Excel Import</h2>
                  <p>Instantly add multiple drivers by uploading a structured dataset.</p>
                </div>
              </div>

              <div class="bulk-steps-container">
                
                <div class="step-item">
                  <div class="step-num">1</div>
                  <div class="step-info">
                    <h3>Download Standard Template</h3>
                    <p>We require a specific layout for columns and State Codes. Please use our template.</p>
                  </div>
                  <button type="button" class="btn-outline" @click="handleDownloadTemplate">
                    <Download :size="16" /> Download
                  </button>
                </div>
                
                <div class="step-connector"></div>

                <div class="step-item">
                  <div class="step-num">2</div>
                  <div class="step-info">
                    <h3>Upload Completed File</h3>
                    <p>Ensure your file is in .xlsx format and under 10MB.</p>
                  </div>
                </div>

                <div
                  class="upload-dropzone"
                  :class="{ 'has-file': bulkFile }"
                  @click="!bulkFile && fileInput?.click()"
                  @dragover.prevent
                  @drop.prevent="onDrop"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    class="hidden-input"
                    @change="onFileSelected"
                  />
                  <template v-if="bulkFile">
                    <div class="dz-file-info">
                      <FileSpreadsheet :size="32" color="#059669" />
                      <div class="dz-file-details">
                        <strong>{{ bulkFile.name }}</strong>
                        <span>{{ formatBytes(bulkFile.size) }}</span>
                      </div>
                      <button type="button" class="dz-remove" @click.stop="clearBulkFile">×</button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="dz-icon">
                      <Upload :size="28" color="#1d4ed8" />
                    </div>
                    <h3>Click to browse or drag file here</h3>
                    <p>Maximum file size: 10MB • .xlsx only</p>
                    <button type="button" class="btn-browse" @click.stop="fileInput?.click()">Browse Files</button>
                  </template>
                </div>
                <p v-if="bulkError" class="bulk-error">{{ bulkError }}</p>
                
                <div class="info-alert">
                  <AlertCircle :size="18" class="text-blue" />
                  <p>Duplicate mobile numbers will be automatically bypassed to prevent repetition.</p>
                </div>
                
                <!-- Bulk Actions -->
                <div class="form-actions mt-4">
                  <button @click="handleBulkUpload" class="btn-primary full-width-btn" :disabled="!bulkFile || bulkLoading">
                    <Loader2 v-if="bulkLoading" class="btn-loader" :size="18" />
                    <Upload v-else :size="18" /> {{ bulkLoading ? 'Processing...' : 'Process Bulk Import' }}
                  </button>
                </div>

                <!-- Bulk Error Modal -->
                <Teleport to="body">
                  <Transition name="modal-fade">
                    <div v-if="bulkErrorModal" class="modal-overlay" @click.self="bulkErrorModal = false">
                      <div class="modal-content">
                        <h3>File Import Errors</h3>
                        <p class="modal-subtitle">{{ bulkErrorTitle }}</p>
                        <div v-if="bulkErrorList.length" class="modal-error-list">
                          <div v-for="(err, i) in bulkErrorList" :key="i" class="modal-error-item">
                            <span class="err-row">Row {{ err.row }}</span>
                            <span class="err-msg">{{ err.message }}</span>
                          </div>
                        </div>
                        <button class="btn-primary mt-3" @click="bulkErrorModal = false">Close</button>
                      </div>
                    </div>
                  </Transition>
                </Teleport>

              </div>
            </div>

          </transition>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.add-driver-master {
  padding: 40px;
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
}

.page-container {
  max-width: 1000px; /* Constrains the entire UI perfectly */
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
}

.icon-back-btn {
  width: 44px; height: 44px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  margin-top: 4px; 
}

.icon-back-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
  transform: translateX(-2px);
}

.main-title {
  margin: 0 0 6px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.sub-title {
  margin: 0;
  font-size: 15px;
  color: #64748b;
}

/* Unified Container Master Card */
.unified-container {
  display: flex;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
  overflow: hidden;
  min-height: 600px;
  animation: fadeUpIn 0.5s ease-out;
}

@media (max-width: 768px) {
  .unified-container {
    flex-direction: column;
  }
}

/* Sidebar Navigation Inside Card */
.sidebar-nav {
  width: 280px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .sidebar-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 24px;
  }
}

.nav-heading {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0 0 16px 12px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.nav-btn:hover {
  background: #f1f5f9;
}

.nav-btn.active {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.nav-btn-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #e2e8f0;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}

.nav-btn.active .nav-btn-icon {
  background: #eff6ff; 
  color: #1d4ed8;
}

.nav-btn-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.nav-btn.active .nav-title {
  color: #1d4ed8;
}

.nav-desc {
  font-size: 12px;
  color: #64748b;
}

.nav-footer-info {
  margin-top: auto;
  padding: 20px;
  background: #f0fdf4;
  border-radius: 12px;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.nav-footer-info .text-green {
  color: #059669;
  flex-shrink: 0;
  margin-top: 2px;
}

.nav-footer-info p {
  margin: 0;
  font-size: 13px;
  color: #065f46;
  line-height: 1.5;
}

/* Content Area */
.content-area {
  flex: 1;
  padding: 48px;
  background: #ffffff;
}

@media (max-width: 640px) {
  .content-area {
    padding: 24px;
  }
}

.content-wrapper {
  max-width: 540px;
}

.content-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 40px;
}

.header-icon-box {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.blue-box { background: #eff6ff; border: 1px solid #bfdbfe; }
.green-box { background: #ecfdf5; border: 1px solid #a7f3d0; }

.content-header h2 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.content-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

/* Unified Form */
.unified-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.input-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-cell label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.required {
  color: #ef4444;
}

.custom-input-box {
  position: relative;
  display: flex;
  align-items: center;
}

.c-icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
  pointer-events: none;
  transition: color 0.2s;
}

.custom-input-box input,
.custom-input-box select {
  width: 100%;
  padding: 14px 16px 14px 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  color: #0f172a;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-input-box input:focus,
.custom-input-box select:focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.custom-input-box input:focus ~ .c-icon,
.custom-input-box select:focus ~ .c-icon {
  color: #3b82f6;
}

.custom-input-box select {
  appearance: none;
  cursor: pointer;
  padding-right: 40px;
}

.dropdown-icon {
  position: absolute;
  right: 16px;
  color: #64748b;
  pointer-events: none;
}

.form-actions {
  margin-top: 32px;
  display: flex;
  width: 100%;
}

.mt-4 {
  margin-top: 40px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25);
}

.full-width-btn {
  width: 100%; /* Force it to stretch in bulk view for impact */
  padding: 16px 28px; 
}

.btn-primary:hover {
  background: #1e40af;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(29, 78, 216, 0.3);
}

/* Bulk Upload Enhancements */
.bulk-steps-container {
  display: flex;
  flex-direction: column;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.step-num {
  width: 32px; height: 32px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-info {
  flex: 1;
}

.step-info h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.step-info p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 16px;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-outline:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

.step-connector {
  width: 2px;
  height: 24px;
  background: #e2e8f0;
  margin: 12px 0 12px 15px;
}

.upload-dropzone {
  margin-top: 24px;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 48px; /* inset to align with text */
}

@media (max-width: 640px) {
  .upload-dropzone { margin-left: 0; margin-top: 16px;}
}

.upload-dropzone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dz-icon {
  width: 56px; height: 56px;
  background: #ffffff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.upload-dropzone h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.upload-dropzone p {
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #64748b;
}

.btn-browse {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-dropzone:hover .btn-browse {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #ffffff;
}

.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.upload-dropzone.has-file {
  padding: 20px;
}

.dz-file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
}

.dz-file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dz-file-details strong {
  font-size: 14px;
  color: #0f172a;
}

.dz-file-details span {
  font-size: 12px;
  color: #64748b;
}

.dz-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.dz-remove:hover {
  background: #fee2e2;
}

.bulk-error {
  margin: 12px 0 0 48px;
  font-size: 13px;
  color: #dc2626;
}

@media (max-width: 640px) {
  .bulk-error { margin-left: 0; }
}

.btn-loader {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 24px;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.modal-subtitle {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #64748b;
}

.modal-error-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.modal-error-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
}

.err-row {
  font-size: 12px;
  font-weight: 600;
  color: #991b1b;
}

.err-msg {
  font-size: 13px;
  color: #7f1d1d;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.mt-3 { margin-top: 16px; }

.info-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 16px;
  border-radius: 12px;
  margin-top: 24px;
}

.text-blue {
  color: #2563eb;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-alert p {
  margin: 0;
  font-size: 13px;
  color: #1e3a8a;
  line-height: 1.5;
}

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

@keyframes fadeUpIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
