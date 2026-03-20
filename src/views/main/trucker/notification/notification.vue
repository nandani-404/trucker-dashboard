<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  ArrowLeft, Bell, Settings, 
  CheckCheck, Package, CreditCard, 
  FileText, Truck, Trash2, 
  Inbox, ShieldCheck
} from 'lucide-vue-next'

const emit = defineEmits(['back', 'notification-press'])

type NotificationType = 'load' | 'payment' | 'document' | 'system' | 'trip';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const notifications = ref<Notification[]>([
  { id: '1', type: 'load', title: 'New Load Available', message: 'A new load Mumbai → Delhi is available matching your preferences.', time: '5 min ago', isRead: false },
  { id: '2', type: 'payment', title: 'Payment Received! 💰', message: 'Payment of ₹15,000 for Load #LM-34919 has been credited.', time: '2 hrs ago', isRead: false },
  { id: '3', type: 'trip', title: 'Trip Status Updated', message: 'Your trip #LM-34921 status changed to "In Transit".', time: '4 hrs ago', isRead: true },
  { id: '4', type: 'document', title: 'Document Expiring Soon', message: 'Your RC will expire in 15 days. Please renew it.', time: '1 day ago', isRead: true },
  { id: '5', type: 'load', title: 'Bid Accepted! 🎉', message: 'Your bid of ₹18,000 for Pune → Surat has been accepted.', time: '1 day ago', isRead: true },
  { id: '6', type: 'system', title: 'App Update Available', message: 'Update to v2.5 for new features and bug fixes.', time: '2 days ago', isRead: true },
  { id: '7', type: 'payment', title: 'Pending Payment', message: 'Payment for Load #LM-34915 is pending. Contact support.', time: '3 days ago', isRead: true },
])

const typeConfig: Record<NotificationType, { icon: any; bg: string; color: string; label: string }> = {
  load: { icon: Package, bg: '#eff6ff', color: '#3b82f6', label: 'Loads' },
  payment: { icon: CreditCard, bg: '#ecfdf5', color: '#10b981', label: 'Payments' },
  document: { icon: FileText, bg: '#fffbeb', color: '#f59e0b', label: 'Docs' },
  system: { icon: Settings, bg: '#f1f5f9', color: '#64748b', label: 'System' },
  trip: { icon: Truck, bg: '#f5f3ff', color: '#8b5cf6', label: 'Trips' },
}

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)
const activeFilter = ref('all')
const showFilters = ref(false)

const markAsRead = (id: string) => {
  const notif = notifications.value.find(n => n.id === id)
  if (notif) notif.isRead = true
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true)
}

const deleteNotification = (id: string) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const filteredNotifications = computed(() => {
  let list = notifications.value
  if (activeFilter.value === 'unread') list = list.filter(n => !n.isRead)
  else if (activeFilter.value !== 'all') list = list.filter(n => n.type === activeFilter.value)
  return list
})

const todayNotifs = computed(() => filteredNotifications.value.filter(n => n.time.includes('min') || n.time.includes('hr')))
const earlierNotifs = computed(() => filteredNotifications.value.filter(n => !n.time.includes('min') && !n.time.includes('hr')))

const filters = [
  { id: 'all', label: 'All Activity', icon: Bell },
  { id: 'unread', label: 'Unread Only', icon: ShieldCheck },
  { id: 'load', label: 'Load Updates', icon: Package },
  { id: 'payment', label: 'Payments', icon: CreditCard },
  { id: 'trip', label: 'Trips', icon: Truck },
]

</script>

