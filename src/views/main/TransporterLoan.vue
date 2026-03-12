<script setup lang="ts">
import {
  ArrowLeft,
  Banknote,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  PieChart,
  Rocket,
  Gem
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

const loanBenefits = [
  "Working capital for daily operations",
  "Fuel, trip & maintenance expenses",
  "Fleet expansion & vehicle purchase",
  "Cash flow support during slow cycles",
  "Business growth & scalability"
]

const whyChooseUs = [
  "Designed for transporters, not generic products",
  "Trusted financial partners",
  "Simple and clear process",
  "Faster approvals & disbursal",
  "Transparent terms & conditions"
]

const securityFeatures = [
  "Data shared securely and responsibly",
  "Used only for loan eligibility & verification",
  "Partnered with authorized lending institutions",
  "Strong data privacy & security standards"
]
</script>

<template>
  <div class="transporter-loan-view">
    <main class="content-scroll">
      <div class="page-container">
        <!-- Scrollable Header -->
        <header class="view-header">
          <div class="header-left">
            <button class="btn-back" @click="emit('back')">
              <ArrowLeft :size="18" />
            </button>
            <h1 class="view-title">Transporter Tailored Loan</h1>
          </div>
          <div class="header-status">
            <div class="status-pill">
              <Clock :size="12" />
              <span>Coming Soon</span>
            </div>
          </div>
        </header>

        <!-- Hero Section: The Vision (Horizontal & Financial Theme) -->
        <section class="hero-card">
          <div class="hero-content">
            <div class="hero-text-side">
              <div class="coming-soon-tag">
                <Sparkles :size="12" />
                COMING SOON
              </div>
              <h2 class="hero-title">Financial Growth for Transporters</h2>
              <p class="hero-subtitle">
                Loans designed specially for transporters to support business growth and smooth fleet operations.
              </p>
              <p class="hero-tagline">
                No agents. No confusion. <span>Just simple, transparent loan support.</span>
              </p>
            </div>
            <div class="hero-graphic-side">
              <div class="hero-logo-box">
                <div class="floating-icons">
                  <Banknote class="float-icon-1" :size="20" />
                  <TrendingUp class="float-icon-2" :size="16" />
                </div>
                <Gem :size="36" color="#ffffff" />
              </div>
            </div>
          </div>
          <div class="hero-bg-visuals">
            <div class="glow-sphere"></div>
            <div class="mesh-pattern"></div>
          </div>
        </section>

        <!-- Feature Bento Grid -->
        <div class="feature-bento">
          <!-- What is it? -->
          <div class="bento-card intro-card">
            <div class="card-icon-header indigo">
              <Building2 :size="20" />
            </div>
            <h3>What is Transporter Tailored Loan?</h3>
            <p>TruckMitr is bringing tailored loan solutions for transporters to support working capital, fleet operations, and long-term business growth.</p>
            <div class="card-badge indigo">
              <Briefcase :size="12" />
              <span>Built for transporters, by TruckMitr</span>
            </div>
          </div>

          <!-- What it helps with -->
          <div class="bento-card help-card">
            <div class="card-icon-header emerald">
              <PieChart :size="20" />
            </div>
            <h3>What the loan will help with</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in loanBenefits" :key="i">
                <div class="check-mark emerald"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <p class="emphasis-text">Loans that understand transporter needs.</p>
          </div>

          <!-- Why choose us -->
          <div class="bento-card why-card">
            <div class="card-icon-header amber">
              <Gem :size="20" />
            </div>
            <h3>Why choose TruckMitr loans</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in whyChooseUs" :key="i">
                <div class="list-dot amber"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="quote-strip">
              Your business. Your growth. Our support.
            </div>
          </div>

          <!-- Secure & Reliable -->
          <div class="bento-card security-card">
            <div class="card-icon-header green">
              <ShieldCheck :size="20" />
            </div>
            <div class="security-header">
              <span class="security-tag">Secure & Reliable</span>
            </div>
            <ul class="feature-list">
              <li v-for="(item, i) in securityFeatures" :key="i">
                <div class="check-mark green"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Launch Status -->
          <div class="bento-card launch-card">
            <div class="card-icon-header rose">
              <Rocket :size="20" />
            </div>
            <div class="launch-content">
              <h3>Coming soon for transporters</h3>
              <p>TruckMitr is working with financial partners to bring reliable and hassle-free loan solutions for transporters.</p>
              <div class="update-pill">
                <Clock :size="14" />
                <span>Stay tuned for launch updates</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Banner -->
        <footer class="final-banner">
          <div class="banner-content">
            <div class="banner-left">
              <div class="banner-icon">
                <Banknote :size="20" />
              </div>
              <div class="banner-text">
                <h2>Transporter Tailored Loan</h2>
                <p>"Finance that moves your business forward"</p>
              </div>
            </div>
            <div class="banner-right">
              Launching soon. Stay connected with TruckMitr.
            </div>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.transporter-loan-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: 'Outfit', sans-serif;
  color: #1e293b;
}

