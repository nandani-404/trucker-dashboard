<script setup lang="ts">
import { ref } from 'vue'

const MODULE_STORAGE_KEY = 'SELECTED_MODULE'

const ROLE_DATA = [
  // { id: 'driver', label: 'Driver', color: '#4A90E2', module: 'hiring' },
  { id: 'transporter', label: 'Transporter', color: '#F5A623', module: 'hiring' },
//   { id: 'foreman', label: 'Driver Foreman', color: '#9013FE', module: 'foreman' },
//   { id: 'association', label: 'Driver Association', color: '#E74C3C', module: 'association' },
//   { id: 'dhaba', label: 'Dhaba Sathi', color: '#2ECC71', module: 'dhaba' },
//   { id: 'puncture', label: 'Puncture Point', color: '#F1C40F', module: 'puncture_shop' },
//   { id: 'shipper', label: 'Shipper', color: '#FF4081', module: 'shipper' },
]

const selectedRole = ref<string | null>(null)

const emit = defineEmits<{
  back: []
  'role-selected': [roleId: string, module: string]
}>()

const handleRoleSelect = (roleId: string) => {
  selectedRole.value = roleId
}

const handleContinue = () => {
  if (!selectedRole.value) return
  const roleData = ROLE_DATA.find((r) => r.id === selectedRole.value)
  if (roleData?.module) {
    localStorage.setItem(MODULE_STORAGE_KEY, roleData.module)
  }
  emit('role-selected', selectedRole.value, roleData?.module ?? 'hiring')
}

const handleBack = () => {
  emit('back')
}
</script>

<template>
  <div class="module-selection">
    <header class="nav-header">
      <button type="button" class="back-btn" @click="handleBack" aria-label="Go back">
        ← Back
      </button>
    </header>

    <main class="content">
      <div class="header">
        <h1 class="title">
          Choose your <span class="accent">role</span>
        </h1>
        <p class="subtitle">
          Select the option that best describes you to get started.
        </p>
      </div>

      <div class="grid">
        <button
          v-for="item in ROLE_DATA"
          :key="item.id"
          type="button"
          class="pill"
          :class="{ selected: selectedRole === item.id }"
          :style="
            selectedRole === item.id
              ? { backgroundColor: item.color, borderColor: item.color }
              : {}
          "
          @click="handleRoleSelect(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </main>

    <footer v-if="selectedRole" class="footer">
      <button type="button" class="continue-btn" @click="handleContinue">
        Continue
        <span class="arrow">→</span>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.module-selection {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: system-ui, -apple-system, sans-serif;
}

.nav-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  background: none;
  border: none;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  padding: 6px 0;
}

.back-btn:hover {
  color: #000;
}

.content {
  flex: 1;
  padding: 24px 20px 100px;
}

.header {
  margin-bottom: 28px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  margin: 0 0 10px 0;
}

.accent {
  color: #3D5EE1;
}

.subtitle {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pill {
  padding: 12px 22px;
  border-radius: 50px;
  border: 1px solid #e5e5e5;
  background: #fff;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill:hover {
  border-color: #ccc;
  background: #fafafa;
}

.pill.selected {
  color: #fff;
  font-weight: 600;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px 24px;
  background: #fff;
  border-top: 1px solid #eee;
}

.continue-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 26px;
  background: #000080;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 128, 0.25);
}

.continue-btn:hover {
  background: #0000a0;
}

.arrow {
  font-size: 18px;
}
</style>
