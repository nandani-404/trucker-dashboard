<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  ArrowLeft, Share2, Download,
  MapPin, Building2, User,
  Truck, ShieldCheck, CreditCard,
  CheckCircle2
} from 'lucide-vue-next'

const props = defineProps<{
  invoiceId?: string
}>()

const emit = defineEmits(['back'])

// --- Mock Data (Matched with provided RN code) ---
const invoiceData = ref({
    invoiceNo: props.invoiceId || 'INV-2024-0875',
    loadId: 'LD-2024-0875',
    date: '3 Feb 2024',
    paidDate: '3 Feb 2024',
    status: 'Paid',
    shipper: { 
      name: 'Tata Steel Ltd', 
      address: 'Industrial Area, Jamshedpur, Jharkhand - 831001', 
      gstin: '20AABCT1332L1ZW',
      email: 'logistics@tatasteel.com'
    },
    trucker: { 
      name: 'Rajesh Kumar', 
      vehicleNo: 'MH-12-AB-1234', 
      licenseNo: 'MH01-1234567890' 
    },
    trip: { 
      origin: 'Mumbai', 
      destination: 'Pune', 
      distance: '148 km', 
      loadType: 'Steel Coils', 
      weight: '12 Tons' 
    },
    charges: { 
      basicFreight: 16000, 
      tollCharges: 1200, 
      loadingCharges: 800, 
      insuranceCharges: 500, 
      totalAmount: 18500 
    },
    payment: { 
      method: 'Bank Transfer', 
      txnId: 'TXN7891234', 
      bankName: 'HDFC Bank' 
    }
})

const isLoading = ref(true)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 800)
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

const handleShare = async () => {
    const text = `Invoice ${invoiceData.value.invoiceNo}\nAmount: ₹${invoiceData.value.charges.totalAmount}\nTrip: ${invoiceData.value.trip.origin} → ${invoiceData.value.trip.destination}`
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Invoice Details',
                text: text,
                url: window.location.href
            })
        } catch (err) {
            console.error('Share error:', err)
        }
    } else {
        navigator.clipboard.writeText(text)
        alert('Invoice details copied to clipboard!')
    }
}

const handleDownload = () => {
    // Using the INVOICE_DOWNLOAD endpoint from api.ts
    // Assuming BASE_URL is accessible or we hardcode it if needed
    // In this project, we can just use the path if it's relative
    window.open(`https://development.truckmitr.com/api/invoice/${props.invoiceId || invoiceData.value.loadId}`, '_blank')
}
</script>

