<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, PlusCircle, CheckCircle2, Briefcase, Truck, IndianRupee, FileText } from 'lucide-vue-next'

const emit = defineEmits(['back'])

// Form State
const form = ref({
  title: '',
  location: '',
  pincode: '',
  area: '',
  route: '',
  vehicleType: '',
  experience: '',
  license: '',
  skills: [] as string[],
  salary: '',
  
  hasEsiPf: null as boolean | null,
  
  hasFoodAllowance: null as boolean | null,
  foodAllowanceAmount: '',
  
  hasTripIncentive: null as boolean | null,
  tripIncentiveAmount: '',
  
  hasAccommodation: null as boolean | null,
  
  hasMileage: null as boolean | null,
  mileageValue: '',
  
  hasFastag: null as boolean | null,
  fastagAmount: '',
  
  numberOfDrivers: '',
  description: '',
  truckCondition: '',
  deadline: '',
  consent: false
})

const vehicleTypes = [
  'Cargo Truck (Open)', 'Container Truck', 'Tipper Trucks', 
  'Trailer/Semi-Trailer', 'Tanker', 'Car Carriers', 
  'Light Commercial Vehicle', 'Reefer Trucks'
]
const experienceOptions = ['1-5 years', '5-10 years', '10-15 years', '15-20 years', '20+ years']
const licenseTypes = ['LMV (Light)', 'HMV (Heavy)', 'HGMV (Goods)', 'HPMV/HTV']
const skillOptions = [
  'E-Commerce', 'White Goods', 'Livestock', 'Perishable', 
  'Oversized', 'Fuel Tanker', 'Automobile Carrier', 'Construction', 
  'Refrigerator Vehicle', 'Others'
]
const salaryOptions = [
  '20000-25000', '25000-30000', '30000-35000', '35000-40000', 
  '40000-45000', '45000-50000', '50000-55000', '55000-60000'
]
const conditionOptions = ['Excellent', 'Good', 'Average', 'Old but running', 'Made Road Ready']

const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']

const toggleSkill = (skill: string) => {
  if (form.value.skills.includes(skill)) {
    form.value.skills = form.value.skills.filter(s => s !== skill)
  } else {
    form.value.skills.push(skill)
  }
}

const submitJob = () => {
  // Check consent before submission 
  if (!form.value.consent) {
    alert("Please agree to the consent before posting.")
    return
  }
  console.log('Submitting Job:', form.value)
  alert("Job Posted Successfully!")
  emit('back')
}
</script>

