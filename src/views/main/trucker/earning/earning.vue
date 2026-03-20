<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowLeft, Wallet, TrendingUp, TrendingDown, 
  ExternalLink, ChevronRight,
  Clock, FileText,
  ArrowUpRight,
  Calendar, LayoutGrid, List, Download,
  AlertTriangle
} from 'lucide-vue-next'
import { END_POINTS, apiGet } from '../../../../services/config/api'

const emit = defineEmits(['back', 'navigate'])

// --- Data & State ---
const isLoading = ref(true)
const isFetchingMore = ref(false)
const viewMode = ref('grid') 
const page = ref(1)
const hasMore = ref(true)

const stats = ref({
  total_earning: 0,
  this_month_earning: 0,
  last_month_earning: 0,
  pending_payment: 0,
  growth_percentage: 0,
  growth_status: 'profit'
})

const history = ref<any[]>([])

// --- Methods ---
onMounted(() => {
  fetchData()
})

const fetchData = async (pageNum = 1, isInitial = true) => {
  try {
    if (isInitial) isLoading.value = true
    else isFetchingMore.value = true

    const response: any = await apiGet(END_POINTS.TRUCKER_PAYMENT_HISTORY(pageNum))
    
    if (response?.status === 'success') {
      const data = response.data
      const paymentStats = data.payment_stats || data.stats || {}
      const historyData = data.load_history || data.history || { data: [] }

      if (isInitial) {
        stats.value = {
          total_earning: Number(paymentStats.total_earning || 0),
          this_month_earning: Number(paymentStats.this_month_earning || 0),
          last_month_earning: Number(paymentStats.last_month_earning || 0),
          pending_payment: Number(paymentStats.pending_payment || 0),
          growth_percentage: Number(paymentStats.growth_percentage || 0),
          growth_status: paymentStats.growth_status || 'profit'
        }
        history.value = historyData.data || []
      } else {
        history.value = [...history.value, ...(historyData.data || [])]
      }

      hasMore.value = historyData.current_page < historyData.last_page
      page.value = pageNum
    }
  } catch (error) {
    console.error('Error fetching earnings data:', error)
  } finally {
    isLoading.value = false
    isFetchingMore.value = false
  }
}

const loadMore = () => {
  if (!isFetchingMore.value && hasMore.value) {
    fetchData(page.value + 1, false)
  }
}

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num || 0)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS': return 'success'
    case 'PARTIAL': return 'warning'
    case 'PENDING': return 'danger'
    default: return 'neutral'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'SUCCESS': return 'Fully Paid'
    case 'PARTIAL': return 'Partial Payment'
    case 'PENDING': return 'Payment Pending'
    default: return status
  }
}

const getPaymentProgress = (received: number, total: number) => {
  if (!total) return 0
  return Math.round((received / total) * 100)
}
</script>

