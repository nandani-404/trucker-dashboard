<script setup lang="ts">
import { ChevronLeft, Copy, Phone, Mail, PhoneIncoming } from 'lucide-vue-next'

const emit = defineEmits(['back'])

const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('Copied to clipboard: ' + text)
}

const handleCall = () => {
  window.location.href = 'tel:18001024558'
}

const handleMail = () => {
  window.location.href = 'mailto:contact@truckmitr.com'
}

const handleCallback = () => {
  alert('Callback requested. Our team will contact you soon.')
}
</script>

<template>
  <div class="contact-master">
    <!-- Header Area (Web Style) -->
    <header class="page-header">
      <button class="icon-back-btn" @click="emit('back')" title="Go Back">
        <ChevronLeft :size="20" />
      </button>
      <div class="header-titles">
        <h1 class="main-title">Contact Us</h1>
        <p class="sub-title">We are here to help. Reach out to our support team.</p>
      </div>
    </header>

    <!-- Scrollable Content Layout (Web) -->
    <div class="contact-content-area">
      <div class="web-content-container">

        <!-- Top Banner -->
        <div class="support-banner">
          <div class="banner-content">
            <h2>How can we assist you today?</h2>
            <p>Our dedicated support team is available from 9 AM to 7 PM to ensure your operations run smoothly.</p>
          </div>
          <div class="banner-graphic">
             <PhoneIncoming :size="64" class="graphic-icon" />
          </div>
        </div>
        
        <!-- Cards Grid -->
        <div class="cards-grid">
          <!-- Toll Free Card -->
          <div class="contact-card hover-lift">
            <div class="card-icon-wrapper blue-bg">
              <Phone :size="24" class="card-hero-icon" />
            </div>
            <div class="card-info">
              <p class="card-label">Toll-Free Helpline</p>
              <h2 class="card-value">1800-102-4558</h2>
              <p class="card-desc">Call us directly. Available Mon-Sat.</p>
            </div>
            <div class="card-actions web-actions">
              <button class="btn-copy" @click="handleCopy('18001024558')" title="Copy Number">
                <Copy :size="16" /> Copy
              </button>
              <button class="btn-primary" @click="handleCall">
                <Phone :size="16" /> Call Support
              </button>
            </div>
          </div>

          <!-- Email Card -->
          <div class="contact-card hover-lift">
            <div class="card-icon-wrapper indigo-bg">
              <Mail :size="24" class="card-hero-icon" />
            </div>
            <div class="card-info">
              <p class="card-label">Email Support</p>
              <h2 class="card-value">contact@truckmitr.com</h2>
              <p class="card-desc">Write to us for queries or feedback.</p>
            </div>
            <div class="card-actions web-actions">
              <button class="btn-copy" @click="handleCopy('contact@truckmitr.com')" title="Copy Email">
                <Copy :size="16" /> Copy
              </button>
              <button class="btn-primary" @click="handleMail">
                <Mail :size="16" /> Send Email
              </button>
            </div>
          </div>
        </div>

        <!-- Request Callback Section -->
        <div class="callback-section">
          <div class="callback-text">
            <h3>Need us to call you?</h3>
            <p>Leave a request and our support executive will reach out to you within 2 hours.</p>
          </div>
          <button class="btn-callback" @click="handleCallback">
            <PhoneIncoming :size="18" /> Request Call-back
          </button>
        </div>

      </div>
    </div>

    <!-- Solid Blue Footer -->
    <footer class="contact-footer">
      <p>© 2026 TruckMitr Corporate Services Private Limited.</p>
      <p>All Rights Reserved.</p>
    </footer>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

.contact-master {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff; /* Fit with rest of dashboard */
  font-family: 'Inter', sans-serif;
  color: #0f172a;
  position: relative;
  overflow: hidden;
  padding: 40px;
}

/* Page Header (Matching App Global Style) */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
  flex-shrink: 0;
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

/* Content Area */
.contact-content-area {
  flex: 1;
  overflow-y: auto;
}

.web-content-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 60px;
}

/* Support Banner Header */
.support-banner {
  background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.2);
  animation: fadeSlideUp 0.4s ease-out;
}

.banner-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.banner-content p {
  font-size: 15px;
  color: #bfdbfe;
  line-height: 1.5;
  margin: 0;
  max-width: 500px;
}

.banner-graphic {
  background: rgba(255,255,255,0.1);
  padding: 24px;
  border-radius: 24px;
  backdrop-filter: blur(8px);
}

.graphic-icon {
  color: #93c5fd;
  transform: rotate(-15deg);
}

/* Web Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
  animation: fadeSlideUp 0.5s ease-out;
}

.contact-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.08);
  border-color: #cbd5e1;
}

.card-icon-wrapper {
  width: 56px; height: 56px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
}

.blue-bg { background: #eff6ff; color: #2563eb; }
.indigo-bg { background: #eef2ff; color: #4f46e5; }

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-label {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.card-desc {
  margin: 0;
  font-size: 14px;
  color: #475569;
}

/* Action Rows */
.web-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.btn-copy {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ffffff;
  color: #334155;
  border: 1px dashed #cbd5e1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-primary {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

/* Request Callback Section (Replaces mobile FAB) */
.callback-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 32px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  animation: fadeSlideUp 0.6s ease-out;
}

.callback-text h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.callback-text p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
  line-height: 1.5;
}

.btn-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-callback:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.05);
}

@media (max-width: 768px) {
  .support-banner {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  .callback-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  .contact-master {
    padding: 24px;
  }
}
</style>
