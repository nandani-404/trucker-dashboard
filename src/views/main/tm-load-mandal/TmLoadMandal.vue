<script setup lang="ts">
import {
  ArrowLeft,
  Truck,
  Zap,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  Rocket
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

const benefits = [
  "End-to-end transportation management",
  "Smart load planning and assignment",
  "Better visibility across operations",
  "Faster and more efficient workflows",
  "Scalable solution for transporters of all sizes"
]

const techFeatures = [
  "Latest technology built for Indian logistics",
  "AI-driven insights for smarter decisions",
  "Data analytics for tracking & optimization",
  "Automation to reduce manual work & errors"
]

const industryFocus = [
  "Designed for real-world transporter challenges",
  "Improves productivity & cost control",
  "Enhances transparency & accountability",
  "Supports business growth & scalability"
]
</script>

<template>
  <div class="tm-load-mandal-view">
    <main class="content-scroll">
      <div class="page-container">
        <!-- Scrollable Header -->
        <header class="view-header">
          <div class="header-left">
            <button class="btn-back" @click="emit('back')">
              <ArrowLeft :size="18" />
            </button>
            <h1 class="view-title">TM Load Mandal</h1>
          </div>
          <div class="header-status">
            <div class="status-pill">
              <Clock :size="12" />
              <span>Coming Soon</span>
            </div>
          </div>
        </header>

        <!-- Hero Section: The Vision (Horizontal & Blue) -->
        <section class="hero-card">
          <div class="hero-content">
            <div class="hero-text-side">
              <div class="coming-soon-tag">
                <Sparkles :size="12" />
                COMING SOON
              </div>
              <h2 class="hero-title">TM Load Mandal</h2>
              <p class="hero-subtitle">
                An advanced transportation management solution built specially for the Indian trucking industry.
              </p>
              <p class="hero-tagline">
                Simplify operations. Improve efficiency. <span>All on one platform.</span>
              </p>
            </div>
            <div class="hero-graphic-side">
              <div class="hero-logo-box">
                <Truck :size="36" color="#ffffff" />
              </div>
            </div>
          </div>
          <div class="hero-bg-visuals">
            <div class="glow-sphere"></div>
            <div class="mesh-grid"></div>
          </div>
        </section>

        <div class="feature-bento">
          <!-- What is it? -->
          <div class="bento-card welcome-card">
            <div class="card-icon-header sky">
              <Layers :size="24" />
            </div>
            <h3>What is TM Load Mandal?</h3>
            <p>TM Load Mandal is TruckMitr's advanced transportation management solution that helps transporters manage operations, planning, and execution from one platform.</p>
            <div class="card-badge">
              <Truck :size="14" />
              <span>Built for transporters, by TruckMitr</span>
            </div>
          </div>

          <!-- What it brings -->
          <div class="bento-card benefits-card">
            <div class="card-icon-header emerald">
              <Zap :size="24" />
            </div>
            <h3>What TM Load Mandal brings</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in benefits" :key="i">
                <div class="check-mark emerald"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="list-footer">
              <span>✓ Clear value</span>
              <span>✓ Easy to understand</span>
            </div>
          </div>

          <!-- Logic & Tech -->
          <div class="bento-card tech-card">
            <div class="card-icon-header amber">
              <Cpu :size="24" />
            </div>
            <h3>Powered by technology & intelligence</h3>
            <p class="sub-label">TM Load Mandal leverages:</p>
            <ul class="feature-list">
              <li v-for="(item, i) in techFeatures" :key="i">
                <div class="check-mark amber"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="quote-box">
              <p>Turn data into decisions. Turn operations into growth.</p>
            </div>
          </div>

          <!-- Industry Focus -->
          <div class="bento-card industry-card">
            <div class="card-icon-header indigo">
              <ShieldCheck :size="24" />
            </div>
            <h3>Built for the trucking industry</h3>
            <ul class="feature-list">
              <li v-for="(item, i) in industryFocus" :key="i">
                <div class="check-mark indigo"></div>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <!-- Launch Status -->
          <div class="bento-card launch-card">
            <div class="card-icon-header rose">
              <Rocket :size="24" />
            </div>
            <h3>Launching very soon</h3>
            <p>TruckMitr is bringing TM Load Mandal to empower transporters with technology that truly works for them.</p>
            <div class="stay-tuned">
              <Clock :size="16" />
              <span>Stay tuned for launch updates</span>
            </div>
          </div>
        </div>

        <!-- Footer Banner (Compact & Blue) -->
        <footer class="final-banner">
          <div class="banner-content">
            <div class="banner-left">
              <div class="banner-icon">
                <TrendingUp :size="20" />
              </div>
              <div class="banner-text">
                <h2>TM Load Mandal</h2>
                <p>"Smart Technology for Smart Transporters"</p>
              </div>
            </div>
            <div class="banner-right">
              Launching soon. Stay tuned.
            </div>
          </div>
        </footer>

      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.tm-load-mandal-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: 'Outfit', sans-serif;
  color: #1e293b;
}

