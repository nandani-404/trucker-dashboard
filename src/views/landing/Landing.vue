<script setup lang="ts">
const emit = defineEmits<{ login: [] }>()
</script>

<template>
  <div class="landing">
    <div class="landing-content">
      <h1 class="logo">TruckMitr</h1>
      <p class="tagline">Your trusted partner in transport & logistics</p>
      <button type="button" class="login-btn" @click="emit('login')">
        Login
      </button>
    </div>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  font-family: system-ui, -apple-system, sans-serif;
}

.landing-content {
  text-align: center;
  padding: 40px 24px;
}

.logo {
  font-size: 36px;
  font-weight: 800;
  color: #3D5EE1;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 32px 0;
}

.login-btn {
  padding: 14px 40px;
  border: none;
  border-radius: 12px;
  background: #3D5EE1;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.login-btn:hover {
  background: #2d4ed1;
}
</style>
