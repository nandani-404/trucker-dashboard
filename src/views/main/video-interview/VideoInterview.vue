<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowLeft,
  Video,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  RefreshCcw,
  ArrowRight
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'navigate'])

const currentTab = ref<'guidelines' | 'scheduled'>('guidelines')
const scheduledCount = ref(0)

const beforeGuidelines = [
  "Keep your phone fully charged",
  "Ensure good internet connection",
  "Sit in a quiet, well-lit place",
  "Keep your ID and documents ready",
  "Join the interview on time"
]

const duringGuidelines = [
  "Do not miss the scheduled time",
  "Avoid noisy or crowded places",
  "Do not disconnect the call",
  "Avoid casual or inappropriate behavior"
]

const importantInfo = [
  "You will receive assistance from TruckMitr Team before the interview",
  "Answer the TruckMitr Team call for guidance and support",
  "Follow the instructions shared for a smooth interview"
]

const switchTab = (tab: 'guidelines' | 'scheduled') => {
  currentTab.value = tab
}
</script>

<template>
  <div class="video-interview-view">
    <!-- Header -->
    <header class="view-header">
      <div class="header-left">
        <button class="btn-back" @click="currentTab === 'scheduled' ? switchTab('guidelines') : emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <h1 class="view-title">{{ currentTab === 'guidelines' ? 'Video Interview' : `Scheduled Interviews (${scheduledCount})` }}</h1>
      </div>
      <div class="header-right">
        <button class="btn-refresh" v-if="currentTab === 'scheduled'" title="Refresh">
          <RefreshCcw :size="18" />
        </button>
      </div>
    </header>

    <main class="content-area">
      <transition name="fade-slide" mode="out-in">
        <!-- Guidelines Screen -->
        <div v-if="currentTab === 'guidelines'" key="guidelines" class="guidelines-screen">
          <!-- Hero Card -->
          <section class="hero-section">
            <div class="hero-icon-box">
              <Video :size="48" color="#ffffff" />
            </div>
            <div class="hero-text">
              <h2>Video Interview</h2>
              <p>Attend professional video interviews scheduled by transporters smoothly with our guided platform.</p>
            </div>
            <div class="hero-bg-shapes">
              <div class="shape s-1"></div>
              <div class="shape s-2"></div>
            </div>
          </section>

            <!-- Vertical Journey Protocol -->
            <div class="protocol-journey">
              <!-- Step 01: The Preparation -->
              <section class="journey-step preparation">
                <div class="step-badge">01</div>
                <div class="step-content">
                  <div class="step-header">
                    <div class="step-icon-box green">
                      <CheckCircle2 :size="24" />
                    </div>
                    <div class="step-title-group">
                      <h3>Preparation Guidelines</h3>
                      <p>Complete these steps before starting your session</p>
                    </div>
                  </div>
                  <div class="step-grid">
                    <div v-for="(text, i) in beforeGuidelines" :key="i" class="protocol-item">
                      <div class="p-dot green"></div>
                      <span>{{ text }}</span>
                    </div>
                  </div>
                </div>
                <!-- Abstract Glow -->
                <div class="step-glow green"></div>
              </section>

              <!-- Step 02: Interview Protocol -->
              <section class="journey-step during-session">
                <div class="step-badge">02</div>
                <div class="step-content">
                  <div class="step-header">
                    <div class="step-icon-box red">
                      <XCircle :size="24" />
                    </div>
                    <div class="step-title-group">
                      <h3>Interview Protocol</h3>
                      <p>Essential behavior during the live video call</p>
                    </div>
                  </div>
                  <div class="step-grid">
                    <div v-for="(text, i) in duringGuidelines" :key="i" class="protocol-item">
                      <div class="p-dot red"></div>
                      <span>{{ text }}</span>
                    </div>
                  </div>
                </div>
                <!-- Abstract Glow -->
                <div class="step-glow red"></div>
              </section>

              <!-- Important Info Banner (Integrated) -->
              <section class="support-hub">
                <div class="hub-header">
                  <Info :size="24" class="text-blue" />
                  <div class="hub-title-group">
                    <h3>Support Hub & Important Info</h3>
                    <p>How the TruckMitr Team assists you during the process</p>
                  </div>
                </div>
                <div class="hub-grid">
                  <div v-for="(text, i) in importantInfo" :key="i" class="hub-card">
                    <div class="hub-card-line"></div>
                    <p>{{ text }}</p>
                  </div>
                </div>
              </section>
            </div>

            <!-- CTA Banner -->
            <div class="cta-banner" @click="switchTab('scheduled')">
              <div class="cta-left">
                <div class="cta-icon-box">
                  <Calendar :size="28" />
                </div>
                <div class="cta-info">
                  <h4>Check Your Schedule</h4>
                  <p>View upcoming interview slots and transporter details</p>
                </div>
              </div>
              <button class="btn-cta">
                <span>View Scheduled Interview ({{ scheduledCount }})</span>
                <ArrowRight :size="18" />
              </button>
            </div>
        </div>

        <!-- Scheduled Interviews Screen -->
        <div v-else key="scheduled" class="scheduled-screen">
          <div class="empty-state">
            <div class="empty-icon-box">
              <Calendar :size="64" class="text-muted" />
              <div class="icon-badge">0</div>
            </div>
            <h3>No Scheduled Interviews</h3>
            <p>You haven't received any interview invitations yet. When a transporter schedules an interview, it will appear here.</p>
            <button class="btn-outline" @click="switchTab('guidelines')">
              Return to Guidelines
            </button>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

