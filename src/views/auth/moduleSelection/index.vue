<script setup lang="ts">
const MODULE_STORAGE_KEY = 'SELECTED_MODULE'

const emit = defineEmits<{
  back: []
  'role-selected': [roleId: string, module: string]
}>()

const handleContinue = () => {
  localStorage.setItem(MODULE_STORAGE_KEY, 'hiring')
  emit('role-selected', 'transporter', 'hiring')
}

const handleBack = () => {
  emit('back')
}
</script>

<template>
  <div class="module-selection">
    <img src="../../../assets/logo/logotrick.png" alt="TruckMitr Logo" class="top-logo" />
    <main class="auth-card">
      <header class="nav-header">
        <button type="button" class="back-btn" @click="handleBack" aria-label="Go back">
          ← Back
        </button>
      </header>

      <div class="content">
        <div class="header">
          <h1 class="title">
            Welcome to <span class="accent">TruckMitr</span>
          </h1>
          <p class="subtitle">
            Continue as Transporter to access your dashboard
          </p>
        </div>

        <footer class="footer">
          <button type="button" class="continue-btn" @click="handleContinue">
            Continue as Transporter
            <span class="arrow">→</span>
          </button>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.module-selection {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-image: url('../../../assets/images/login-bg/9169170290.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 24px 12vw;
  font-family: 'Inter', sans-serif;
  position: relative;
}

.top-logo {
  position: absolute;
  top: 24px;
  right: 3vw;
  height: 85px;
  object-fit: contain;
  z-index: 10;
}

@media (max-width: 1024px) {
  .module-selection {
    padding: 24px 8vw;
  }
}

@media (max-width: 768px) {
  .module-selection {
    justify-content: center;
    padding: 24px;
    background-position: right;
  }
  .top-logo {
    top: 24px;
    right: 24px;
    height: 60px;
  }
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 48px;
  background: transparent;
  box-shadow: none;
  border: none;
}

.nav-header {
  margin-bottom: 24px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 1);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background: #ffffff;
  color: #1e293b;
  transform: translateY(-1px);
}

.content {
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 32px;
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.accent {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.footer {
  margin-top: 32px;
}

.continue-btn {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  letter-spacing: 0.5px;
}

.continue-btn:hover {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  box-shadow: 0 12px 25px rgba(37, 99, 235, 0.35);
  transform: translateY(-2px);
}

.continue-btn:active {
  transform: translateY(0);
}

.arrow {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.continue-btn:hover .arrow {
  transform: translateX(4px);
}
</style>
