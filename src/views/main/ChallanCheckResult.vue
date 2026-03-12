<script setup lang="ts">
import { computed } from 'vue'
import { 
  ArrowLeft, CheckCircle2, AlertCircle, 
  ShieldCheck, FileText
} from 'lucide-vue-next'

const props = defineProps<{
  vehicleNumber?: string
  results?: any[]
}>()

const emit = defineEmits(['back', 'navigate'])

// Mock data if none provided (for demonstration/testing)
const displayVehicleNumber = computed(() => props.vehicleNumber || "MH12AB1234")
const challanList = computed(() => {
  if (props.results && props.results.length > 0) return props.results
  
  // For demonstration, if no results are passed, we show 1 mock challan
  // If we wanted to show "No Challan", we'd return []
  return [
    {
      challan_status: 'pending',
      challan_number: 'CH882910293',
      offense_details: 'Over speeding - Exceeding speed limit on highway Sector 4',
      challan_place: 'Expressway Toll Plaza, Pune',
      challan_date_time: '10-Mar-2026 14:30',
      state: 'Maharashtra',
      accused_name: 'Rahul Kumar',
      amount: '1000'
    },
    {
      challan_status: 'disposed',
      challan_number: 'CH771239921',
      offense_details: 'No Parking - Vehicle parked in restricted zone near market',
      challan_place: 'Shivaji Nagar, Pune',
      challan_date_time: '05-Feb-2026 11:15',
      state: 'Maharashtra',
      accused_name: 'Rahul Kumar',
      amount: '500'
    }
  ]
})

const hasChallan = computed(() => challanList.value.some(c => c.challan_status === 'pending'))

</script>

<template>
  <div class="rc-result-page">
    
    <!-- Top Navigation Header -->
    <header class="app-header">
      <div class="header-container">
        <button class="back-btn" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-text">
          <h1>Challan Details</h1>
          <p>Verified traffic violation records for vehicle {{ displayVehicleNumber }}.</p>
        </div>
      </div>
    </header>

    <div class="content-wrapper">
      
      <!-- Premium Status Banner -->
      <div class="premium-status-banner" :class="{ 'is-active': !hasChallan }">
        <div class="status-glow"></div>
        <div class="status-icon">
          <CheckCircle2 v-if="!hasChallan" :size="40" />
          <AlertCircle v-else :size="40" />
        </div>
        <div class="status-info">
          <h2>{{ hasChallan ? 'Pending Challans Found' : 'No Pending Penalties' }}</h2>
          <p>{{ hasChallan ? `Found ${challanList.filter(c => c.challan_status === 'pending').length} pending violation(s) in official records.` : 'This vehicle is clean with no outstanding penalties.' }}</p>
        </div>
      </div>

      <!-- Main Detailed List -->
      <div class="challan-results-container">
        <div v-if="challanList.length > 0" class="bento-grid-results">
          <div 
            v-for="(item, index) in challanList" 
            :key="index" 
            class="bento-card full-width-card"
            :class="{ 'caution-card': item.challan_status === 'pending' }"
          >
            <div class="card-header">
              <div class="icon-box" :class="item.challan_status === 'pending' ? 'rose' : 'emerald'"><FileText :size="18" /></div>
              <div class="header-flex">
                <h3>Challan #{{ index + 1 }} - {{ item.challan_number }}</h3>
                <span class="tag" :class="item.challan_status === 'pending' ? 'tag-red' : 'tag-green'">
                  {{ item.challan_status }}
                </span>
              </div>
            </div>

            <div class="card-body list-view grid-list">
              <div class="list-item"><span class="label">Accused Name</span><span class="value strong">{{ item.accused_name || '-' }}</span></div>
              <div class="list-item"><span class="label">Date & Time</span><span class="value">{{ item.challan_date_time || '-' }}</span></div>
              <div class="list-item"><span class="label">Location</span><span class="value">{{ item.challan_place || '-' }}</span></div>
              <div class="list-item"><span class="label">State</span><span class="value">{{ item.state || '-' }}</span></div>
              <div class="list-item-block">
                <span class="label">Offence Details</span>
                <span class="value text-block">{{ item.offense_details || '-' }}</span>
              </div>
              
              <div class="card-footer-flex">
                <div class="amt-summary">
                  <span class="label">Challan Amount</span>
                  <span class="amount-val" :class="{ 'text-red': item.challan_status === 'pending' }">₹{{ item.amount }}</span>
                </div>
                <button v-if="item.challan_status === 'pending'" class="action-btn primary-btn-sm">
                  Resolve Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state-banner bento-card">
           <div class="status-icon success-bg"><ShieldCheck :size="40" /></div>
           <div class="empty-info">
             <h3>Perfectly Clear</h3>
             <p>Our database shows no traffic violations for this vehicle number.</p>
           </div>
           <button class="primary-btn-sm" @click="emit('back')">Check New Vehicle</button>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="page-actions">
        <button class="action-btn primary-btn" @click="emit('back')">
          Check Another Vehicle
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; }

