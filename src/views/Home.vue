<script setup lang="ts">
import { 
  Briefcase, 
  Users, 
  Car, 
  MessageSquare, 
  Clock,
  ChevronRight
} from 'lucide-vue-next'

defineProps<{
  user: {
    name: string;
    mobile: string;
    role: string;
    tm_id?: string;
    [key: string]: any;
  }
}>()

const emit = defineEmits(['navigate'])

const handleAction = (itemName: string) => {
  if (itemName === 'Add Jobs') {
    emit('navigate', 'add-job')
  } else if (itemName === 'View Jobs') {
    emit('navigate', 'view-jobs')
  } else if (itemName === 'View Applications') {
    emit('navigate', 'view-applications')
  } else if (itemName === 'Add Driver') {
    emit('navigate', 'add-driver')
  } else if (itemName === 'Driver List') {
    emit('navigate', 'driver-list')
  } else if (itemName === 'Get Your Driver Verified') {
    emit('navigate', 'verify-driver')
  } else if (itemName === 'RC Check') {
    emit('navigate', 'rc-check')
  } else if (itemName === 'Challan Check') {
    emit('navigate', 'challan-check')
  } else {
    // For other tabs we haven't built yet
  }
}

const sections = [
  {
    title: 'Jobs Management',
    icon: Briefcase,
    items: [
      { name: 'Add Jobs', desc: 'Create new job requirements.', image: 'https://cdn-icons-png.flaticon.com/512/11231/11231532.png' },
      { name: 'View Jobs', desc: 'Monitor active job listings.', image: 'https://cdn-icons-png.flaticon.com/512/2966/2966773.png' },
      { name: 'View Applications', desc: 'Review candidate profiles.', image: 'https://cdn-icons-png.flaticon.com/512/11651/11651437.png' },
    ]
  },
  {
    title: 'Driver Management',
    icon: Users,
    items: [
      { name: 'Add Driver', desc: 'Onboard new drivers.', image: 'https://cdn-icons-png.flaticon.com/512/6008/6008817.png' },
      { name: 'Driver List', desc: 'Access driver database.', image: 'https://cdn-icons-png.flaticon.com/512/6012/6012282.png' },
      { name: 'Get Your Driver Verified', desc: 'Fast document checks.', image: 'https://cdn-icons-png.flaticon.com/512/837/837732.png' },
    ]
  },
  {
    title: 'Vehicle Verification',
    icon: Car,
    items: [
      { name: 'RC Check', desc: 'Verify vehicle certificates.', image: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png' },
      { name: 'Challan Check', desc: 'Check traffic violations.', image: 'https://cdn-icons-png.flaticon.com/512/1584/1584961.png' },
    ]
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    items: [
      { name: 'Invite Driver for a Job', desc: 'Send job invitations.', image: 'https://cdn-icons-png.flaticon.com/512/6003/6003724.png' },
      { name: 'Video Interview', desc: 'Conduct virtual interviews.', image: 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png' },
    ]
  },
  {
    title: 'Coming Soon',
    icon: Clock,
    items: [
      { name: 'TM Load Mandal', desc: 'Find load matches.', image: 'https://cdn-icons-png.flaticon.com/512/2271/2271113.png' },
      { name: 'Fuel Discount', desc: 'Savings on fuel networks.', image: 'https://cdn-icons-png.flaticon.com/512/2311/2311324.png' },
      { name: 'Transporter Tailored Loan', desc: 'Solutions for transporters.', emoji: '💰' },
      { name: 'Truck Insurance', desc: 'Protect your fleet.', emoji: '🛡️' },
      { name: 'Second Hand Truck Marketplace', desc: 'Trade reliable vehicles.', emoji: '🚛' },
      { name: 'Fleet Management System', desc: 'Complete operational control.', emoji: '📊' },
    ]
  }
]
</script>

<template>
  <!-- Only the scrollable body — layout shell is AppLayout in App.vue -->
  <div class="dashboard-body">

    <!-- Classic Banner -->
    <section class="banner-section">
      <div class="banner-content">
        <div class="banner-tag">Enterprise HR Solution</div>
        <h2 class="banner-title">Hiring Made Simple (2026)</h2>
        <p class="banner-subtitle">Precision driver management. No confusion. No guesswork.</p>
        <button class="post-job-btn" @click="emit('navigate', 'add-job')">Post a Job Now</button>
      </div>
      <div class="banner-graphics">
        <div class="geometric-shape shape-1"></div>
        <div class="geometric-shape shape-2"></div>
      </div>
    </section>

    <!-- Categories and Cards -->
    <div class="sections-container">
      <section 
        v-for="(section, index) in sections" 
        :key="index" 
        class="feature-category"
      >
        <div class="category-header">
          <div class="category-icon-wrapper">
            <component :is="section.icon" :size="20" color="#1e40af" />
          </div>
          <h3 class="category-title">{{ section.title }}</h3>
          <div class="category-line"></div>
        </div>
        
        <div class="grid-container">
          <div 
            v-for="(item, i) in section.items" 
            :key="i"
            class="feature-card"
            @click="handleAction(item.name)"
          >
            <div class="card-icon-wrapper">
              <img v-if="item.image" :src="item.image" class="card-img-icon" alt="icon" />
              <span v-else-if="item.emoji" class="card-emoji-icon">{{ item.emoji }}</span>
            </div>
            <div class="card-info">
              <h4 class="card-name">{{ item.name }}</h4>
              <p v-if="item.desc" class="card-desc">{{ item.desc }}</p>
              <p class="card-action">Manage <ChevronRight :size="12" class="arrow" /></p>
            </div>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.dashboard-body {
  padding: 32px 40px 48px;
  animation: fadeIn 0.4s ease-out;
  font-family: 'Inter', sans-serif;
}

/* Banner section */
.banner-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1e3a8a, #0f172a);
  border-radius: 28px;
  padding: 48px;
  color: #ffffff;
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(30,58,138,0.3);
}

.banner-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.banner-tag {
  display: inline-block;
  background: rgba(255,255,255,0.1);
  color: #e0e7ff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.banner-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.banner-subtitle {
  margin: 0 0 24px 0;
  font-size: 16px;
  color: #bfdbfe;
  font-weight: 400;
}

.post-job-btn {
  background: #ffffff;
  color: #1e3a8a;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.post-job-btn:hover { background: #f1f5f9; }

.banner-graphics {
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 400px;
  z-index: 1;
  opacity: 0.2;
}

.geometric-shape {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
}

.shape-1 { width: 300px; height: 300px; right: -50px;  top: -100px;   }
.shape-2 { width: 200px; height: 200px; right: 150px;  bottom: -50px; }

/* Sections */
.sections-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.feature-category {
  animation: slideUp 0.4s ease-out backwards;
}

.feature-category:nth-child(2) { animation-delay: 0.1s; }
.feature-category:nth-child(3) { animation-delay: 0.2s; }

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.category-icon-wrapper {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  width: 36px; height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.category-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.category-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
  margin-left: 16px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.feature-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.02);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  cursor: pointer;
}

.feature-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 16px -4px rgba(0,0,0,0.06);
  transform: translateY(-2px);
  background: linear-gradient(to bottom right, #ffffff, #f8fafc);
}

.card-icon-wrapper {
  background: #f8fafc;
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02) inset;
  transition: transform 0.3s;
}

.card-img-icon {
  width: 24px; height: 24px;
  object-fit: contain;
}

.card-emoji-icon { font-size: 20px; }

.feature-card:hover .card-icon-wrapper {
  background: #eff6ff;
  border-color: #bfdbfe;
  transform: scale(1.05) rotate(2deg);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.card-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.card-desc {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.card-action {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
}

.arrow { margin-left: 2px; }

.feature-card:hover .card-action {
  opacity: 1;
  transform: translateX(0);
}
</style>
