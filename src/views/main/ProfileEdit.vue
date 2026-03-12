<script setup lang="ts">
import { ref } from 'vue'
import {
  User,
  Building2,
  MapPin,
  Truck,
  FileText,
  PhoneCall,
  ArrowLeft,
  Camera,
  Upload,
  Info
} from 'lucide-vue-next'

const props = defineProps<{
  user: {
    id: string;
    unique_id: string;
    name: string;
    mobile: string;
    email: string;
    role: string;
    images?: string;
    state?: string;
    city?: string;
    address?: string;
    pincode?: string;
    Transport_Name?: string;
    Type_of_License?: string;
    [key: string]: any;
  };
}>()

const emit = defineEmits(['back', 'save'])

const formData = ref({
  name: props.user?.name || '',
  email: props.user?.email || '',
  mobile: props.user?.mobile || '',
  companyName: props.user?.Transport_Name || '',
  companyType: 'Not Provided',
  address: props.user?.address || '',
  district: props.user?.city || '',
  pincode: props.user?.pincode || '',
  state: props.user?.state || '',
  vehicleType: 'Heavy Open Body Trucks',
  yearsOfOperation: '10+ years',
  fleetSize: '6-11',
  operationalSegment: 'White Goods, Construction, Others',
  routes: 'All India',
  avgKmRun: '9001 - 10000 km',
  panNumber: 'AIBPC4512H',
  gstNumber: '08AXDPC4112H1ZW',
  secondContactName: 'Not Provided',
  secondContactMobile: 'Not Provided'
})

const handleSave = () => {
  emit('save', formData.value)
}

</script>

<template>
  <div class="profile-edit-page">
    <!-- Header -->
    <header class="edit-header">
      <div class="header-inner">
        <button class="back-btn" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-text">
          <h1>Edit Profile</h1>
          <p>Update your professional identification</p>
        </div>
        <button class="save-btn-top" @click="handleSave">Save Changes</button>
      </div>
    </header>

    <div class="edit-content">
      <!-- Section: Profile Photo -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #3b82f615; color: #3b82f6;">
            <User :size="20" />
          </div>
          <h3>Profile Photo</h3>
        </div>
        <div class="photo-edit-container">
          <div class="photo-preview">
            <img 
              :src="user.images ? `https://tm-api.truckmitr.com/public/${user.images}` : 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'" 
              alt="Profile"
            />
            <button class="photo-overlay">
              <Camera :size="20" />
            </button>
          </div>
          <div class="photo-info">
            <h4>Your Professional Avatar</h4>
            <p>Upload a clear face photo to build trust with transporters.</p>
            <button class="upload-btn">
              <Upload :size="16" />
              <span>Change Image</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Section: Personal Info -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #10b98115; color: #10b981;">
            <Info :size="20" />
          </div>
          <h3>Personal Information</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Full Name</label>
            <input type="text" v-model="formData.name" placeholder="Enter Full Name" />
          </div>
          <div class="input-group">
            <label>E-mail</label>
            <input type="email" v-model="formData.email" placeholder="Enter Email" />
          </div>
          <div class="input-group">
            <label>Mobile Number</label>
            <input type="text" v-model="formData.mobile" readonly disabled />
            <span class="input-note">Mobile cannot be changed</span>
          </div>
        </div>
      </section>

      <!-- Section: Company Info -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #6366f115; color: #6366f1;">
            <Building2 :size="20" />
          </div>
          <h3>Company Details</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Company Name</label>
            <input type="text" v-model="formData.companyName" placeholder="Enter Company Name" />
          </div>
          <div class="input-group">
            <label>Company Registration Type</label>
            <select v-model="formData.companyType">
              <option>Not Provided</option>
              <option>Proprietorship</option>
              <option>Partnership</option>
              <option>Private Limited</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Section: Address -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #ef444415; color: #ef4444;">
            <MapPin :size="20" />
          </div>
          <h3>Address Information</h3>
        </div>
        <div class="input-grid">
          <div class="input-group full">
            <label>Full Address</label>
            <input type="text" v-model="formData.address" placeholder="Enter Address" />
          </div>
          <div class="input-group">
            <label>District</label>
            <input type="text" v-model="formData.district" placeholder="Enter District" />
          </div>
          <div class="input-group">
            <label>Pincode</label>
            <input type="text" v-model="formData.pincode" placeholder="Enter Pincode" />
          </div>
          <div class="input-group">
            <label>State</label>
            <input type="text" v-model="formData.state" placeholder="Enter State" />
          </div>
        </div>
      </section>

      <!-- Section: Vehicle & Operation -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #f59e0b15; color: #f59e0b;">
            <Truck :size="20" />
          </div>
          <h3>Operation Details</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Vehicle Type</label>
            <input type="text" v-model="formData.vehicleType" />
          </div>
          <div class="input-group">
            <label>Years of Operation</label>
            <input type="text" v-model="formData.yearsOfOperation" />
          </div>
          <div class="input-group">
            <label>Fleet Size</label>
            <input type="text" v-model="formData.fleetSize" />
          </div>
          <div class="input-group">
            <label>Operational Segment</label>
            <input type="text" v-model="formData.operationalSegment" />
          </div>
          <div class="input-group">
            <label>Routes</label>
            <input type="text" v-model="formData.routes" />
          </div>
          <div class="input-group">
            <label>Average Km Run</label>
            <input type="text" v-model="formData.avgKmRun" />
          </div>
        </div>
      </section>

      <!-- Section: Documents -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #8b5cf615; color: #8b5cf6;">
            <FileText :size="20" />
          </div>
          <h3>PAN & GST Documents</h3>
        </div>
        <div class="document-grid">
          <div class="doc-item">
            <div class="input-group">
              <label>PAN Number</label>
              <input type="text" v-model="formData.panNumber" placeholder="ABCD1234E" />
            </div>
            <div class="doc-upload-box">
              <img src="https://tm-api.truckmitr.com/public/placeholder/pan.jpg" class="doc-placeholder" alt="PAN Placeholder" />
              <button class="doc-edit-btn"><Camera :size="16" /></button>
            </div>
          </div>
          <div class="doc-item">
            <div class="input-group">
              <label>GST Number</label>
              <input type="text" v-model="formData.gstNumber" placeholder="22AAAAA0000A1Z5" />
            </div>
            <div class="doc-upload-box">
              <img src="https://tm-api.truckmitr.com/public/placeholder/doc.jpg" class="doc-placeholder" alt="GST Placeholder" />
              <button class="doc-edit-btn"><Camera :size="16" /></button>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Second Contact -->
      <section class="edit-section">
        <div class="section-header">
          <div class="icon-wrap" style="background-color: #0ea5e915; color: #0ea5e9;">
            <PhoneCall :size="20" />
          </div>
          <h3>Emergency Contact</h3>
        </div>
        <div class="input-grid">
          <div class="input-group">
            <label>Second Contact Name</label>
            <input type="text" v-model="formData.secondContactName" />
          </div>
          <div class="input-group">
            <label>Second Contact Mobile</label>
            <input type="text" v-model="formData.secondContactMobile" />
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.profile-edit-page {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
}

