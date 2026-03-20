<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowLeft, CreditCard, Building2, 
  User, ShieldCheck, MapPin, 
  ChevronDown, CheckCircle, 
  Edit3, Save, Loader2, Info
} from 'lucide-vue-next'
import { apiGet, apiPost, END_POINTS } from '../../../../services/config/api'

const emit = defineEmits(['back'])

// --- State ---
const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)
const successMessage = ref('')

const bankData = ref({
  account_number: '',
  account_holder_name: '',
  bank_name: '',
  branch_name: '',
  ifsc_code: '',
  account_type: '',
})

// --- Fetch Data ---
const fetchBankDetails = async () => {
    try {
        loading.value = true
        const res: any = await apiGet(END_POINTS.TRUCKER_BANK_DETAILS_FETCH)
        if (res?.status) {
            const dataArray = res?.data || []
            if (dataArray.length > 0) {
                const data = dataArray[0]
                bankData.value = {
                    account_number: data?.account_number || '',
                    account_holder_name: data?.account_holder_name || '',
                    bank_name: data?.bank_name || '',
                    branch_name: data?.branch_name || '',
                    ifsc_code: data?.ifsc_code || '',
                    account_type: data?.account_type || '',
                }
            } else {
                isEditing.value = true
            }
        } else {
            console.warn(res?.message || 'Failed to fetch bank details')
        }
    } catch (err: any) {
        console.error('Error fetching bank details:', err)
    } finally {
        loading.value = false
    }
}

onMounted(fetchBankDetails)

// --- Save Data ---
const handleSave = async () => {
    // Validation
    const requiredFields = {
        account_holder_name: 'Account Holder Name',
        account_number: 'Account Number',
        bank_name: 'Bank Name',
        branch_name: 'Branch Name',
        ifsc_code: 'IFSC Code',
        account_type: 'Account Type',
    }

    for (const [key, label] of Object.entries(requiredFields)) {
        if (!bankData.value[key as keyof typeof bankData.value]) {
            alert(`Please fill the ${label}`)
            return
        }
    }

    saving.value = true
    try {
        const res: any = await apiPost(END_POINTS.TRUCKER_BANK_DETAILS_UPDATE, bankData.value)
        if (res?.status) {
            successMessage.value = res?.message || 'Bank details updated successfully!'
            isEditing.value = false
            fetchBankDetails()
            setTimeout(() => { successMessage.value = '' }, 5000)
        } else {
            alert(res?.message || 'Failed to update details. Please try again.')
        }
    } catch (err: any) {
        console.error('Save error:', err)
        alert(err.message || 'Something went wrong. Please try again.')
    } finally {
        saving.value = false
    }
}

// --- Helpers ---
const maskAccountNumber = (acc: string) => {
    if (!acc) return '•••• •••• ••••'
    return acc.replace(/\d(?=\d{4})/g, "•")
}
</script>