/* Header (Now Scrollable) */
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
  gap: 1.25rem;
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

/* Hero Card (Horizontal & Blue) */
.hero-card {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 12px 24px -6px rgba(37, 99, 235, 0.2);
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  text-align: left;
}

.hero-text-side {
  flex: 1;
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
  margin-bottom: 1rem;
  width: fit-content;
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
  margin-bottom: 0.75rem;
}

.hero-tagline {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: normal;
  font-weight: 500;
}

.hero-tagline span {
  color: #ffffff;
  font-weight: 700;
  font-style: normal;
}

.hero-bg-visuals .glow-sphere {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%);
  top: -100px;
  right: -100px;
  filter: blur(40px);
}

.hero-bg-visuals .mesh-grid {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

/* Bento Grid (More Compact) */
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
  margin-bottom: 1.25rem;
}

.card-icon-header.sky { background: #e0f2fe; color: #0ea5e9; }
.card-icon-header.emerald { background: #dcfce7; color: #10b981; }
.card-icon-header.amber { background: #fef3c7; color: #d97706; }
.card-icon-header.indigo { background: #e0e7ff; color: #6366f1; }
.card-icon-header.rose { background: #ffe4e6; color: #e11d48; }

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
.benefits-card { grid-column: span 3; }
.tech-card { grid-column: span 3; }
.industry-card { grid-column: span 3; }
.launch-card { grid-column: span 6; }

.card-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding: 0.5rem 0.875rem;
  background: #f1f5f9;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #334155;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
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
.check-mark.amber { background-color: #d97706; }
.check-mark.indigo { background-color: #6366f1; }

.list-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #94a3b8;
}

.quote-box {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #fefce8;
  border-left: 4px solid #facc15;
  border-radius: 0 12px 12px 0;
}

.quote-box p {
  color: #854d0e;
  font-weight: 700;
  font-style: italic;
  margin: 0;
}

.stay-tuned {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.75rem 1.25rem;
  background: #fff1f2;
  border-radius: 99px;
  color: #e11d48;
  font-size: 0.875rem;
  font-weight: 700;
  width: fit-content;
}

/* Footer Banner (Blueprint Blue & Horizontal) */
.final-banner {
  background: #1e3a8a;
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
  color: #60a5fa;
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
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-card, .bento-card, .final-banner {
  animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
}

.bento-card:nth-child(1) { animation-delay: 0.1s; }
.bento-card:nth-child(2) { animation-delay: 0.2s; }
.bento-card:nth-child(3) { animation-delay: 0.3s; }
.bento-card:nth-child(4) { animation-delay: 0.4s; }
.bento-card:nth-child(5) { animation-delay: 0.5s; }

@media (max-width: 1024px) {
  .feature-bento { grid-template-columns: repeat(2, 1fr); }
  .welcome-card, .benefits-card, .tech-card, .industry-card, .launch-card { grid-column: span 3; }
}

@media (max-width: 768px) {
  .content-scroll { padding: 1.5rem; }
  .hero-card { padding: 2.5rem 1.5rem; }
  .hero-title { font-size: 2.25rem; }
  .feature-bento { grid-template-columns: 1fr; }
  .welcome-card, .benefits-card, .tech-card, .industry-card, .launch-card { grid-column: span 1; }
}
</style>