<template>
  <div class="invoice-detail-view">
    <!-- relativo (scrollable) Header -->
    <header class="page-header no-print">
      <div class="header-inner">
        <div class="h-left">
          <button class="btn-back" @click="emit('back')">
            <ArrowLeft :size="20" />
          </button>
          <div class="h-titles">
            <h1>Tax Invoice Details</h1>
            <div class="h-meta-row">
               <span class="inv-id">{{ invoiceData.invoiceNo }}</span>
               <div class="status-badge success">
                  <CheckCircle2 :size="12" />
                  <span>{{ invoiceData.status }}</span>
               </div>
            </div>
          </div>
        </div>
        <div class="h-right">
           <button class="btn-share" title="Share Invoice" @click="handleShare">
             <Share2 :size="18" />
             <span>Share</span>
           </button>
           <button class="btn-download" @click="handleDownload">
             <Download :size="18" />
             <span>Download Invoice</span>
           </button>
        </div>
      </div>
    </header>

    <main class="page-container">
      <div v-if="isLoading" class="skeleton-state">
         <div class="sk-header"></div>
         <div class="sk-grid">
            <div class="sk-main"></div>
            <div class="sk-side"></div>
         </div>
      </div>

      <div v-else class="invoice-content-grid" id="printable-area">
        <!-- Dashboard Sidebar -->
        <aside class="invoice-stats-sidebar">
          <div class="stats-card highlight">
             <div class="label-group">
                <label>TOTAL AMOUNT RECEIVED</label>
                <div class="stats-price">{{ formatCurrency(invoiceData.charges.totalAmount) }}</div>
             </div>
             <div class="stats-divider"></div>
             <div class="stats-rows">
                <div class="stat-row">
                   <span>Invoice Date</span>
                   <span class="v">{{ invoiceData.date }}</span>
                </div>
                <div class="stat-row">
                   <span>Paid Date</span>
                   <span class="v">{{ invoiceData.paidDate }}</span>
                </div>
             </div>
          </div>

          <!-- Bank Information -->
          <div class="stats-card">
             <div class="card-header-icon blue">
                <CreditCard :size="16" />
                <h3>Bank Information</h3>
             </div>
             <div class="bank-details">
                <div class="b-block">
                   <label>Payment Method</label>
                   <span>{{ invoiceData.payment.method }}</span>
                </div>
                <div class="b-block">
                   <label>Transaction ID</label>
                   <span class="mono">{{ invoiceData.payment.txnId }}</span>
                </div>
                <div class="b-block">
                   <label>Bank Name</label>
                   <span>{{ invoiceData.payment.bankName }}</span>
                </div>
                
                <div class="payment-marker">
                   <CheckCircle2 :size="14" />
                   <span>Payment Verified</span>
                </div>
             </div>
          </div>

          <div class="disclaimer no-print">
             <ShieldCheck :size="16" />
             <p>Certified digital invoice. No physical signature required for GST returns.</p>
          </div>
        </aside>

        <!-- Document Main Body -->
        <div class="invoice-main-body">
          <!-- Entities: Shipper & Driver -->
          <div class="address-grid">
             <div class="address-card">
                <div class="card-header-icon grey">
                   <Building2 :size="18" />
                   <h3>Shipper Details</h3>
                </div>
                <div class="addr-content">
                   <h4 class="name-bold">{{ invoiceData.shipper.name }}</h4>
                   <div class="gst-row">GSTIN: <strong>{{ invoiceData.shipper.gstin }}</strong></div>
                   <p class="addr-text">{{ invoiceData.shipper.address }}</p>
                </div>
             </div>

             <div class="address-card">
                <div class="card-header-icon grey">
                   <User :size="18" />
                   <h3>Service Provider</h3>
                </div>
                <div class="addr-content">
                   <h4 class="name-bold">{{ invoiceData.trucker.name }}</h4>
                   <div class="veh-info">
                      <Truck :size="14" />
                      <span>{{ invoiceData.trucker.vehicleNo }}</span>
                   </div>
                   <p class="license">DL No: {{ invoiceData.trucker.licenseNo }}</p>
                </div>
             </div>
          </div>

          <!-- Trip Details -->
          <section class="trip-detail-section">
             <div class="section-title-strip">
                <MapPin :size="18" />
                <h3>Trip Details</h3>
             </div>

             <div class="trip-path-viz">
                <div class="path-point left">
                   <div class="p-dot"></div>
                   <div class="p-text">
                      <label>FROM</label>
                      <span>{{ invoiceData.trip.origin }}</span>
                   </div>
                </div>
                <div class="path-connector">
                   <div class="line"></div>
                   <div class="dist-badge">{{ invoiceData.trip.distance }}</div>
                </div>
                <div class="path-point right">
                   <div class="p-dot blue"></div>
                   <div class="p-text">
                      <label>TO</label>
                      <span>{{ invoiceData.trip.destination }}</span>
                   </div>
                </div>
             </div>

             <div class="trip-meta-grid">
                <div class="meta-item">
                   <label>Load ID</label>
                   <span>{{ invoiceData.loadId }}</span>
                </div>
                <div class="meta-item border-l">
                   <label>Material Type</label>
                   <span>{{ invoiceData.trip.loadType }}</span>
                </div>
                <div class="meta-item border-l">
                   <label>Total Weight</label>
                   <span>{{ invoiceData.trip.weight }}</span>
                </div>
             </div>
          </section>

          <!-- Charges Breakdown -->
          <section class="charges-breakdown-section">
             <div class="section-title-strip">
                <FileText :size="18" />
                <h3>Charges Breakdown</h3>
             </div>
             
             <div class="billing-table-wrapper">
                <table class="billing-table">
                   <thead>
                      <tr>
                         <th>CHARGES DESCRIPTION</th>
                         <th class="tbl-amt">AMOUNT</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr>
                         <td>Basic Freight Charges</td>
                         <td class="tbl-amt val-bold font-blue">{{ formatCurrency(invoiceData.charges.basicFreight) }}</td>
                      </tr>
                      <tr>
                         <td>Toll Charges</td>
                         <td class="tbl-amt">{{ formatCurrency(invoiceData.charges.tollCharges) }}</td>
                      </tr>
                      <tr>
                         <td>Loading Charges</td>
                         <td class="tbl-amt">{{ formatCurrency(invoiceData.charges.loadingCharges) }}</td>
                      </tr>
                      <tr>
                         <td>Insurance</td>
                         <td class="tbl-amt">{{ formatCurrency(invoiceData.charges.insuranceCharges) }}</td>
                      </tr>
                   </tbody>
                   <tfoot>
                      <tr class="subtotal-raw">
                         <td>NET REVENUE</td>
                         <td class="tbl-amt">{{ formatCurrency(invoiceData.charges.totalAmount) }}</td>
                      </tr>
                      <tr class="grand-total-raw">
                         <td>TOTAL PAYABLE</td>
                         <td class="tbl-amt val-success">{{ formatCurrency(invoiceData.charges.totalAmount) }}</td>
                      </tr>
                   </tfoot>
                </table>
             </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.invoice-detail-view {
  min-height: 100vh;
  background-color: #ffffff; /* User request: bg should be white */
  color: #0f172a;
}