<template>
  <div class="bank-details-view">
    <!-- HEADER -->
    <header class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="title-group">
          <h1>Bank Details</h1>
          <p>Securely manage your payouts & settlements</p>
        </div>
      </div>
      <button 
        v-if="!isEditing && !loading" 
        class="btn-edit-toggle" 
        @click="isEditing = true"
      >
        <Edit3 :size="18" />
        <span>Edit Details</span>
      </button>
    </header>

    <main v-if="loading" class="loading-container">
        <Loader2 class="spin" :size="48" />
        <p>Retrieving secure bank records...</p>
    </main>

    <main v-else class="content-wrapper">
      <div class="split-panel-layout">
        <!-- LEFT: INFO & SECURITY -->
        <aside class="info-sidebar">
            <div class="sidebar-hero">
                <div class="hero-icon">
                    <Building2 :size="32" stroke-width="2.5" />
                </div>
                <h2>Payout Account</h2>
                <p>Manage where you receive your trip earnings and settlements safely.</p>
            </div>

            <div class="secure-notice-box">
                <div class="secure-header">
                    <ShieldCheck :size="20" color="#10b981" />
                    <span class="secure-title">SECURE 256-BIT ENCRYPTION</span>
                </div>
                <p class="secure-description">
                    Your bank details are encrypted and stored securely. We never share your sensitive information with third parties.
                </p>
            </div>

            <div class="payout-perks">
                <div class="perk-item">
                    <CheckCircle :size="16" color="#10b981" />
                    <span>Instant settlements</span>
                </div>
                <div class="perk-item">
                    <CheckCircle :size="16" color="#10b981" />
                    <span>Automatic TDS handling</span>
                </div>
            </div>
        </aside>

        <!-- RIGHT: FORM CARD -->
        <div class="form-container">
          <div class="form-header">
            <div class="header-titles">
                <h2>{{ isEditing ? 'Edit Bank Account' : 'Account Overview' }}</h2>
                <p v-if="isEditing">Please ensure all details match your bank passbook.</p>
                <div v-else class="status-badge verified">
                    <CheckCircle :size="14" />
                    <span>Active Payout Account</span>
                </div>
            </div>
          </div>

          <form @submit.prevent="handleSave" class="bank-form">
            <div class="form-grid">
              <!-- Account Holder Name -->
              <div class="input-group full-width">
                <label>Account Holder Name <span v-if="isEditing" class="req">*</span></label>
                <div class="field-box" :class="{ viewing: !isEditing }">
                    <User :size="18" class="icon" />
                    <input 
                      v-if="isEditing"
                      type="text" 
                      v-model="bankData.account_holder_name" 
                      placeholder="Enter full name" 
                    />
                    <div v-else class="val-text">
                        <span>{{ bankData.account_holder_name || 'N/A' }}</span>
                    </div>
                </div>
              </div>

              <!-- Account Number -->
              <div class="input-group">
                <label>Account Number <span v-if="isEditing" class="req">*</span></label>
                <div class="field-box" :class="{ viewing: !isEditing }">
                    <CreditCard :size="18" class="icon" />
                    <input 
                      v-if="isEditing"
                      type="password" 
                      v-model="bankData.account_number" 
                      placeholder="Enter account number" 
                    />
                    <div v-else class="val-text">
                        <span>{{ maskAccountNumber(bankData.account_number) }}</span>
                    </div>
                </div>
              </div>

              <!-- Account Type -->
              <div class="input-group">
                <label>Account Type <span v-if="isEditing" class="req">*</span></label>
                <div class="field-box" :class="{ viewing: !isEditing }">
                    <Info :size="18" class="icon" />
                    <select v-if="isEditing" v-model="bankData.account_type">
                        <option value="" disabled>Select Type</option>
                        <option value="Savings Account">Savings Account</option>
                        <option value="Current Account">Current Account</option>
                        <option value="Salary Account">Salary Account</option>
                    </select>
                    <div v-else class="val-text">
                        <span>{{ bankData.account_type || 'N/A' }}</span>
                    </div>
                    <ChevronDown v-if="isEditing" :size="16" class="chev" />
                </div>
              </div>

              <!-- Bank Name -->
              <div class="input-group">
                <label>Bank Name <span v-if="isEditing" class="req">*</span></label>
                <div class="field-box" :class="{ viewing: !isEditing }">
                    <Building2 :size="18" class="icon" />
                    <input 
                      v-if="isEditing"
                      type="text" 
                      v-model="bankData.bank_name" 
                      placeholder="e.g. HDFC Bank" 
                    />
                    <div v-else class="val-text">
                        <span>{{ bankData.bank_name || 'N/A' }}</span>
                    </div>
                </div>
              </div>

              <!-- Branch -->
              <div class="input-group">
                <label>Branch Name</label>
                <div class="field-box" :class="{ viewing: !isEditing }">
                    <MapPin :size="18" class="icon" />
                    <input 
                      v-if="isEditing"
                      type="text" 
                      v-model="bankData.branch_name" 
                      placeholder="e.g. Main Branch" 
                    />
                    <div v-else class="val-text">
                        <span>{{ bankData.branch_name || 'N/A' }}</span>
                    </div>
                </div>
              </div>

              <!-- IFSC -->
              <div class="input-group full-width">
                <label>IFSC Code <span v-if="isEditing" class="req">*</span></label>
                <div class="field-box uppercase" :class="{ viewing: !isEditing }">
                    <ShieldCheck :size="18" class="icon" />
                    <input 
                      v-if="isEditing"
                      type="text" 
                      v-model="bankData.ifsc_code" 
                      placeholder="Enter IFSC" 
                      style="text-transform: uppercase"
                    />
                    <div v-else class="val-text">
                        <span>{{ bankData.ifsc_code || 'N/A' }}</span>
                    </div>
                </div>
              </div>
            </div>

            <!-- ACTIONS -->
            <div v-if="isEditing" class="form-actions">
                <button type="button" class="btn-cancel" @click="isEditing = false" :disabled="saving">
                    Cancel
                </button>
                <button type="submit" class="btn-save" :disabled="saving">
                    <Loader2 v-if="saving" class="spin" :size="18" />
                    <Save v-else :size="18" />
                    <span>{{ saving ? 'Updating...' : 'Save Bank Account' }}</span>
                </button>
            </div>

            <!-- SUCCESS -->
            <Transition name="fade">
              <div v-if="successMessage" class="success-alert">
                <CheckCircle :size="18" />
                <span>{{ successMessage }}</span>
              </div>
            </Transition>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bank-details-view {
  min-height: 100vh; background-color: #ffffff;
  color: #0f172a; font-family: 'Inter', sans-serif;
}

