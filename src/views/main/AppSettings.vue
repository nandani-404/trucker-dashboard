<script setup lang="ts">
import { ref } from 'vue'
import { 
  ChevronLeft, 
  Languages, 
  Trash2, 
  ShieldAlert 
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'logout', 'delete-account'])

const currentLanguage = ref('English')
const showDeleteModal = ref(false)

const languages = [
  { name: 'English', native: 'English', code: 'en' },
  { name: 'Hindi', native: 'हिन्दी', code: 'hi' }
]

const selectLanguage = (lang: string) => {
  currentLanguage.value = lang
}

const handleDeleteConfirm = () => {
  alert('Account deletion request sent. Our team will verify and process it.')
  showDeleteModal.value = false
}
</script>

<template>
  <div class="settings-master">
    <div class="settings-container">
      <!-- Header -->
      <header class="settings-header">
        <button class="back-link" @click="emit('back')">
          <ChevronLeft :size="20" />
          <span>Back to Profile</span>
        </button>
        <div class="header-main">
          <h1>Settings</h1>
          <p class="subtitle">Manage language and account security</p>
        </div>
      </header>

      <main class="settings-body">
        <div class="settings-list">
          
          <!-- Card 1: Language Selection -->
          <section class="settings-card">
            <div class="card-left">
              <div class="icon-wrap blue">
                <Languages :size="24" />
              </div>
              <div class="card-info">
                <h2>Language Preferences</h2>
                <p>Choose your application display language</p>
              </div>
            </div>
            <div class="card-right">
              <div class="lang-switcher">
                <button 
                  v-for="lang in languages" 
                  :key="lang.code"
                  class="lang-pill"
                  :class="{ 'active': currentLanguage === lang.name }"
                  @click="selectLanguage(lang.name)"
                >
                  {{ lang.native }}
                </button>
              </div>
            </div>
          </section>

          <!-- Card 2: Account Controls -->
          <section class="settings-card">
            <div class="card-left">
              <div class="icon-wrap red">
                <Trash2 :size="24" />
              </div>
              <div class="card-info">
                <h2>Account Controls</h2>
                <p>Permanently remove your account data</p>
              </div>
            </div>
            <div class="card-right">
              <button class="delete-btn" @click="showDeleteModal = true">
                Delete Account
              </button>
            </div>
          </section>

        </div>
      </main>

      <!-- Delete Confirmation Modal -->
      <Transition name="fade">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="delete-modal">
            <div class="modal-icon">
              <ShieldAlert :size="48" />
            </div>
            <h2>Are you absolutely sure?</h2>
            <p>Deactivating your account is irreversible. All your job history and verified documents will be permanently removed.</p>
            
            <div class="modal-actions">
              <button class="m-cancel" @click="showDeleteModal = false">Cancel</button>
              <button class="m-delete" @click="handleDeleteConfirm">Confirm Deletion</button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Footer -->
      <footer class="settings-footer">
        <p>© 2026 TruckMitr Corporate Services Private Limited. All Rights Reserved.</p>
        <div class="footer-links">
          <span>v2.4.1</span>
          <div class="dot"></div>
          <span>Digital India</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;600;700&display=swap');

.settings-master {
  background-color: #ffffff;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
}

.settings-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 48px;
  display: flex;
  flex-direction: column;
}

.settings-header {
  margin-bottom: 60px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  margin-bottom: 32px;
  transition: all 0.2s;
}

.back-link:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.header-main h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 60px;
}

.settings-card {
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.settings-card:hover {
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrap.blue { background: #eff6ff; color: #3b82f6; }
.icon-wrap.red { background: #fef2f2; color: #ef4444; }

.card-info h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.card-info p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.lang-switcher {
  display: flex;
  gap: 12px;
}

.lang-pill {
  padding: 10px 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
}

.lang-pill.active {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
}

.delete-btn {
  background: #ffffff;
  color: #ef4444;
  border: 1px solid #fee2e2;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

.delete-modal {
  background: white;
  max-width: 440px;
  width: 100%;
  padding: 40px;
  border-radius: 28px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

.modal-icon {
  color: #ef4444;
  margin-bottom: 24px;
}

.modal-icon svg { margin: 0 auto; }

.delete-modal h2 {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.delete-modal p {
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 32px;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.m-cancel {
  background: #f1f5f9;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  color: #475569;
}

.m-delete {
  background: #ef4444;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Footer Section */
.settings-footer {
  background: #1e3a8a;
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  color: white;
}

.settings-footer p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0 0 12px 0;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  font-weight: 700;
  opacity: 0.9;
}

.dot { width: 4px; height: 4px; background: white; border-radius: 50%; }

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .settings-card { flex-direction: column; gap: 24px; text-align: center; }
  .card-left { flex-direction: column; }
  .modal-actions { grid-template-columns: 1fr; }
}
</style>
