<script setup lang="ts">
import {
  ArrowLeft,
  HeartHandshake,
  ShieldCheck,
  Truck,
  Clock,
  Sparkles,
  Zap,
  Rocket,
  Shield
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

const insuranceOffers = [
  "Comprehensive insurance for trucks",
  "Protection against accidents & damages",
  "Coverage for theft & third-party liabilities",
  "Easy policy management in the app",
  "Support during claims & emergencies"
]

const whyChooseMitr = [
  "Transporter-focused insurance plans",
  "Trusted insurance partners",
  "Simple & transparent process",
  "Reduced paperwork & hassle",
  "Faster assistance when you need it"
]

const builtForTransporters = [
  "Suitable for single trucks & fleets",
  "Designed for Indian road conditions",
  "Easy renewals & tracking",
  "Reliable & secure coverage"
]
</script>

<template>
  <div class="truck-insurance-view">
    <main class="content-scroll">
      <div class="page-container">
        <!-- Scrollable Header -->
        <header class="view-header">
          <div class="header-left">
            <button class="btn-back" @click="emit('back')">
              <ArrowLeft :size="18" />
            </button>
            <h1 class="view-title">Truck Insurance</h1>
          </div>
          <div class="header-status">
            <div class="status-pill">
              <Clock :size="12" />
              <span>Coming Soon</span>
            </div>
          </div>
        </header>

        <!-- Hero Section: Protection & Trust (Horizontal & Emerald Theme) -->
        <section class="hero-card">
          <div class="hero-content">
            <div class="hero-text-side">
              <div class="coming-soon-tag">
                <Sparkles :size="12" />
                COMING SOON
              </div>
              <h2 class="hero-title">Comprehensive Truck Insurance</h2>
              <p class="hero-subtitle">
                Protect your trucks. Protect your business. Safeguard your vehicles and operations with confidence.
              </p>
              <div class="hero-badges">
                <div class="h-badge">
                  <ShieldCheck :size="14" />
                  <span>Trusted Partners</span>
                </div>
                <div class="h-badge">
                  <Zap :size="14" />
                  <span>Fast Claims</span>
                </div>
              </div>
            </div>
            <div class="hero-graphic-side">
              <div class="hero-logo-box">
                <div class="shield-aura"></div>
                <Shield :size="36" color="#ffffff" />
              </div>
            </div>
          </div>
          <div class="hero-bg-visuals">
            <div class="glow-sphere"></div>
            <div class="hex-pattern"></div>
          </div>
        </section>

        <!-- Feature Bento Grid -->
        <div class="feature-bento">
          <!-- What is it? -->
          <div class="bento-card welcome-card">
            <div class="card-icon-header emerald">
              <ShieldCheck :size="20" />
            </div>
            <h3>What is Truck Insurance?</h3>
            <p>TruckMitr is bringing Truck Insurance designed specially for transporters to protect trucks, fleets, and daily operations against risks on the road.</p>
            <div class="card-tag emerald">
              <Shield :size="12" />
              <span>Built for transporters, by TruckMitr</span>
            </div>
          </div>

          <!-- What it will offer -->
          <div class="bento-card offer-card">
            <div class="card-icon-header teal">
              <Zap :size="20" />
            </div>
            <h3>What Truck Insurance will offer</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in insuranceOffers" :key="i">
                <div class="check-mark teal"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <p class="status-note">Insurance that keeps your business moving.</p>
          </div>

          <!-- Why TruckMitr Insurance -->
          <div class="bento-card why-card">
            <div class="card-icon-header amber">
              <HeartHandshake :size="20" />
            </div>
            <h3>Why TruckMitr Truck Insurance</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in whyChooseMitr" :key="i">
                <div class="list-dot amber"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="trust-banner">
              Your trust. Our reliability. Complete protection.
            </div>
          </div>

          <!-- Built for Transporters -->
          <div class="bento-card industry-card">
            <div class="card-icon-header sky">
              <Truck :size="20" />
            </div>
            <h3>Built for transporters</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in builtForTransporters" :key="i">
                <div class="check-mark sky"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Launch Status -->
          <div class="bento-card launch-card">
            <div class="card-icon-header rose">
              <Rocket :size="20" />
            </div>
            <div class="launch-flex">
              <div class="launch-info">
                <h3>Coming soon</h3>
                <p>TruckMitr is working with leading insurance partners to bring reliable Truck Insurance for transporters.</p>
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
                <Shield :size="20" />
              </div>
              <div class="banner-text">
                <h2>Truck Insurance</h2>
                <p>"Secure your fleet, drive with confidence"</p>
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

.truck-insurance-view {
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

/* Hero Card - Emerald/Slate Theme */
.hero-card {
  background: linear-gradient(135deg, #059669 0%, #064e3b 100%);
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 12px 24px -6px rgba(5, 150, 105, 0.2);
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

.hero-badges {
  display: flex;
  gap: 1.25rem;
}

.h-badge {
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

.shield-aura {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: auraRotate 8s linear infinite;
}

@keyframes auraRotate {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1) rotate(360deg); }
}

.hero-bg-visuals .glow-sphere {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%);
  bottom: -50px;
  left: -50px;
  filter: blur(40px);
}

.hero-bg-visuals .hex-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
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

.card-icon-header.emerald { background: #ecfdf5; color: #10b981; }
.card-icon-header.teal { background: #f0fdfa; color: #0d9488; }
.card-icon-header.amber { background: #fffbeb; color: #f59e0b; }
.card-icon-header.sky { background: #f0f9ff; color: #0ea5e9; }
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
.offer-card { grid-column: span 3; }
.why-card { grid-column: span 3; }
.industry-card { grid-column: span 3; }
.launch-card { grid-column: span 6; }

.card-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.5rem 0.875rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.card-tag.emerald { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }

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

.check-mark.teal { background-color: #0d9488; }
.check-mark.sky { background-color: #0ea5e9; }

.list-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}
.list-dot.amber { background: #f59e0b; }

.status-note {
  margin-top: 1.25rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: #0d9488;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trust-banner {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fffbeb;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #92400e;
  border-left: 3px solid #f59e0b;
}

.launch-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.launch-info { flex: 1; }

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
  color: #10b981;
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