<template>
  <div class="addjob-wrapper">
    <!-- Header -->
    <div class="dash-header-area">
      <button class="back-btn" @click="emit('back')" title="Back to Home">
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>

      <div class="page-title-row">
        <div class="page-title-icon">
          <PlusCircle :size="24" color="#1e40af" />
        </div>
        <div>
          <h2 class="page-title">Post a New Job</h2>
          <p class="page-subtitle">Fill in the details below to hire the perfect driver</p>
        </div>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="submitJob" class="job-form">
        
        <!-- Job Basics Card -->
        <div class="form-section-card">
          <div class="section-header">
            <Briefcase :size="20" color="#3b82f6" />
            <h3 class="section-title">Job Basics</h3>
          </div>
          
          <div class="form-grid">
            <div class="input-group">
              <label>Job Title <span class="req">*</span></label>
              <input type="text" v-model="form.title" placeholder="e.g. Heavy Driver for Trailer" required />
            </div>
            
            <div class="input-group">
              <label>Job Location <span class="req">*</span></label>
              <select v-model="form.location" required>
                <option value="" disabled>Select Location</option>
                <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
              </select>
            </div>

            <div class="input-group">
              <label>Pincode <span class="req">*</span></label>
              <input type="text" v-model="form.pincode" placeholder="Enter Pincode" maxlength="6" required />
            </div>

            <!-- Select Area (conditionally shown if Pincode is entered) -->
            <div class="input-group slide-in" v-if="form.pincode.length > 0">
              <label>Select Area <span class="req">*</span></label>
              <input type="text" v-model="form.area" placeholder="Enter Area / Neighborhood" required />
            </div>

            <div class="input-group">
              <label>Route</label>
              <input type="text" v-model="form.route" placeholder="e.g. Delhi to Mumbai" />
            </div>
          </div>
        </div>

        <!-- Vehicle & License Info Card -->
        <div class="form-section-card">
          <div class="section-header">
            <Truck :size="20" color="#8b5cf6" />
            <h3 class="section-title">Vehicle & Driver Requirements</h3>
          </div>
          
          <div class="field-block compact-block">
            <label class="block-label">Vehicle Type <span class="req">*</span></label>
            <div class="chip-grid compact-chips">
              <button 
                type="button" 
                class="chip-btn" 
                v-for="vType in vehicleTypes" :key="vType"
                :class="{ selected: form.vehicleType === vType }"
                @click="form.vehicleType = vType"
              >
                {{ vType }}
              </button>
            </div>
          </div>

          <div class="form-grid compact-grid">
            <div class="input-group">
              <label>Experience Needed <span class="req">*</span></label>
              <select v-model="form.experience" required>
                <option value="" disabled>Select Experience</option>
                <option v-for="exp in experienceOptions" :key="exp" :value="exp">{{ exp }}</option>
              </select>
            </div>

            <div class="input-group">
              <label>Type of License <span class="req">*</span></label>
              <select v-model="form.license" required>
                <option value="" disabled>Select License Type</option>
                <option v-for="lic in licenseTypes" :key="lic" :value="lic">{{ lic }}</option>
              </select>
            </div>
          </div>

          <div class="field-block compact-block" style="margin-top:20px;">
            <label class="block-label">Preferred Skills</label>
            <div class="chip-grid compact-chips">
              <button 
                type="button" 
                class="chip-btn skill-chip" 
                v-for="skill in skillOptions" :key="skill"
                :class="{ selected: form.skills.includes(skill) }"
                @click="toggleSkill(skill)"
              >
                {{ skill }} <span class="plus-icon">{{ form.skills.includes(skill) ? '✓' : '+' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Compensation and Benefits Card -->
        <div class="form-section-card">
          <div class="section-header">
            <IndianRupee :size="20" color="#10b981" />
            <h3 class="section-title">Compensation & Facilities</h3>
          </div>

          <div class="form-grid">
            <div class="input-group full-width">
              <label>Fixed Salary <span class="req">*</span></label>
              <select v-model="form.salary" required>
                <option value="" disabled>Select Salary Range</option>
                <option v-for="sal in salaryOptions" :key="sal" :value="sal">₹{{ sal }}</option>
              </select>
            </div>
          </div>

          <!-- Toggles Array -->
          <div class="toggles-container wide-grid">
            <!-- ESI/PF -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">ESI/PF Benefits</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasEsiPf" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasEsiPf" :value="false" /> No
                  </label>
                </div>
              </div>
            </div>

            <!-- Food Allowance -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Food Allowance</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFoodAllowance" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFoodAllowance" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasFoodAllowance">
                <input type="number" v-model="form.foodAllowanceAmount" placeholder="Enter Amount (₹)" />
              </div>
            </div>

            <!-- Trip Incentive -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Trip Incentive</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasTripIncentive" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasTripIncentive" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasTripIncentive">
                <input type="number" v-model="form.tripIncentiveAmount" placeholder="Enter Amount (₹)" />
              </div>
            </div>

            <!-- Accommodation -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Accommodation Facility</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasAccommodation" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasAccommodation" :value="false" /> No
                  </label>
                </div>
              </div>
            </div>

            <!-- Mileage -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Mileage</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasMileage" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasMileage" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasMileage">
                <input type="number" v-model="form.mileageValue" placeholder="Expected Mileage (km per 1 liter)" />
              </div>
            </div>

            <!-- Fastag/Road Karcha -->
            <div class="toggle-wrapper">
              <div class="toggle-row">
                <div class="toggle-label">Fastag / Road Karcha</div>
                <div class="toggle-options">
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFastag" :value="true" /> Yes
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.hasFastag" :value="false" /> No
                  </label>
                </div>
              </div>
              <div class="nested-input slide-in" v-if="form.hasFastag">
                <input type="number" v-model="form.fastagAmount" placeholder="Enter Amount (₹)" />
              </div>
            </div>
            
          </div>
        </div>

        <!-- Additional Information Card -->
        <div class="form-section-card">
          <div class="section-header">
            <FileText :size="20" color="#f59e0b" />
            <h3 class="section-title">Additional Details</h3>
          </div>
        
          <div class="form-grid">
            <div class="input-group">
              <label>Number of Drivers Required <span class="req">*</span></label>
              <input type="number" v-model="form.numberOfDrivers" placeholder="e.g. 2" required min="1" />
            </div>

            <div class="input-group">
              <label>Application Deadline <span class="req">*</span></label>
              <input type="date" v-model="form.deadline" @click="($event.target as HTMLInputElement).showPicker()" required />
            </div>
          </div>

          <div class="field-block" style="margin-top:20px;">
            <label class="block-label">Overall Truck Condition</label>
            <div class="chip-grid">
              <button 
                type="button" 
                class="chip-btn" 
                v-for="cond in conditionOptions" :key="cond"
                :class="{ selected: form.truckCondition === cond }"
                @click="form.truckCondition = cond"
              >
                {{ cond }}
              </button>
            </div>
          </div>

          <div class="input-group full-width" style="margin-top: 20px;">
            <label>Job Description</label>
            <textarea v-model="form.description" rows="4" placeholder="Briefly describe the responsibilities, schedule, etc."></textarea>
          </div>
        </div>

        <!-- Consent -->
        <div class="consent-block">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.consent" required />
            <span class="checkmark"></span>
            <span class="consent-text">I agree to the Truckmitr Transporter consent for job posting & data sharing which will be visible to drivers.</span>
          </label>
        </div>

        <!-- Submit -->
        <div class="submit-action">
          <button type="submit" class="submit-btn">
            <CheckCircle2 :size="18" style="margin-right:8px;" />
            Post Job
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.addjob-wrapper {
  padding: 32px 40px 64px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: fadeSlideIn 0.4s ease-out;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  background-color: #f8fafc; /* Provides subtle contrast against the floating white section cards */
  min-height: 100vh;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Header */
.dash-header-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
  transform: translateX(-2px);
}

.page-title-icon {
  width: 50px;
  height: 50px;
  background: #eff6ff;
  border-radius: 14px;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* Modern Form Container */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Individual Floating Cards */
.form-section-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 24px -6px rgba(15, 23, 42, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.form-section-card:hover {
  box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.job-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.3px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: flex-start;
}

.compact-grid {
  gap: 16px;
}

/* Inputs & Selects */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group.full-width {
  grid-column: 1 / -1;
}

.input-group label, .block-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.req {
  color: #ef4444;
}

input[type="text"],
input[type="number"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%228%22%20viewBox%3D%220%200%2014%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201L7%207L13%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
  cursor: pointer;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: 0.2s;
}
input[type="date"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

input:focus, select:focus, textarea:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
  transform: translateY(-1px);
}

textarea {
  resize: vertical;
}

/* Chips/Badges for array options */
.field-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn:hover {
  background: #e2e8f0;
}

.chip-btn.selected {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #3b82f6;
  font-weight: 600;
}

/* Compact rules for messy sections */
.compact-chips {
  gap: 10px;
  margin-top: 6px;
}
.compact-chips .chip-btn {
  padding: 8px 16px;
  font-size: 13.5px;
  border-radius: 8px;
  font-weight: 500;
  border-color: #e2e8f0;
}
.compact-block {
  gap: 4px;
  margin-bottom: 24px;
}

.skill-chip span.plus-icon {
  margin-left: 4px;
  color: inherit;
  font-weight: bold;
}

/* Toggles / Radios */
.toggles-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 28px;
}

.toggles-container.wide-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 640px) {
  .toggles-container.wide-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

.toggle-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  padding: 18px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  height: 100%;
}

.toggle-row:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.toggle-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.toggle-options {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
}

.radio-label:has(input:checked) {
  background: #3b82f6;
  color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
  transform: translateY(-1px);
}

.radio-label input[type="radio"] {
  display: none;
}

/* Animations */
.slide-in {
  animation: expandIn 0.3s ease-out;
  transform-origin: top;
}

@keyframes expandIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.nested-input {
  margin-top: -6px;
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 2px solid #3b82f6;
}

/* Consent Block */
.consent-block {
  margin-top: 24px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  padding: 16px 20px;
  border-radius: 12px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s;
}

.checkbox-label:hover input ~ .checkmark {
  border-color: #3b82f6;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkmark:after {
  content: "";
  display: none;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

.consent-text {
  font-size: 13px;
  color: #1e3a8a;
  line-height: 1.5;
  font-weight: 500;
}

/* Submit Action */
.submit-action {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #ffffff;
  border: none;
  padding: 16px 40px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 24px -6px rgba(59, 130, 246, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 14px 32px -8px rgba(59, 130, 246, 0.6);
}
</style>
