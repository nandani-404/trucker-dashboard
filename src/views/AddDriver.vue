<script setup lang="ts">
import { ref } from 'vue'
import { 
  ArrowLeft, User, Phone, Mail, MapPin, ChevronDown, 
  PlusCircle, Download, FileText, Upload, Users, 
  FileSpreadsheet, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-vue-next'

const emit = defineEmits(['back'])

type TabType = 'single' | 'bulk'
const activeTab = ref<TabType>('single')

const form = ref({
  fullName: '',
  mobile: '',
  email: '',
  state: ''
})

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

const handleAddDriver = () => {
  if (!form.value.fullName || !form.value.mobile || !form.value.state) {
    alert("Please fill all mandatory fields.")
    return
  }
  console.log('Driver Details:', form.value)
  alert("Driver Added Successfully!")
  emit('back')
}

const handleBulkUpload = () => {
  // Mock function for bulk import submit
  alert("Bulk driver data template submitted successfully!")
  emit('back')
}
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
                        <option v-for="st in states" :key="st" :value="st">{{ st }}</option>
                      </select>
                      <ChevronDown :size="18" class="dropdown-icon" />
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn-primary full-width-btn">
                    <PlusCircle :size="18" /> Register Driver
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
                  <button class="btn-outline">
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

                <div class="upload-dropzone">
                  <div class="dz-icon">
                    <Upload :size="28" color="#1d4ed8" />
                  </div>
                  <h3>Click to browse or drag file here</h3>
                  <p>Maximum file size: 10MB</p>
                  <button class="btn-browse">Browse Files</button>
                </div>
                
                <div class="info-alert">
                  <AlertCircle :size="18" class="text-blue" />
                  <p>Duplicate mobile numbers will be automatically bypassed to prevent repetition.</p>
                </div>
                
                <!-- Bulk Actions -->
                <div class="form-actions mt-4">
                  <button @click="handleBulkUpload" class="btn-primary full-width-btn">
                    <Upload :size="18" /> Process Bulk Import
                  </button>
                </div>

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