<template>
  <div class="earnings-page">
    <!-- Header -->
    <header class="header-section">
      <div class="header-content">
        <div class="title-group">
          <button class="btn-back" @click="emit('back')">
            <ArrowLeft :size="20" />
          </button>
          <div class="h-texts">
            <h1>Earnings & History</h1>
            <p>Track your payouts and trip history</p>
          </div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Stats Dashboard -->
      <section class="stats-grid">
        <div class="stat-card primary-stats">
          <div class="s-info">
            <span class="s-label">TOTAL EARNINGS</span>
            <div class="s-value-group">
               <h2 class="s-value">{{ formatCurrency(stats.total_earning) }}</h2>
               <div class="growth-pill" :class="stats.growth_status">
                 <TrendingUp v-if="stats.growth_status === 'profit'" :size="14" />
                 <TrendingDown v-else :size="14" />
                 <span>+{{ stats.growth_percentage }}%</span>
               </div>
            </div>
            <p class="s-subtitle">Net accumulated earnings across all completed trips</p>
          </div>
          <div class="s-icon-box">
             <Wallet :size="32" />
          </div>
        </div>

        <div class="secondary-stats">
          <div class="stat-card">
            <div class="card-mini-header">
              <Calendar :size="16" />
              <span>Current Month</span>
            </div>
            <h3 class="mini-value">{{ formatCurrency(stats.this_month_earning) }}</h3>
            <div class="mini-trend positive">
               <ArrowUpRight :size="12" />
               <span>Higher than avg</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="card-mini-header">
              <Clock :size="16" />
              <span>Pending Dues</span>
            </div>
            <h3 class="mini-value pending">{{ formatCurrency(stats.pending_payment) }}</h3>
            <div class="mini-trend neutral">
               <span>Across 2 loads</span>
            </div>
          </div>
        </div>
      </section>

      <!-- History Section -->
      <section class="history-section">
        <div class="section-header">
           <div class="sh-title">
             <h3>Transaction History</h3>
             <span class="count-badge">{{ history.length }} Transactions</span>
           </div>
           
           <div class="layout-toggles">
             <button class="toggle-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"><List :size="18" /></button>
             <button class="toggle-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"><LayoutGrid :size="18" /></button>
           </div>
        </div>

        <transition name="fade-mode" mode="out-in">
          <!-- Table View (List) -->
          <div v-if="viewMode === 'list'" key="table" class="table-container">
            <table>
              <thead>
                <tr>
                  <th class="center-align">#</th>
                  <th>LOAD ID</th>
                  <th>ROUTE</th>
                  <th>PAYMENT BREAKDOWN</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in history" :key="item.load_id" class="history-row">
                  <td class="center-align index-cell">
                     <span class="t-index">{{ index + 1 }}</span>
                  </td>
                  <td class="id-cell">
                     <div class="t-load-info">
                       <span class="t-id">{{ item.load_id }}</span>
                       <span class="t-date">{{ formatDate(item.load_date) }}</span>
                     </div>
                  </td>
                  <td class="route-cell">
                     <div class="t-route">
                       <span>{{ item.origin_location.split(',')[0] }}</span>
                       <ChevronRight :size="12" class="arrow" />
                       <span>{{ item.destination_location.split(',')[0] }}</span>
                     </div>
                  </td>
                  <td class="breakdown-cell">
                     <div class="t-breakdown">
                        <div class="tb-item">
                           <span class="tb-l">Total:</span>
                           <span class="tb-v">{{ formatCurrency(item.amount) }}</span>
                        </div>
                        <div class="tb-item">
                           <span class="tb-l">Paid:</span>
                           <span class="tb-v s">{{ formatCurrency(item.received_amount) }}</span>
                        </div>
                        <div v-if="item.due_amount > 0" class="tb-item">
                           <span class="tb-l">Due:</span>
                           <span class="tb-v d">{{ formatCurrency(item.due_amount) }}</span>
                        </div>
                        <div class="t-progress-mini">
                           <div class="tp-bar">
                              <div class="tp-fill" :style="{ width: getPaymentProgress(item.received_amount, item.amount) + '%', backgroundColor: getPaymentProgress(item.received_amount, item.amount) === 100 ? '#16a34a' : '#f59e0b' }"></div>
                           </div>
                           <span class="tp-text">{{ getPaymentProgress(item.received_amount, item.amount) }}%</span>
                        </div>
                     </div>
                  </td>
                  <td class="status-cell">
                     <div class="status-pill table-status" :class="getStatusColor(item.payment_status)">
                        <span>{{ getStatusLabel(item.payment_status) }}</span>
                     </div>
                  </td>
                  <td class="actions-cell">
                     <div class="t-actions">
                        <button class="t-btn p" title="View Details" @click="emit('navigate', `invoice-detail/${item.load_id}`)"><ExternalLink :size="14" /></button>
                        <button class="t-btn" title="Download Invoice"><Download :size="14" /></button>
                        <button class="t-btn r" title="Report Issue"><AlertTriangle :size="14" /></button>
                     </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Card View (Grid) -->
          <div v-else key="grid" class="cards-grid">
            <div v-for="(item, index) in history" :key="item.load_id" class="history-card">
              <div class="card-header-top">
                <div class="c-index-box">{{ index + 1 }}</div>
                <div class="c-info-group">
                  <span class="c-load-id">{{ item.load_id }}</span>
                  <span class="c-date">{{ formatDate(item.load_date) }}</span>
                </div>
                <div class="status-pill mini" :class="getStatusColor(item.payment_status)">
                   <span>{{ getStatusLabel(item.payment_status) }}</span>
                </div>
              </div>

              <div class="route-display">
                 <div class="r-point">
                    <div class="r-dot origin"></div>
                    <span class="r-loc">{{ item.origin_location }}</span>
                 </div>
                 <div class="r-dash"></div>
                 <div class="r-point">
                    <div class="r-dot dest"></div>
                    <span class="r-loc">{{ item.destination_location }}</span>
                 </div>
              </div>

              <!-- Payment Breakdown -->
              <div class="breakdown-card">
                <div class="b-title">PAYMENT BREAKDOWN</div>
                <div class="b-row">
                   <span class="b-label">Total Cost:</span>
                   <span class="b-value">{{ formatCurrency(item.amount) }}</span>
                </div>
                <div class="b-row">
                   <span class="b-label">Received Amount:</span>
                   <span class="b-value success">{{ formatCurrency(item.received_amount) }}</span>
                </div>
                <div class="b-row">
                   <span class="b-label">Due Amount:</span>
                   <span class="b-value danger">{{ formatCurrency(item.due_amount) }}</span>
                </div>

                <div class="b-progress">
                   <div class="p-bar-bg">
                      <div class="p-bar-fill" :style="{ width: getPaymentProgress(item.received_amount, item.amount) + '%', backgroundColor: getPaymentProgress(item.received_amount, item.amount) === 100 ? '#16a34a' : '#f59e0b' }"></div>
                   </div>
                   <span class="p-text">{{ getPaymentProgress(item.received_amount, item.amount) }}% Paid</span>
                </div>
              </div>

              <div class="card-actions">
                <button class="btn-action primary" @click="emit('navigate', `invoice-detail/${item.load_id}`)">
                  <span>View Details</span>
                  <ChevronRight :size="14" />
                </button>
                <button class="btn-action outline">
                  <Download :size="14" />
                  <span>Invoice</span>
                </button>
                <button class="btn-action outline danger-border">
                  <AlertTriangle :size="14" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Empty State -->
        <div v-if="history.length === 0 && !isLoading" class="empty-state">
           <FileText :size="48" class="empty-icon" />
           <h3>No transactions found</h3>
        </div>

        <div v-if="isLoading" class="loading-state">
           <div class="loader"></div>
           <p>Updating your earnings...</p>
        </div>

        <div v-if="hasMore && !isLoading" class="load-more-btn-wrap">
           <button class="btn-load-more" :disabled="isFetchingMore" @click="loadMore">
             <span v-if="!isFetchingMore">Load More</span>
             <span v-else>Fetching...</span>
           </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.earnings-page { min-height: 100vh; background-color: #ffffff; color: #0f172a; }

/* Header */
.header-section { position: relative; z-index: 100; background: white; border-bottom: 1px solid #e2e8f0; padding: 16px 40px; }
.header-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.title-group { display: flex; align-items: center; gap: 20px; }
.btn-back { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; }
.h-texts h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.h-texts p { font-size: 14px; color: #64748b; }

/* Main Content */
.main-content { max-width: 1400px; margin: 0 auto; padding: 40px; display: flex; flex-direction: column; gap: 40px; }

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: 1fr 480px; gap: 24px; }
.stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
.primary-stats { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); }
.s-label { font-size: 12px; font-weight: 800; color: #64748b; letter-spacing: 0.1em; }
.s-value-group { display: flex; align-items: baseline; gap: 16px; margin: 8px 0; }
.s-value { font-size: 44px; font-weight: 900; color: #0f172a; }
.growth-pill { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; }
.growth-pill.profit { background: #dcfce7; color: #166534; }
.growth-pill.loss { background: #fee2e2; color: #991b1b; }
.s-icon-box { width: 64px; height: 64px; background: #f1f5f9; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #2563eb; }

/* History Section */
.history-section { border: 1px solid #e2e8f0; border-radius: 20px; background: white; overflow: hidden; }
.section-header { padding: 24px 32px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.sh-title h3 { font-size: 18px; font-weight: 800; }

.layout-toggles { display: flex; background: #f1f5f9; padding: 4px; border-radius: 10px; }
.toggle-btn { width: 38px; height: 34px; border: none; background: transparent; border-radius: 8px; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.toggle-btn.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

/* Common Status Pills */
.status-pill { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.status-pill.success { background: #f0fdf4; color: #166534; }
.status-pill.warning { background: #fffbeb; color: #92400e; }
.status-pill.danger { background: #fef2f2; color: #991b1b; }

/* Table View Styles */
.table-container { width: 100%; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { padding: 16px 32px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; background: #fcfcfd; }
td { padding: 18px 32px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.center-align { text-align: center; }

.t-index { font-weight: 800; color: #94a3b8; font-size: 13px; }
.t-load-info { display: flex; flex-direction: column; gap: 4px; }
.t-id { font-family: monospace; font-weight: 800; color: #0f172a; font-size: 14px; }
.t-date { font-size: 12px; color: #94a3b8; font-weight: 600; }

.t-route { display: flex; align-items: center; gap: 10px; font-weight: 700; color: #334155; font-size: 14px; }
.arrow { color: #cbd5e1; }

/* Payment Breakdown in Table */
.t-breakdown { display: flex; flex-direction: column; gap: 2px; min-width: 180px; }
.tb-item { display: flex; justify-content: space-between; font-size: 12px; }
.tb-l { color: #64748b; font-weight: 500; }
.tb-v { font-weight: 700; color: #1e293b; }
.tb-v.s { color: #16a34a; }
.tb-v.d { color: #ef4444; }

.t-progress-mini { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.tp-bar { flex: 1; height: 4px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.tp-fill { height: 100%; transition: width 0.3s; }
.tp-text { font-size: 10px; font-weight: 800; color: #64748b; }

.table-status { font-size: 11px; padding: 4px 10px; }

/* Actions in Table */
.t-actions { display: flex; gap: 8px; }
.t-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.t-btn:hover { border-color: #cbd5e1; background: #f8fafc; color: #0f172a; }
.t-btn.p { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
.t-btn.p:hover { background: #dbeafe; }
.t-btn.r:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }

/* Card Grid View (Restored/Matched) */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; padding: 32px; background: white; }
.history-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; transition: all 0.3s; }
.history-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.05); border-color: #cbd5e1; }

.card-header-top { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.c-index-box { width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #475569; font-size: 14px; }
.c-info-group { flex: 1; display: flex; flex-direction: column; }
.c-load-id { font-family: monospace; font-weight: 800; font-size: 14px; color: #0f172a; }
.c-date { font-size: 12px; color: #94a3b8; font-weight: 600; }
.status-pill.mini { padding: 4px 10px; font-size: 11px; }

.route-display { flex: 1; margin-bottom: 20px; padding: 12px 0; }
.r-point { display: flex; align-items: center; gap: 10px; }
.r-dot { width: 6px; height: 6px; border-radius: 50%; }
.r-dot.origin { background: #cbd5e1; }
.r-dot.dest { background: #2563eb; }
.r-loc { font-size: 13px; font-weight: 600; color: #475569; }
.r-dash { width: 1px; height: 12px; border-left: 2px dashed #e2e8f0; margin: 4px 2px; }

.breakdown-card { background: #f8fafc; border-radius: 16px; padding: 16px; margin-bottom: 20px; border: 1px solid #f1f5f9; }
.b-title { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 12px; }
.b-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.b-label { color: #64748b; font-weight: 500; }
.b-value { font-weight: 700; color: #1e293b; }
.b-value.success { color: #16a34a; }
.b-value.danger { color: #ef4444; }

.b-progress { margin-top: 16px; display: flex; align-items: center; gap: 12px; }
.p-bar-bg { flex: 1; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
.p-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }
.p-text { font-size: 12px; font-weight: 700; color: #475569; white-space: nowrap; }

.card-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.btn-action { height: 38px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
.btn-action.primary { background: #2563eb; border: none; color: white; }
.btn-action.primary:hover { background: #1e40af; }
.btn-action.outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-action.danger-border:hover { color: #ef4444; border-color: #fecaca; background: #fef2f2; }

/* Footer */
.table-footer { padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; background: #fcfcfd; border-top: 1px solid #f1f5f9; }

/* Animations */
.fade-mode-enter-active, .fade-mode-leave-active { transition: opacity 0.2s; }
.fade-mode-enter-from, .fade-mode-leave-to { opacity: 0; }
.empty-state { padding: 60px; text-align: center; }
.empty-icon { color: #e2e8f0; margin-bottom: 16px; }

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  gap: 16px;
  color: #64748b;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Load More */
.load-more-btn-wrap {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.btn-load-more {
  padding: 12px 32px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.btn-load-more:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-2px);
}

.btn-load-more:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
