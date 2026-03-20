<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowLeft, User, Phone, Mail, 
  MapPin, ChevronDown, CheckCircle, 
  Users, Loader2, Plus
} from 'lucide-vue-next'
import { apiGet, apiPostForm, END_POINTS } from '../../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

// --- Form State ---
const form = ref({
  fullName: '',
  mobile: '',
  email: '',
  state: ''
})

const states = ref<any[]>([])
const loading = ref(false)
const successMessage = ref('')

// --- Fetch States ---
const fetchStates = async () => {
    try {
        const res: any = await apiGet(END_POINTS.GETSTATES)
        if (res?.status && Array.isArray(res?.data)) {
            states.value = res.data
        }
    } catch (err) {
        console.error('Error fetching states:', err)
    }
}

onMounted(fetchStates)

// --- Validation ---
const validate = () => {
    if (!form.value.fullName.trim()) return 'Name is required'
    if (!form.value.mobile.trim()) return 'Mobile number is required'
    if (form.value.mobile.length < 10) return 'Invalid mobile number'
    if (!form.value.state) return 'Please select a state'
    return null
}

// --- Submit ---
const handleAddDriver = async () => {
    const error = validate()
    if (error) {
        alert(error)
        return
    }

    loading.value = true
    try {
        const fd = new FormData()
        fd.append('name', form.value.fullName.trim())
        fd.append('mobile', form.value.mobile.trim())
        fd.append('email', form.value.email.trim())
        fd.append('states', form.value.state)

        const res: any = await apiPostForm(END_POINTS.TRANSPORTER_DRIVER_CREATE, fd)
        if (res?.success) {
            successMessage.value = 'Driver has been successfully added to your network!'
            form.value = { fullName: '', mobile: '', email: '', state: '' }
            setTimeout(() => { successMessage.value = '' }, 5000)
        } else {
            alert(res?.message || 'Failed to add driver')
        }
    } catch (err) {
        console.error('Error adding driver:', err)
        alert('An error occurred. Please try again.')
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="add-driver-view">
    <!-- HEADER -->
    <header class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="title-group">
          <h1>Add Driver</h1>
          <p>Register a new driver to your fleet</p>
        </div>
      </div>
      <button class="btn-secondary" @click="emit('navigate', 'driver-list')">
        <Users :size="18" />
        <span>My Drivers</span>
      </button>
    </header>

    <main class="content-wrapper">
      <!-- LEFT SIDEBAR -->
      <aside class="info-sidebar">
        <div class="sidebar-hero">
            <div class="hero-icon">
                <User :size="32" stroke-width="2.5" />
            </div>
            <h2>Driver Identity</h2>
            <p>Onboard your drivers to assign them shipments, track progress, and manage settlements efficiently.</p>
        </div>

        <div class="sidebar-features">
            <div class="feature-item">
                <CheckCircle :size="18" class="feat-icon" />
                <span>Real-time trip tracking</span>
            </div>
            <div class="feature-item">
                <CheckCircle :size="18" class="feat-icon" />
                <span>Digital document management</span>
            </div>
            <div class="feature-item">
                <CheckCircle :size="18" class="feat-icon" />
                <span>Instant load assignments</span>
            </div>
        </div>
      </aside>

      <!-- RIGHT FORM -->
      <div class="form-card">

        <form @submit.prevent="handleAddDriver" class="driver-form">
          <div class="form-grid">
            <!-- Full Name -->
            <div class="input-group full-width">
              <label>Full Name <span class="req">*</span></label>
              <div class="input-wrapper">
                <User :size="18" class="icon" />
                <input 
                  type="text" 
                  v-model="form.fullName" 
                  placeholder="Enter Full Name" 
                  required
                />
              </div>
            </div>

            <!-- Mobile -->
            <div class="input-group">
              <label>Mobile <span class="req">*</span></label>
              <div class="input-wrapper">
                <Phone :size="18" class="icon" />
                <input 
                  type="tel" 
                  v-model="form.mobile" 
                  placeholder="Enter Mobile" 
                  maxlength="10"
                  required
                />
              </div>
            </div>

            <!-- Email -->
            <div class="input-group">
              <label>E-mail</label>
              <div class="input-wrapper">
                <Mail :size="18" class="icon" />
                <input 
                  type="email" 
                  v-model="form.email" 
                  placeholder="Enter E-mail"
                />
              </div>
            </div>

            <!-- State -->
            <div class="input-group full-width">
              <label>State <span class="req">*</span></label>
              <div class="input-wrapper select-wrapper">
                <MapPin :size="18" class="icon" />
                <select v-model="form.state" required>
                  <option value="" disabled selected>Select State</option>
                  <option v-for="s in states" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
                <ChevronDown :size="18" class="chevron" />
              </div>
            </div>
          </div>

          <!-- SUCCESS MESSAGE -->
          <Transition name="fade">
            <div v-if="successMessage" class="success-alert">
              <CheckCircle :size="18" />
              <span>{{ successMessage }}</span>
            </div>
          </Transition>

          <!-- ACTIONS -->
          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="loading">
              <Loader2 v-if="loading" :size="20" class="spin" />
              <Plus v-else :size="20" />
              <span>{{ loading ? 'Adding Driver...' : 'Add Driver' }}</span>
            </button>
          </div>
        </form>
      </div>

    </main>
  </div>
</template>

<style scoped>
.add-driver-view {
  min-height: 100vh;
  background-color: #ffffff;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

/* Header */
.page-header {
  height: 80px; padding: 0 40px; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
  background: white; position: sticky; top: 0; z-index: 50;
}
.header-left { display: flex; align-items: center; gap: 20px; }
.btn-back {
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s; background: white;
}
.btn-back:hover { background: #f8fafc; transform: translateX(-2px); }
.title-group h1 { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.title-group p { font-size: 13px; color: #64748b; font-weight: 500; }

.btn-secondary {
  height: 44px; padding: 0 20px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: #f8fafc; color: #1e293b; font-weight: 700; display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: all 0.2s;
}
.btn-secondary:hover { background: #f1f5f9; border-color: #cbd5e1; }

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px; margin: 0 auto; padding: 40px;
  display: flex; gap: 40px; align-items: flex-start;
  position: relative;
}

/* Left Info Side */
.info-sidebar {
    flex: 0 0 380px;
    background: #f8fafc;
    border-radius: 32px;
    padding: 40px;
    border: 1px solid #e2e8f0;
    position: sticky; top: 120px;
}

.sidebar-hero { margin-bottom: 32px; }
.hero-icon {
    width: 64px; height: 64px; background: #eff6ff; color: #2563eb;
    border-radius: 20px; display: flex; align-items: center; justify-content: center;
    margin-bottom: 24px;
}
.info-sidebar h2 { font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.info-sidebar p { font-size: 15px; color: #64748b; line-height: 1.6; margin-top: 12px; }

.sidebar-features { margin-top: 40px; display: flex; flex-direction: column; gap: 20px; }
.feature-item { display: flex; align-items: center; gap: 12px; color: #475569; font-weight: 600; font-size: 14px; }
.feat-icon { color: #10b981; }

/* Form Card (Right Side) */
.form-card {
  flex: 1; background: #ffffff;
  border: 1px solid #e2e8f0; border-radius: 32px;
  padding: 48px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  animation: slideLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }

/* Form Grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.full-width { grid-column: span 2; }

.input-group { display: flex; flex-direction: column; gap: 8px; }
.input-group label { font-size: 14px; font-weight: 700; color: #475569; }
.req { color: #ef4444; margin-left: 2px; }

.input-wrapper { position: relative; display: flex; align-items: center; }
.input-wrapper .icon { position: absolute; left: 16px; color: #94a3b8; transition: all 0.2s; }
.input-wrapper input, .input-wrapper select {
  width: 100%; height: 54px; padding: 0 16px 0 48px; border-radius: 16px;
  border: 1px solid #e2e8f0; background: #f8fafc; outline: none; transition: all 0.2s;
  font-size: 15px; font-weight: 500; font-family: inherit;
}
.input-wrapper input:focus, .input-wrapper select:focus {
  background: white; border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}
.input-wrapper input:focus + .icon, .input-wrapper select:focus + .icon { color: #2563eb; }

.select-wrapper select { appearance: none; cursor: pointer; }
.chevron { position: absolute; right: 16px; color: #64748b; pointer-events: none; }

/* Success Alert */
.success-alert {
  margin-top: 24px; padding: 16px; background: #ecfdf5; border: 1px solid #34d399;
  border-radius: 12px; color: #065f46; display: flex; align-items: center; gap: 12px;
  font-size: 14px; font-weight: 600;
}

/* Actions */
.form-actions { margin-top: 40px; }
.btn-submit {
  width: 100%; height: 56px; background: #1e40af; color: white; border: none;
  border-radius: 16px; font-size: 16px; font-weight: 800; display: flex;
  align-items: center; justify-content: center; gap: 12px; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(30, 64, 175, 0.2);
}
.btn-submit:hover { background: #1e3a8a; transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(30, 64, 175, 0.25); }
.btn-submit:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .page-header { padding: 0 20px; }
  .content-wrapper { padding: 40px 20px; }
  .form-card { padding: 30px 20px; }
  .form-grid { grid-template-columns: 1fr; }
  .title-group p { display: none; }
}
</style>