/* Header - reltative (scrollable) */
.page-header {
  background: white;
  border-bottom: 1px solid #f1f5f9;
  padding: 24px 40px;
  position: relative; /* User request: scrollable header */
}

.header-inner {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.h-left { display: flex; align-items: center; gap: 24px; }

.btn-back {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #64748b;
}

.btn-back:hover {
  background: #f8fafc;
  color: #2563eb;
  border-color: #2563eb;
  transform: rotate(-10deg);
}

.h-titles h1 { font-size: 24px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 6px; }

.h-meta-row { display: flex; align-items: center; gap: 12px; }
.inv-id { font-family: monospace; font-size: 13px; font-weight: 700; color: #94a3b8; background: #f8fafc; padding: 2px 10px; border-radius: 6px; }

.status-badge { display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.status-badge.success { background: #dcfce7; color: #166534; }

.h-right { display: flex; gap: 12px; }

.btn-download, .btn-share {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-download { background: #2563eb; color: white; border: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
.btn-download:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }

.btn-share { background: white; border: 1.5px solid #e2e8f0; color: #64748b; }
.btn-share:hover { background: #f8fafc; border-color: #cbd5e1; color: #334155; }

/* Main Area */
.page-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px;
}

.invoice-content-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 48px;
  align-items: start;
}

/* Sidebar Stats */
.invoice-stats-sidebar { display: flex; flex-direction: column; gap: 24px; }

.stats-card { 
  background: white; 
  border: 1px solid #e2e8f0; 
  border-radius: 20px; 
  padding: 32px; 
}
.stats-card.highlight { background: linear-gradient(135deg, #ffffff 0%, #fcfdfe 100%); border-color: #e2e8f0; }

.label-group label { font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; }
.stats-price { font-size: 34px; font-weight: 950; color: #0f172a; margin-top: 10px; letter-spacing: -0.04em; }

.stats-divider { height: 1.5px; background: #f1f5f9; margin: 24px -32px; }

.stat-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #64748b; font-weight: 600; }
.stat-row .v { color: #1e293b; font-weight: 800; }

.card-header-icon { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.card-header-icon h3 { font-size: 15px; font-weight: 800; color: #334155; }
.card-header-icon.blue { color: #2563eb; }
.card-header-icon.grey { color: #94a3b8; }

.bank-details { display: flex; flex-direction: column; gap: 20px; }
.b-block label { display: block; font-size: 11px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; margin-bottom: 6px; }
.b-block span { font-size: 14px; font-weight: 700; color: #1e293b; display: block; }

.payment-marker { display: flex; align-items: center; gap: 10px; padding: 16px; background: #f0fdf4; border-radius: 16px; color: #16a34a; font-size: 13px; font-weight: 800; margin-top: 10px; }

.disclaimer { display: flex; gap: 12px; padding: 20px; background: #fafafa; border-radius: 16px; border: 1px dashed #e5e7eb; font-size: 12px; color: #9ca3af; line-height: 1.5; }

/* Body Content */
.invoice-main-body { display: flex; flex-direction: column; gap: 40px; }

.address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }

.address-card { 
  background: white;
  border: 1px solid #e2e8f0; 
  padding: 32px; 
  border-radius: 20px; 
}

.name-bold { font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
.gst-row { font-size: 13px; color: #64748b; margin-bottom: 14px; }
.addr-text { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
.contact-line { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #2563eb; }

.veh-info { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #334155; margin-bottom: 6px; }
.license { font-size: 14px; color: #64748b; }

/* Trip & Charges Strips */
.section-title-strip { display: flex; align-items: center; gap: 10px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 32px; }
.section-title-strip h3 { font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; }

.trip-detail-section { 
  padding: 40px; 
  background: white; 
  border-radius: 24px; 
  border: 1px solid #e2e8f0; 
}

.trip-path-viz { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; padding: 0 10px; }
.path-point { display: flex; flex-direction: column; gap: 12px; }
.p-dot { width: 14px; height: 14px; border-radius: 50%; border: 4px solid #f1f5f9; background: #cbd5e1; }
.p-dot.blue { background: #2563eb; border-color: #eff6ff; }

.p-text label { display: block; font-size: 10px; font-weight: 900; color: #cbd5e1; margin-bottom: 4px; }
.p-text span { font-size: 16px; font-weight: 800; color: #0f172a; }

.path-connector { flex: 1; margin: 0 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: -24px; }
.path-connector .line { width: 100%; height: 2px; background: #f1f5f9; }
.dist-badge { background: white; padding: 6px 14px; border-radius: 30px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 800; color: #94a3b8; }

.trip-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); padding-top: 24px; border-top: 1px solid #f1f5f9; }
.meta-item { padding: 0 24px; display: flex; flex-direction: column; gap: 4px; }
.meta-item:first-child { padding-left: 0; }
.meta-item.border-l { border-left: 1px solid #f1f5f9; }
.meta-item label { font-size: 11px; font-weight: 700; color: #94a3b8; }
.meta-item span { font-size: 14px; font-weight: 800; color: #1e293b; }

.charges-breakdown-section { 
  padding: 40px; 
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
}

.billing-table-wrapper { width: 100%; }
.billing-table { width: 100%; border-collapse: separate; border-spacing: 0; }

.billing-table th { padding: 16px; font-size: 12px; font-weight: 900; color: #cbd5e1; border-bottom: 2px solid #f8fafc; text-align: left; }
.billing-table td { padding: 20px 16px; font-size: 15px; color: #475569; border-bottom: 1px solid #fcfcfd; }
.tbl-amt { text-align: right; }
.val-bold { font-weight: 800; color: #0f172a; }
.font-blue { color: #2563eb; }

.subtotal-raw td { padding-top: 40px; border: none; font-size: 15px; font-weight: 700; color: #94a3b8; }
.grand-total-raw td { border: none; font-size: 24px; font-weight: 950; color: #0f172a; padding-top: 16px; }
.val-success { color: #16a34a; }

/* skeleton frames... (skipped for brevity, same concept) */
.skeleton-state { display: flex; flex-direction: column; gap: 32px; }
.sk-header { height: 120px; background: #f1f5f9; border-radius: 24px; animation: pulse 1.5s infinite; }
.sk-grid { display: grid; grid-template-columns: 340px 1fr; gap: 48px; }
.sk-main { height: 600px; background: #f1f5f9; border-radius: 32px; animation: pulse 1.5s infinite; }
.sk-side { height: 400px; background: #f1f5f9; border-radius: 24px; animation: pulse 1.5s infinite; }

@keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

@media print {
  .no-print { display: none; }
  .invoice-detail-view { background: white; }
  .page-container { padding: 0; }
  .invoice-content-grid { display: block; }
  .invoice-stats-sidebar { display: flex; flex-direction: row; gap: 20px; flex-wrap: wrap; border-bottom: 2px solid #000; margin-bottom: 40px; }
  .stats-card { border: none; box-shadow: none; flex: 1; padding: 20px 0; }
  .invoice-main-body { gap: 20px; }
}
</style>
