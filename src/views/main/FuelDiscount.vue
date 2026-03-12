<script setup lang="ts">
import {
  ArrowLeft,
  Fuel,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  MapPin,
  Rocket,
  Info
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

const howItWorks = [
  "Access fuel discounts at selected fuel stations",
  "Avail savings on diesel purchases",
  "Use discounts for assigned trips and vehicles",
  "Track fuel savings easily"
]

const whyItMatters = [
  "Reduces overall trip expenses",
  "Improves cost control & planning",
  "Increases transporter profitability",
  "Supports efficient fleet operations"
]

const builtForTransporters = [
  "Easy to use and manage",
  "Works across multiple trips & vehicles",
  "Transparent and reliable discounts",
  "Designed for Indian trucking operations"
]
</script>

<template>
  <div class="fuel-discount-view">
    <main class="content-scroll">
      <div class="page-container">
        <!-- Scrollable Header -->
        <header class="view-header">
          <div class="header-left">
            <button class="btn-back" @click="emit('back')">
              <ArrowLeft :size="18" />
            </button>
            <h1 class="view-title">Fuel Discount</h1>
          </div>
          <div class="header-status">
            <div class="status-pill">
              <Clock :size="12" />
              <span>Coming Soon</span>
            </div>
          </div>
        </header>

        <!-- Hero Section: The Vision (Horizontal & Energy Theme) -->
        <section class="hero-card">
          <div class="hero-content">
            <div class="hero-text-side">
              <div class="coming-soon-tag">
                <Sparkles :size="12" />
                COMING SOON
              </div>
              <h2 class="hero-title">Fuel Discount Program</h2>
              <p class="hero-subtitle">
                Save more on every trip. Get access to better fuel pricing through TruckMitr's partner fuel stations.
              </p>
              <div class="hero-perks">
                <div class="perk-item">
                  <Zap :size="14" />
                  <span>Lower fuel cost</span>
                </div>
                <div class="perk-item">
                  <TrendingUp :size="14" />
                  <span>Better margins</span>
                </div>
              </div>
            </div>
            <div class="hero-graphic-side">
              <div class="hero-logo-box">
                <div class="pulse-ring"></div>
                <Fuel :size="36" color="#ffffff" />
              </div>
            </div>
          </div>
          <div class="hero-bg-visuals">
            <div class="glow-sphere"></div>
            <div class="grid-lines"></div>
          </div>
        </section>

        <!-- Feature Bento Grid -->
        <div class="feature-bento">
          <!-- What is it? -->
          <div class="bento-card welcome-card">
            <div class="card-icon-header orange">
              <Info :size="20" />
            </div>
            <h3>What is Fuel Discount?</h3>
            <p>TruckMitr's Fuel Discount program helps transporters reduce fuel costs and improve profitability across trips by providing access to discounted diesel pricing.</p>
            <div class="card-badge orange">
              <Sparkles :size="12" />
              <span>Save on fuel, boost your profits</span>
            </div>
          </div>

          <!-- How it works -->
          <div class="bento-card flow-card">
            <div class="card-icon-header emerald">
              <MapPin :size="20" />
            </div>
            <h3>How Fuel Discount works</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in howItWorks" :key="i">
                <div class="check-mark emerald"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <p class="emphasis-text">Lower fuel cost. Better margins.</p>
          </div>

          <!-- Why it matters -->
          <div class="bento-card focus-card">
            <div class="card-icon-header amber">
              <TrendingUp :size="20" />
            </div>
            <h3>Why Fuel Discount matters</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in whyItMatters" :key="i">
                <div class="list-dot amber"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="info-strip">
              Fuel savings directly impact your bottom line.
            </div>
          </div>

          <!-- Built for Transporters -->
          <div class="bento-card industry-card">
            <div class="card-icon-header blue">
              <ShieldCheck :size="20" />
            </div>
            <h3>Built for transporters</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in builtForTransporters" :key="i">
                <div class="check-mark blue"></div>
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
              <h3>Launching soon</h3>
              <p>TruckMitr is bringing Fuel Discount to help transporters save more on fuel and run smarter operations.</p>
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
                <Fuel :size="20" />
              </div>
              <div class="banner-text">
                <h2>Fuel Discount</h2>
                <p>"Drive More, Spend Less"</p>
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

.fuel-discount-view {
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

/* Hero Card - Horizontal & Orange/Energy Theme */
.hero-card {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 12px 24px -6px rgba(234, 88, 12, 0.2);
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
  max-width: 480px;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.hero-perks {
  display: flex;
  gap: 1.5rem;
}

.perk-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
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

.pulse-ring {
  position: absolute;
  inset: -8px;
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.15); opacity: 0; }
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

.hero-bg-visuals .grid-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
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

.card-icon-header.orange { background: #fff7ed; color: #f97316; }
.card-icon-header.emerald { background: #ecfdf5; color: #10b981; }
.card-icon-header.amber { background: #fffbeb; color: #f59e0b; }
.card-icon-header.blue { background: #eff6ff; color: #3b82f6; }
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

.welcome-card { grid-column: span 3; }
.flow-card { grid-column: span 3; }
.focus-card { grid-column: span 3; }
.industry-card { grid-column: span 3; }
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

.card-badge.orange { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }

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
.check-mark.blue { background-color: #3b82f6; }

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
  font-size: 0.8125rem;
  font-weight: 800;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-strip {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fffbeb;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #b45309;
  border-left: 3px solid #f59e0b;
}

.launch-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stay-tuned-tag {
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
  background: #1e293b;
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
  color: #fca5a5;
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
