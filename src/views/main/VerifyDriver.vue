<script setup lang="ts">
import { 
  ArrowLeft,
  ShieldCheck,
  FileText,
  Scale,
  MapPin,
  CheckCircle,
  Lock,
  PhoneCall,
  ArrowRight
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

// For demonstration purposes, verify driver goes to add-driver and contact sales does a mailto or alert
const handleVerify = () => {
  emit('navigate', 'driver-list')
}

const handleContactSales = () => {
  emit('navigate', 'contact-us')
}
</script>

<template>
  <div class="verify-master">
    <div class="page-container">
      <!-- Top Header -->
      <header class="page-header">
        <button class="icon-back-btn" @click="emit('back')" title="Go Back">
          <ArrowLeft :size="20" />
        </button>
        <div class="header-titles">
          <h1 class="main-title">Verify Your Drivers</h1>
          <p class="sub-title">Ensure safety and compliance through essential background checks.</p>
        </div>
      </header>

      <div class="content-container">
        
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-badge">
              <ShieldCheck :size="16" class="badge-icon" />
              <span>Trust & Safety Program</span>
            </div>
            <h2>Verify Your Drivers</h2>
            <p>Hire with confidence by verifying your drivers through essential background checks. TruckMitr helps transporters ensure safety, compliance, and trust across operations.</p>
          </div>
          <div class="hero-pattern"></div>
        </section>

        <!-- What is driver verification -->
        <section class="info-card">
          <div class="section-title-wrap">
            <h3>What is driver verification?</h3>
          </div>
          <p>TruckMitr enables transporters to verify drivers through essential background checks to build trust and ensure compliant operations.</p>
        </section>

        <!-- Verification Checks Covered -->
        <section class="checks-section">
          <h3>Verification Checks Covered</h3>
          <div class="checks-grid">
            <!-- ID Check -->
            <div class="check-card">
              <div class="check-icon id-icon">
                <FileText :size="24" />
              </div>
              <h4>ID Check</h4>
              <div class="divider"></div>
              <p class="req-title">Required details/documents:</p>
              <ul>
                <li>Government-issued Photo ID (Aadhaar / Voter ID / PAN)</li>
                <li>Valid Driving License</li>
              </ul>
            </div>

            <!-- Court Check -->
            <div class="check-card">
              <div class="check-icon court-icon">
                <Scale :size="24" />
              </div>
              <h4>Court Check</h4>
              <div class="divider"></div>
              <p class="req-title">Required details/documents:</p>
              <ul>
                <li>Full Name & DOB</li>
                <li>Address & Father's Name</li>
              </ul>
            </div>

            <!-- Digital Address Check -->
            <div class="check-card">
              <div class="check-icon address-icon">
                <MapPin :size="24" />
              </div>
              <h4>Digital Address Check</h4>
              <div class="divider"></div>
              <p class="req-title">Required details/documents:</p>
              <ul>
                <li>Mobile Number</li>
                <li>Full Name</li>
                <li>Current Address</li>
              </ul>
            </div>
          </div>
        </section>

        <div class="split-section">
          <!-- Why verify your drivers -->
          <section class="benefits-section">
            <h3>Why verify your drivers</h3>
            <ul class="benefit-list">
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Build a trusted & reliable driver workforce</span>
              </li>
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Reduce operational & legal risks</span>
              </li>
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Improve safety & compliance</span>
              </li>
              <li>
                <div class="benefit-icon"><CheckCircle :size="18" /></div>
                <span>Enable faster & confident hiring decisions</span>
              </li>
            </ul>
          </section>

          <!-- Pricing -->
          <section class="pricing-card">
            <h3>Pricing</h3>
            <div class="price-amount">
              <span class="currency">₹</span>
              <span class="amount">1,000</span>
              <span class="gst">+ GST</span>
            </div>
            <p class="price-desc">per driver</p>
            <div class="price-includes">
              (Includes ID Check, Court Check & Digital Address Check)
            </div>
            
            <div class="bulk-deal">
              <h5>Bulk Verification (10+ drivers)</h5>
              <button class="sales-link-btn" @click="handleContactSales">
                <PhoneCall :size="16" /> Contact Sales for bulk deals
              </button>
            </div>
          </section>
        </div>

        <!-- How it works -->
        <section class="how-it-works">
          <h3>How it works</h3>
          <div class="timeline">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-content">
                <h4>Submit driver information</h4>
                <p>Enter the required personal and document details into the secure portal.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-content">
                <h4>Required checks are initiated</h4>
                <p>Our systems immediately begin processing the ID, Court, and Address checks.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-content">
                <h4>Status updated in the app</h4>
                <p>Track the progress in real-time. Each verification is processed securely and efficiently.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Data privacy -->
        <section class="privacy-banner">
          <Lock :size="24" class="privacy-icon" />
          <div class="privacy-content">
            <h4>Data privacy & security</h4>
            <p>All driver data is encrypted and used only for verification purposes, following strict data protection standards.</p>
          </div>
        </section>

      </div>
    </div>

    <!-- Sticky Bottom Actions (Fixed at bottom of screen) -->
    <div class="action-footer">
      <div class="footer-container">
        <button class="btn btn-secondary" @click="handleContactSales">
          <PhoneCall :size="18" />
          Contact Sales
        </button>
        <button class="btn btn-primary" @click="handleVerify">
          Verify Driver
          <ArrowRight :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.verify-master {
  padding: 40px;
  background-color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  padding-bottom: 120px; /* Space for the fixed action footer */
}

.page-container {
  max-width: 1000px;
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

.content-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-section, .info-card, .checks-section, .split-section, .how-it-works, .privacy-banner {
  animation: fadeInUp 0.6s ease-out backwards;
}

.info-card { animation-delay: 0.1s; }
.checks-section { animation-delay: 0.2s; }
.split-section { animation-delay: 0.3s; }
.how-it-works { animation-delay: 0.4s; }
.privacy-banner { animation-delay: 0.5s; }

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #172554 100%);
  border-radius: 24px;
  padding: 56px 48px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.3);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.hero-content h2 {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.hero-content p {
  font-size: 16px;
  color: #bfdbfe;
  line-height: 1.6;
  margin: 0;
}

.hero-pattern {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background-image: radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.2) 0%, transparent 60%);
  z-index: 1;
}