.rc-result-page {
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  padding-bottom: 60px;
}

/* Header */
.app-header {
  background: #ffffff;
  padding: 24px 40px;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  width: 44px; height: 44px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.header-text h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-text p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

/* Content */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  animation: fadeUp 0.5s ease-out;
}

/* Premium Status Banner */
.premium-status-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 40px;
  margin-bottom: 32px;
  box-shadow: 0 4px 20px -4px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.premium-status-banner.is-active { border: 1px solid #dcfce7; }
.status-glow { position: absolute; top: 0; left: 0; bottom: 0; width: 6px; background: #fee2e2; }
.is-active .status-glow { background: #22c55e; }

.status-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #ef4444;
  background: #fee2e2;
}

.is-active .status-icon {
  color: #16a34a;
  background: #dcfce7;
}

.status-info h2 {
  margin: 0 0 6px 0;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.is-active .status-info h2 { color: #166534; }

.status-info p {
  margin: 0;
  color: #475569;
  font-size: 16px;
  font-weight: 500;
}

/* Bento Grid System */
.challan-results-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.bento-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 30px rgba(0,0,0,0.02);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.caution-card { border-top: 4px solid #ef4444; }

.bento-card:hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-bottom: 1px solid #f8fafc;
}

.header-flex { display: flex; align-items: center; justify-content: space-between; flex: 1; }

.icon-box {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.icon-box.rose { background: #fff1f2; color: #e11d48; }
.icon-box.emerald { background: #ecfdf5; color: #059669; }

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.card-body.list-view { padding: 0 24px 24px 24px; }

.grid-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 40px;
}

.list-item {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
}

.list-item-block {
  grid-column: span 2;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.list-item .label, .list-item-block .label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  width: 140px;
  flex-shrink: 0;
}

.list-item .value {
  color: #334155;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  flex: 1;
}

.text-block {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  color: #1e293b;
  line-height: 1.6;
}

.card-footer-flex {
  grid-column: span 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
}

.amt-summary { display: flex; flex-direction: column; gap: 4px; }
.amount-val { font-size: 24px; font-weight: 800; color: #0f172a; }
.text-red { color: #ef4444; }

/* Tags */
.tag { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.tag-green { background: #dcfce7; color: #166534; }
.tag-red { background: #fee2e2; color: #991b1b; }

/* Action Footer */
.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
}

.action-btn {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.primary-btn { background: #2563eb; color: #ffffff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.primary-btn:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3); }

.primary-btn-sm { background: #2563eb; color: white; border-radius: 10px; padding: 10px 24px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.primary-btn-sm:hover { background: #1d4ed8; transform: scale(1.02); }

.secondary-btn { background: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; }
.secondary-btn:hover { background: #f8fafc; border-color: #94a3b8; }

/* Empty State */
.empty-state-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 40px;
  background: white;
}

.success-bg { background: #dcfce7 !important; color: #16a34a !important; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 900px) {
  .grid-list { grid-template-columns: 1fr; }
  .list-item-block, .card-footer-flex { grid-column: auto; }
}

@media (max-width: 768px) {
  .app-header { padding: 20px; }
  .content-wrapper { padding: 20px; }
  .premium-status-banner { flex-direction: column; text-align: center; }
  .header-flex { flex-direction: column; align-items: flex-start; gap: 8px; }
  .page-actions { flex-direction: column-reverse; }
  .action-btn { width: 100%; }
}
</style>