<template>
  <div class="notification-center">
    <!-- Header Area -->
    <header class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="emit('back')">
          <ArrowLeft :size="20" />
        </button>
        <div class="title-group">
          <h1>Notification Center</h1>
          <div class="subtitle-meta">
            <p>Stay updated with load bids, trips and payments</p>
            <span v-if="unreadCount > 0" class="unread-count-indicator">{{ unreadCount }} Unread</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="unreadCount > 0" class="btn-mark-all" @click="markAllAsRead">
          <CheckCheck :size="18" />
          <span>Mark all as read</span>
        </button>
      </div>
    </header>

    <main class="content-arena">
      <!-- NOTIFICATION FEED -->
      <section class="feed-container">
        <!-- HORIZONTAL FILTERS TOGGLE -->
        <div class="filter-controls">
          <button class="btn-filter-toggle" :class="{ active: showFilters }" @click="showFilters = !showFilters">
            <Filter :size="18" />
            <span>Filter Notifications</span>
          </button>
          
          <Transition name="expand">
            <div v-if="showFilters" class="filter-pills-row">
              <button 
                v-for="f in filters" 
                :key="f.id"
                class="filter-pill"
                :class="{ active: activeFilter === f.id }"
                @click="activeFilter = f.id"
              >
                <component :is="f.icon" :size="16" />
                <span>{{ f.label }}</span>
                <span v-if="f.id === 'unread' && unreadCount > 0" class="pill-badge">{{ unreadCount }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-visual">
            <div class="pulse-ring"></div>
            <Inbox :size="48" class="inbox-icon" />
          </div>
          <h3>All caught up!</h3>
          <p>No notifications found in this category.</p>
          <button class="btn-primary" @click="activeFilter = 'all'">Show All Activity</button>
        </div>

        <div v-else class="scrollable-feed">
          <!-- TODAY SECTION -->
          <div v-if="todayNotifs.length > 0" class="feed-section">
            <h3 class="section-title">Today</h3>
            <div class="notif-list">
              <TransitionGroup name="notif-list">
                <div 
                  v-for="n in todayNotifs" 
                  :key="n.id" 
                  class="notif-card"
                  :class="{ unread: !n.isRead }"
                  @click="markAsRead(n.id)"
                >
                  <div class="notif-icon-box" :style="{ backgroundColor: typeConfig[n.type].bg, color: typeConfig[n.type].color }">
                    <component :is="typeConfig[n.type].icon" :size="20" />
                  </div>
                  <div class="notif-main">
                    <div class="notif-top">
                      <h4>{{ n.title }}</h4>
                      <span class="notif-time">{{ n.time }}</span>
                    </div>
                    <p class="notif-msg">{{ n.message }}</p>
                  </div>
                  <div class="notif-actions">
                    <button class="btn-action-sm" title="Delete" @click.stop="deleteNotification(n.id)">
                      <Trash2 :size="16" />
                    </button>
                  </div>
                  <div v-if="!n.isRead" class="unread-tracker"></div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- EARLIER SECTION -->
          <div v-if="earlierNotifs.length > 0" class="feed-section">
            <h3 class="section-title">Earlier</h3>
            <div class="notif-list">
              <TransitionGroup name="notif-list">
                <div 
                  v-for="n in earlierNotifs" 
                  :key="n.id" 
                  class="notif-card"
                  :class="{ unread: !n.isRead }"
                  @click="markAsRead(n.id)"
                >
                  <div class="notif-icon-box" :style="{ backgroundColor: typeConfig[n.type].bg, color: typeConfig[n.type].color }">
                    <component :is="typeConfig[n.type].icon" :size="20" />
                  </div>
                  <div class="notif-main">
                    <div class="notif-top">
                      <h4>{{ n.title }}</h4>
                      <span class="notif-time">{{ n.time }}</span>
                    </div>
                    <p class="notif-msg">{{ n.message }}</p>
                  </div>
                  <div class="notif-actions">
                    <button class="btn-action-sm" title="Delete" @click.stop="deleteNotification(n.id)">
                      <Trash2 :size="16" />
                    </button>
                  </div>
                  <div v-if="!n.isRead" class="unread-tracker"></div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.notification-center {
  min-height: 100vh;
  background-color: #ffffff;
  color: #1e293b;
  font-family: 'Inter', sans-serif;
}

/* Header */
.page-header {
  height: 80px;
  padding: 0 40px;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left { display: flex; align-items: center; gap: 20px; }
.btn-back {
  width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.2s; background: white;
}
.btn-back:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateX(-2px); }

.title-group h1 { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
.subtitle-meta { display: flex; align-items: center; gap: 12px; margin-top: 2px; }
.subtitle-meta p { font-size: 14px; color: #64748b; font-weight: 500; }
.unread-count-indicator {
  padding: 2px 8px; background: #fee2e2; color: #ef4444; border-radius: 6px;
  font-size: 11px; font-weight: 800; border: 1px solid #fecaca;
}

.header-actions { display: flex; align-items: center; gap: 16px; }
.btn-mark-all {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: 1px solid #e2e8f0;
  background: white; color: #2563eb; font-size: 14px; font-weight: 700;
  cursor: pointer; border-radius: 12px; transition: all 0.2s;
}
.btn-mark-all:hover { background: #eff6ff; border-color: #3b82f6; transform: translateY(-1px); }

/* Main Content Area */
.content-arena {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px;
}

/* Filter Controls */
.filter-controls { margin-bottom: 40px; }
.btn-filter-toggle {
    height: 44px; padding: 0 20px; background: white; border: 1px solid #e2e8f0;
    border-radius: 12px; color: #64748b; font-weight: 700; font-size: 14px;
    display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
}
.btn-filter-toggle:hover { border-color: #cbd5e1; color: #0f172a; }
.btn-filter-toggle.active { background: #0f172a; border-color: #0f172a; color: white; }

.filter-pills-row {
    margin-top: 16px; display: flex; flex-wrap: wrap; gap: 10px;
    padding: 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9;
}
.filter-pill {
    height: 38px; padding: 0 16px; background: white; border: 1px solid #e2e8f0;
    border-radius: 20px; color: #64748b; font-weight: 600; font-size: 13px;
    display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
    position: relative;
}
.filter-pill:hover { border-color: #cbd5e1; color: #0f172a; }
.filter-pill.active { background: #2563eb; border-color: #2563eb; color: white; }

.pill-badge {
    background: #ef4444; color: white; font-size: 10px; font-weight: 800;
    padding: 1px 6px; border-radius: 10px; margin-left: 4px;
}

/* Feed */
.feed-container { width: 100%; transition: all 0.3s; }
.scrollable-feed { display: flex; flex-direction: column; gap: 48px; }
.section-title { font-size: 14px; font-weight: 800; color: #94a3b8; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }

.notif-list { display: flex; flex-direction: column; gap: 1px; background: #f1f5f9; border-radius: 24px; overflow: hidden; border: 1px solid #f1f5f9; }

.notif-card {
  background: white; padding: 24px 32px; display: flex; gap: 24px; cursor: pointer;
  transition: all 0.2s; position: relative;
}
.notif-card:hover { background: #f8fafc; z-index: 2; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
.notif-card.unread { background: #ffffff; border-left: 4px solid #3b82f6; }

.notif-icon-box {
  width: 48px; height: 48px; border-radius: 14px; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}

.notif-main { flex: 1; min-width: 0; padding-top: 2px; }
.notif-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.notif-main h4 { font-size: 17px; font-weight: 700; color: #1e293b; letter-spacing: -0.2px; }
.notif-time { font-size: 13px; color: #94a3b8; font-weight: 600; }
.notif-msg { font-size: 15px; color: #64748b; line-height: 1.6; font-weight: 500; }

.notif-actions { opacity: 0; transition: 0.2s; display: flex; align-items: center; }
.notif-card:hover .notif-actions { opacity: 1; }

.unread-tracker {
  width: 10px; height: 10px; background: #3b82f6; border-radius: 50%; margin-left: 20px; flex-shrink: 0;
}

/* Empty State */
.empty-state {
  padding: 100px 40px; display: flex; flex-direction: column; align-items: center;
  text-align: center; background: #f8fafc; border-radius: 32px; border: 2px dashed #e2e8f0;
}
.empty-visual { position: relative; margin-bottom: 24px; }
.inbox-icon { color: #cbd5e1; position: relative; z-index: 2; }
.pulse-ring {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 80px; height: 80px; background: #eff6ff; border-radius: 50%;
  animation: pulse-soft 2s infinite;
}
@keyframes pulse-soft { 0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); } }

.empty-state h3 { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
.empty-state p { color: #64748b; font-size: 15px; margin-bottom: 24px; max-width: 300px; }
.btn-primary {
  padding: 12px 24px; background: #0f172a; color: white; border: none;
  border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { background: #1e293b; transform: translateY(-2px); }

/* Transitions */
.notif-list-enter-active, .notif-list-leave-active { transition: all 0.4s ease; }
.notif-list-enter-from { opacity: 0; transform: translateX(-30px); }
.notif-list-leave-to { opacity: 0; transform: scale(0.9); }

@media (max-width: 1024px) {
  .content-arena { flex-direction: column; }
  .filter-sidebar { flex: none; width: 100%; position: static; }
  .filter-nav { flex-direction: row; flex-wrap: wrap; }
  .filter-tab { width: auto; }
}
</style>