/* Common Text Styles */
h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px 0;
}

/* Info Card */
.info-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}

.info-card p {
  color: #475569;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

/* Checks Section */
.checks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.check-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.check-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: transparent;
  transition: background 0.4s;
}

.check-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px -8px rgba(0,0,0,0.1);
  border-color: #cbd5e1;
}

.check-card:hover::after {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.check-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.id-icon { background: #eff6ff; color: #2563eb; }
.court-icon { background: #fdf4ff; color: #c026d3; }
.address-icon { background: #f0fdf4; color: #16a34a; }

.check-card h4 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 16px;
}

.req-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.check-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.check-card ul li {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  color: #334155;
  margin-bottom: 8px;
  line-height: 1.5;
}

.check-card ul li::before {
  content: '•';
  color: #94a3b8;
  position: absolute;
  left: 0;
  top: 0;
  font-size: 18px;
}

/* Split Section */
.split-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 32px;
  align-items: stretch;
}

@media (max-width: 768px) {
  .split-section {
    grid-template-columns: 1fr;
  }
}

/* Benefits Section */
.benefit-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.benefit-icon {
  color: #16a34a;
  flex-shrink: 0;
  margin-top: 2px;
}

.benefit-list span {
  font-size: 15px;
  color: #334155;
  line-height: 1.5;
  font-weight: 500;
}

/* Pricing Card */
.pricing-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  border: 1px solid #bfdbfe;
  background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%);
  box-shadow: 0 10px 30px -5px rgba(37, 99, 235, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.pricing-card::before {
  content: 'Best Value';
  position: absolute;
  top: 16px; right: -32px;
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 32px;
  transform: rotate(45deg);
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pricing-card h3 {
  text-align: center;
}

.price-amount {
  display: flex;
  justify-content: center;
  align-items: baseline;
  color: #0f172a;
  margin-bottom: 4px;
}

.currency { font-size: 24px; font-weight: 600; }
.amount { font-size: 48px; font-weight: 800; letter-spacing: -1px; }
.gst { font-size: 16px; color: #64748b; font-weight: 500; margin-left: 4px; }

.price-desc {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
  margin: 0 0 16px 0;
}

.price-includes {
  font-size: 13px;
  color: #475569;
  background: rgba(255,255,255,0.8);
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 24px;
}

.bulk-deal {
  border-top: 1px dashed #cbd5e1;
  padding-top: 20px;
}

.bulk-deal h5 {
  font-size: 14px;
  color: #0f172a;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.sales-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.sales-link-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
}

/* Timeline */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: #e2e8f0;
}

.step {
  display: flex;
  gap: 20px;
  position: relative;
}

.step-num {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  z-index: 2;
  box-shadow: 0 0 0 6px #f8fafc, 0 4px 10px rgba(37, 99, 235, 0.3);
}

.step-content {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 24px;
  border-radius: 16px;
  flex: 1;
  box-shadow: 0 4px 12px -2px rgba(0,0,0,0.02);
  transition: transform 0.3s, box-shadow 0.3s;
}

.step-content:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px -4px rgba(0,0,0,0.05);
  border-color: #cbd5e1;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

/* Privacy Banner */
.privacy-banner {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: #f1f5f9;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.privacy-icon {
  color: #475569;
  flex-shrink: 0;
  margin-top: 4px;
}

.privacy-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.privacy-content p {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

/* Footer Actions */
.action-footer {
  position: fixed;
  bottom: 0;
  left: 260px; /* align to right panel assuming sidebar is 260px */
  right: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  padding: 20px 40px;
  box-shadow: 0 -10px 30px -10px rgba(0,0,0,0.05);
  z-index: 20;
}

@media (max-width: 768px) {
  .action-footer { left: 0; padding: 16px 24px; }
}

.footer-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.btn-secondary {
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  border: 1px solid transparent;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e3a8a);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

@media (max-width: 600px) {
  .action-container {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
}
</style>
