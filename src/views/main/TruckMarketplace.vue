<script setup lang="ts">
import {
  ArrowLeft,
  Truck,
  Search,
  Repeat,
  TrendingUp,
  Clock,
  Sparkles,
  Rocket,
  ArrowRightLeft,
  Briefcase
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

const userCapabilities = [
  "Buy verified second-hand trucks",
  "Sell your used trucks to genuine buyers",
  "View detailed truck specifications",
  "Compare options and make informed decisions",
  "Save time and effort in the buying process"
]

const marketplaceBenefits = [
  "Reduces risk in buying used trucks",
  "Brings transparency to pricing & details",
  "Connects genuine buyers and sellers",
  "Supports business expansion at lower cost",
  "Makes fleet upgrades easier & faster"
]

const builtForTransporters = [
  "Transporter-focused buying & selling",
  "Trusted listings with reliable information",
  "Simple & easy-to-use platform",
  "Designed for Indian trucking needs"
]
</script>

<template>
  <div class="marketplace-view">
    <main class="content-scroll">
      <div class="page-container">
        <!-- Scrollable Header -->
        <header class="view-header">
          <div class="header-left">
            <button class="btn-back" @click="emit('back')">
              <ArrowLeft :size="18" />
            </button>
            <h1 class="view-title">Truck Marketplace</h1>
          </div>
          <div class="header-status">
            <div class="status-pill">
              <Clock :size="12" />
              <span>Coming Soon</span>
            </div>
          </div>
        </header>

        <!-- Hero Section: Marketplace Vision (Horizontal & Sky Blue Theme) -->
        <section class="hero-card">
          <div class="hero-content">
            <div class="hero-text-side">
              <div class="coming-soon-tag">
                <Sparkles :size="12" />
                COMING SOON
              </div>
              <h2 class="hero-title">Second Hand Truck Marketplace</h2>
              <p class="hero-subtitle">
                Buy and sell used trucks with confidence. A trusted platform to find reliable used trucks and sell yours easily.
              </p>
              <div class="hero-labels">
                <span class="label-chip">Simple</span>
                <span class="label-chip">Transparent</span>
                <span class="label-chip">Transporter-Focused</span>
              </div>
            </div>
            <div class="hero-graphic-side">
              <div class="hero-logo-box">
                <div class="logo-circles">
                  <div class="circle c1"></div>
                  <div class="circle c2"></div>
                </div>
                <Truck :size="36" color="#ffffff" />
              </div>
            </div>
          </div>
          <div class="hero-bg-visuals">
            <div class="glow-sphere"></div>
            <div class="dot-pattern"></div>
          </div>
        </section>

        <!-- Feature Bento Grid -->
        <div class="feature-bento">
          <!-- What is it? -->
          <div class="bento-card intro-card">
            <div class="card-icon-header sky">
              <Search :size="20" />
            </div>
            <h3>What is Second Hand Truck Marketplace?</h3>
            <p>TruckMitr is launching a Second Hand Truck Marketplace to help transporters buy reliable used trucks and sell their trucks easily on one trusted platform.</p>
            <div class="card-status sky">
              <Repeat :size="14" />
              <span>Simple. Transparent. Transporter-focused.</span>
            </div>
          </div>

          <!-- What you can do -->
          <div class="bento-card actions-card">
            <div class="card-icon-header emerald">
              <ArrowRightLeft :size="20" />
            </div>
            <h3>What you can do</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in userCapabilities" :key="i">
                <div class="check-mark emerald"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="action-footer">
              <span>✓ Clear actions</span>
              <span>✓ Easy to understand</span>
            </div>
          </div>

          <!-- Why it matters -->
          <div class="bento-card value-card">
            <div class="card-icon-header amber">
              <TrendingUp :size="20" />
            </div>
            <h3>Why this marketplace matters</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in marketplaceBenefits" :key="i">
                <div class="list-dot amber"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="business-value-strip">
              Strong business value for your fleet.
            </div>
          </div>

          <!-- Built for Transporters -->
          <div class="bento-card portal-card">
            <div class="card-icon-header indigo">
              <Briefcase :size="20" />
            </div>
            <h3>Built for transporters</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in builtForTransporters" :key="i">
                <div class="check-mark indigo"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Coming Soon -->
          <div class="bento-card launch-card">
            <div class="card-icon-header rose">
              <Rocket :size="20" />
            </div>
            <div class="launch-flex">
              <div class="launch-text">
                <h3>Coming soon for transporters</h3>
                <p>TruckMitr is bringing Second Hand Truck Marketplace to simplify used truck transactions and support transporter growth.</p>
              </div>
              <div class="stay-tuned-tag">
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
                <Truck :size="20" />
              </div>
              <div class="banner-text">
                <h2>Truck Marketplace</h2>
                <p>"Smart buying. Easy selling."</p>
              </div>
            </div>
            <div class="banner-right">
              Launching soon. Stay tuned with TruckMitr.
            </div>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.marketplace-view {
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

/* Hero Card - Sky Blue Theme */
.hero-card {
  background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 12px 24px -6px rgba(14, 165, 233, 0.2);
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
  margin-bottom: 1.25rem;
}

.hero-labels {
  display: flex;
  gap: 0.75rem;
}

.label-chip {
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
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

.logo-circles .circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.c1 { width: 80px; height: 80px; animation: expand 3s linear infinite; }
.c2 { width: 100px; height: 100px; animation: expand 3s linear infinite 1.5s; }

@keyframes expand {
  0% { transform: scale(0.6); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

.hero-bg-visuals {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-bg-visuals .glow-sphere {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%);
  top: -100px;
  right: -100px;
  filter: blur(40px);
}

.hero-bg-visuals .dot-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
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

.card-icon-header.sky { background: #f0f9ff; color: #0ea5e9; }
.card-icon-header.emerald { background: #ecfdf5; color: #10b981; }
.card-icon-header.amber { background: #fffbeb; color: #f59e0b; }
.card-icon-header.indigo { background: #e0e7ff; color: #4f46e5; }
.card-icon-header.rose { background: #fff1f2; color: #e11d48; }

.bento-card h3 {
  font-size: 1.15rem;
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
.actions-card { grid-column: span 3; }
.value-card { grid-column: span 3; }
.portal-card { grid-column: span 3; }
.launch-card { grid-column: span 6; }

.card-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding: 0.5rem 0.875rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.card-status.sky { background: #f0f9ff; color: #0284c7; border: 1px solid #e0f2fe; }

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
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
.check-mark.indigo { background-color: #4f46e5; }

.list-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}
.list-dot.amber { background: #f59e0b; }

.action-footer {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #94a3b8;
}

.business-value-strip {
  margin-top: 1.25rem;
  padding: 0.75rem;
  background: #fefce8;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #854d0e;
  border-left: 3px solid #facc15;
}

.launch-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.launch-text { flex: 1; }

.stay-tuned-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff1f2;
  border-radius: 99px;
  color: #e11d48;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Footer Banner */
.final-banner {
  background: #0f172a;
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
  color: #38bdf8;
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