.video-interview-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: 'Outfit', sans-serif;
  color: #1e293b;
}

/* Header */
.view-header {
  background: #ffffff;
  padding: 1.25rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
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

.btn-back, .btn-refresh {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
}

.btn-back:hover, .btn-refresh:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: translateX(-2px);
}

.btn-refresh:hover {
  transform: rotate(180deg);
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem;
}

.guidelines-screen {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  border-radius: 24px;
  padding: 3rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  position: relative;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 20px 25px -5px rgba(37, 99, 235, 0.15);
}

.hero-icon-box {
  width: 96px;
  height: 96px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-text {
  z-index: 2;
  max-width: 600px;
}

.hero-text h2 {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.hero-text p {
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-bg-shapes .shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.shape.s-1 { width: 400px; height: 400px; right: -100px; top: -100px; }
.shape.s-2 { width: 300px; height: 300px; left: -50px; bottom: -100px; }

/* Protocol Journey - Enhanced Modern Vertical Flow */
.protocol-journey {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.journey-step {
  background: #ffffff;
  border-radius: 28px;
  padding: 3rem;
  border: 1px solid #eef2f6;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  display: flex;
  gap: 3rem;
}

.step-badge {
  font-size: 5rem;
  font-weight: 900;
  color: #f1f5f9;
  line-height: 1;
  position: absolute;
  top: -1rem;
  right: 1.5rem;
  pointer-events: none;
  z-index: 0;
}

.step-content {
  position: relative;
  z-index: 2;
  flex: 1;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.step-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon-box.green { background: #dcfce7; color: #10b981; }
.step-icon-box.red { background: #fee2e2; color: #ef4444; }

.step-title-group h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.step-title-group p {
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 3.5rem;
}

.protocol-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
}

.p-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.p-dot.green { background: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
.p-dot.red { background: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }

.step-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.05;
  z-index: 1;
}

.step-glow.green { background: #10b981; bottom: -100px; left: -100px; }
.step-glow.red { background: #ef4444; top: -100px; right: -100px; }

/* Support Hub Section */
.support-hub {
  background: #ffffff;
  border: 1px solid #e0f2fe;
  border-radius: 28px;
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hub-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.hub-title-group h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0c4a6e;
  margin: 0;
}

.hub-title-group p {
  font-size: 0.875rem;
  color: #0ea5e9;
  margin: 0.25rem 0 0;
  font-weight: 600;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.hub-card {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  gap: 1.25rem;
  border: 1px solid #e0f2fe;
}

.hub-card-line {
  width: 4px;
  border-radius: 2px;
  background: #3b82f6;
  flex-shrink: 0;
}

.hub-card p {
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 600;
  line-height: 1.5;
  margin: 0;
}

/* Proper CTA Banner */
.cta-banner {
  background: #111827; /* Dark navy as shown in screenshot */
  border-radius: 20px;
  padding: 1.75rem 2.5rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.cta-banner:hover {
  background: #030712;
  transform: scale(1.01);
}

.cta-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.cta-icon-box {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cta-info h4 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem;
}

.cta-info p {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
}

.btn-cta {
  background: #3b82f6;
  color: #ffffff;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-cta:hover {
  background: #2563eb;
  transform: translateX(5px);
}

.btn-cta {
  background: #3b82f6;
  color: #ffffff;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.btn-cta:hover {
  background: #2563eb;
  transform: translateX(5px);
}

/* Scheduled Screen */
.scheduled-screen {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.empty-state {
  text-align: center;
  max-width: 450px;
  animation: slideUp 0.5s ease-out;
}

.empty-icon-box {
  width: 120px;
  height: 120px;
  background: #ffffff;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  position: relative;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.icon-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ef4444;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  border: 4px solid #f8fafc;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-outline {
  background: transparent;
  border: 2px solid #3b82f6;
  color: #3b82f6;
  padding: 0.875rem 2rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .guidelines-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .view-header {
    padding: 1rem;
  }
  .content-area {
    padding: 1.5rem;
  }
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2.5rem 1.5rem;
    gap: 1.5rem;
  }
  .cta-banner {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    padding: 2rem;
  }
  .cta-left {
    flex-direction: column;
    gap: 1rem;
  }
  .btn-cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