/* Header */
.edit-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eef0f2;
  padding: 16px 32px;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f8fafc;
  color: #0f172a;
}

.header-text {
  flex: 1;
}

.header-text h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.header-text p {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.save-btn-top {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn-top:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Content */
.edit-content {
  max-width: 100%;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.edit-section {
  border: 1px solid #eef0f2;
  border-radius: 24px;
  padding: 28px;
  background: #ffffff;
  animation: slideIn 0.4s ease-out backwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

/* Photo Section */
.photo-edit-container {
  display: flex;
  align-items: center;
  gap: 32px;
}

.photo-preview {
  position: relative;
  width: 120px;
  height: 120px;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  object-fit: cover;
  border: 4px solid #f8fafc;
}

.photo-overlay {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  background: #3b82f6;
  color: white;
  border: 4px solid white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.photo-info h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 6px 0;
}

.photo-info p {
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.upload-btn {
  background: white;
  border: 1px solid #eef0f2;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* Inputs */
.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group.full {
  grid-column: 1 / -1;
}

.input-group label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  margin-left: 2px;
}

.input-group input, .input-group select {
  height: 52px;
  border: 1px solid #eef0f2;
  border-radius: 14px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 500;
  background: #f8fafc;
  transition: all 0.2s;
  color: #0f172a;
}

.input-group input:focus, .input-group select:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px #3b82f610;
}

.input-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
}

.input-note {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 4px;
}

/* Documents */
.document-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.doc-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.doc-upload-box {
  position: relative;
  height: 200px;
  background: #f8fafc;
  border: 2px dashed #eef0f2;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doc-placeholder {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  opacity: 0.6;
}

.doc-edit-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #eef0f2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

/* Footer Actions */
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
  padding-bottom: 40px;
}

.cancel-btn {
  background: white;
  border: 1px solid #eef0f2;
  padding: 14px 32px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  color: #64748b;
}

.save-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.3);
}

@media (max-width: 768px) {
  .edit-content { padding: 20px; }
  .input-grid { grid-template-columns: 1fr; }
  .document-grid { grid-template-columns: 1fr; }
  .photo-edit-container { flex-direction: column; text-align: center; }
  .footer-actions { flex-direction: column-reverse; }
  .cancel-btn, .save-btn { width: 100%; }
}
</style>