/* Header */
.page-header {
  height: 80px; padding: 0 40px; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
  background: white; position: sticky; top: 0; z-index: 100;
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

.btn-edit-toggle {
    height: 42px; padding: 0 16px; background: #eff6ff; color: #2563eb;
    border: 1px solid #bfdbfe; border-radius: 10px; font-weight: 700;
    display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
}
.btn-edit-toggle:hover { background: #dbeafe; transform: translateY(-1px); }
/* Layout */
.content-wrapper { 
  max-width: 1300px; margin: 0 auto; padding: 60px 40px; 
}

.split-panel-layout {
  display: flex; gap: 60px; align-items: flex-start;
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* Sidebar */
.info-sidebar {
    flex: 0 0 360px; background: #f8fafc; border-radius: 32px; padding: 40px;
    border: 1px solid #e2e8f0; position: sticky; top: 120px;
}
.sidebar-hero { margin-bottom: 32px; }
.hero-icon {
    width: 64px; height: 64px; background: #eff6ff; color: #2563eb;
    border-radius: 20px; display: flex; align-items: center; justify-content: center;
    margin-bottom: 24px;
}
.info-sidebar h2 { font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
.info-sidebar p { font-size: 15px; color: #64748b; line-height: 1.6; margin-top: 12px; }

.secure-notice-box {
    margin-top: 40px; padding: 20px; background: white; border-radius: 16px;
    border: 1px solid #e2e8f0; border-left: 4px solid #10b981;
}
.secure-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.secure-title { font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 1px; }
.secure-description { font-size: 11px; color: #94a3b8; line-height: 1.5; }

.payout-perks { margin-top: 32px; display: flex; flex-direction: column; gap: 16px; }
.perk-item { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: #475569; }

/* Form Card Area */
.form-container { 
    flex: 1; background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 32px;
    padding: 48px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-header { margin-bottom: 48px; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; }
.form-header h2 { font-size: 32px; font-weight: 800; color: #1e293b; letter-spacing: -1px; }
.form-header p { font-size: 15px; color: #64748b; margin-top: 12px; }

.status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-top: 20px; }
.status-badge.verified { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px 60px; }
.full-width { grid-column: span 2; }

.input-group { display: flex; flex-direction: column; gap: 12px; }
.input-group label { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; }
.req { color: #ef4444; }

.field-box {
    position: relative; display: flex; align-items: center; border: 1px solid #e2e8f0;
    border-radius: 16px; background: #f8fafc; transition: all 0.2s;
}
.field-box.viewing { background: transparent; border-color: transparent; border-radius: 0; margin-top: -4px; }

.field-box input, .field-box select {
    width: 100%; height: 56px; padding: 0 16px 0 52px; border: none; background: transparent;
    outline: none; font-size: 16px; font-weight: 600; font-family: inherit; color: #1e293b;
}

.icon { position: absolute; left: 18px; color: #94a3b8; transition: color 0.2s; }
.field-box.viewing .icon { position: static; margin-right: 14px; color: #2563eb; opacity: 0.8; }

.field-box:focus-within { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
.field-box:focus-within .icon { color: #2563eb; }

.val-text { font-size: 18px; font-weight: 700; color: #1e293b; display: flex; align-items: center; width: 100%; }
.chev { position: absolute; right: 16px; color: #64748b; pointer-events: none; }

/* Actions */
.form-actions { margin-top: 40px; display: flex; gap: 16px; }
.btn-save {
    flex: 1; height: 54px; background: #2563eb; color: white; border: none;
    border-radius: 14px; font-size: 16px; font-weight: 700; display: flex;
    align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s;
}
.btn-save:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(37,99,235,0.3); }
.btn-cancel {
    padding: 0 24px; height: 54px; background: #f1f5f9; color: #475569; border: none;
    border-radius: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: #e2e8f0; }

.success-alert {
  margin-top: 20px; padding: 16px; background: #ecfdf5; border: 1px solid #34d399;
  border-radius: 12px; color: #065f46; display: flex; align-items: center; gap: 12px;
  font-size: 14px; font-weight: 600;
}

.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; color: #64748b; gap: 20px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 900px) {
    .split-layout { flex-direction: column; }
    .visual-sidebar { flex: 1; width: 100%; max-width: 450px; margin: 0 auto; }
}
</style>