/* Header */
.view-header {
  background: transparent;
  padding: 0 0 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.btn-back {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
}

.btn-back:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: translateX(-2px);
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  background: #fff7ed;
  color: #ea580c;
  border: 1.5px solid #ffedd5;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Content */
.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2.5rem;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Hero Card - Indigo/Corporate Theme */
.hero-card {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 12px 24px -6px rgba(79, 70, 229, 0.2);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.hero-text-side {
  flex: 1;
  text-align: left;
}

.coming-soon-tag {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  width: fit-content;
}

.hero-title {
  font-size: 1.85rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
}

.hero-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 500px;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.hero-tagline {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.hero-tagline span {
  color: #ffffff;
  font-weight: 700;
}

.hero-logo-box {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Floating Animation */
.floating-icons {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.float-icon-1 {
  position: absolute;
  top: -12px;
  right: -12px;
  color: #818cf8;
  animation: float 3s ease-in-out infinite;
}

.float-icon-2 {
  position: absolute;
  bottom: -10px;
  left: -10px;
  color: #a5b4fc;
  animation: float 3s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hero-bg-visuals .glow-sphere {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%);
  top: -50px;
  right: -50px;
  filter: blur(40px);
}

.hero-bg-visuals .mesh-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
}

/* Bento Grid */
.feature-bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.25rem;
}

.bento-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid #eef2f6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
}

.bento-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 25px -8px rgba(0, 0, 0, 0.08);
}

.card-icon-header {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.card-icon-header.indigo { background: #e0e7ff; color: #4f46e5; }
.card-icon-header.emerald { background: #ecfdf5; color: #10b981; }
.card-icon-header.amber { background: #fffbeb; color: #f59e0b; }
.card-icon-header.green { background: #f0fdf4; color: #16a34a; }
.card-icon-header.rose { background: #fff1f2; color: #e11d48; }

.bento-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.bento-card p {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #475569;
}

.intro-card { grid-column: span 3; }
.help-card { grid-column: span 3; }
.why-card { grid-column: span 3; }
.security-card { grid-column: span 3; }
.launch-card { grid-column: span 6; }

.card-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 0.875rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.card-badge.indigo { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; }

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.check-mark {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  background-size: 8px;
  background-position: center;
  background-repeat: no-repeat;
  margin-top: 3px;
}

.check-mark.emerald { background-color: #10b981; }
.check-mark.green { background-color: #16a34a; }

.list-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}
.list-dot.amber { background: #f59e0b; }

.emphasis-text {
  margin-top: 1.25rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: #059669;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.quote-strip {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fefce8;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #854d0e;
  border-left: 3px solid #facc15;
}

.security-header {
  margin-bottom: 1rem;
}

.security-tag {
  font-size: 0.75rem;
  font-weight: 800;
  color: #16a34a;
  text-transform: uppercase;
}

.launch-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
}

.update-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #fff1f2;
  border-radius: 99px;
  color: #e11d48;
  font-size: 0.8125rem;
  font-weight: 700;
  width: fit-content;
}

/* Footer Banner */
.final-banner {
  background: #1e1b4b;
  border-radius: 20px;
  padding: 1.25rem 2rem;
  color: #ffffff;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.banner-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818cf8;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.banner-text h2 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
}

.banner-text p {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.125rem 0 0;
}

.banner-right {
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-card, .bento-card, .final-banner {
  animation: fadeInUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
}

.bento-card:nth-child(1) { animation-delay: 0.1s; }
.bento-card:nth-child(2) { animation-delay: 0.2s; }
.bento-card:nth-child(3) { animation-delay: 0.3s; }
.bento-card:nth-child(4) { animation-delay: 0.4s; }
.bento-card:nth-child(5) { animation-delay: 0.5s; }
</style>
