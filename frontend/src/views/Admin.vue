<template>
  <div class="admin-dashboard">
    <div class="header bg-white p-4 border-b shadow-sm mb-6">
      <div class="container mx-auto">
        <h1 class="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>
    </div>
    
    <div class="container mx-auto px-4">
      <!-- Tabs -->
      <div class="tabs-container mb-6">
        <div class="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div class="tabs flex">
            <button 
              v-for="tab in tabs" 
              :key="tab.value" 
              @click="activeTab = tab.value"
              class="tab-button flex-1 py-4 px-6 font-medium transition-colors focus:outline-none"
              :class="{ 
                'bg-blue-50 text-blue-700 border-b-2 border-blue-500': activeTab === tab.value,
                'text-gray-600 hover:bg-gray-50': activeTab !== tab.value
              }"
            >
              <div class="flex items-center justify-center">
                <span v-html="tab.icon" class="mr-2"></span>
                {{ tab.label }}
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Notificări -->
      <div v-if="notification" :class="['notification p-4 mb-6 rounded-lg shadow-sm animate-fade-in', `notification-${notification.type}`]">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span v-if="notification.type === 'success'" class="text-green-500 mr-3 text-2xl">✓</span>
            <span v-else-if="notification.type === 'error'" class="text-red-500 mr-3 text-2xl">✕</span>
            <span v-else class="text-blue-500 mr-3 text-2xl">ℹ</span>
            <span>{{ notification.message }}</span>
          </div>
          <button @click="notification = null" class="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
      </div>
      
      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Tab Produse -->
        <div v-if="activeTab === 'products'" class="tab-pane">
          <AdminProductsPanel />
        </div>
        
        <!-- Tab Zile Speciale -->
        <div v-if="activeTab === 'specialDays'" class="tab-pane">
          <AdminSpecialDaysPanel />
        </div>
        
        <!-- Tab Săptămâni Tematice -->
        <div v-if="activeTab === 'themes'" class="tab-pane">
          <AdminThemesPanel />
        </div>

        <!-- Tab Comenzi -->
        <div v-if="activeTab === 'orders'" class="tab-pane">
          <AdminOrdersPanel 
            @showNotification="showNotification" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import AdminProductsPanel from '@/components/admin/AdminProductsPanel.vue';
import AdminSpecialDaysPanel from '@/components/admin/AdminSpecialDaysPanel.vue';
import AdminThemesPanel from '@/components/admin/AdminThemesPanel.vue';
import AdminOrdersPanel from '@/components/admin/AdminOrdersPanel.vue';

export default {
  name: 'AdminDashboard',
  components: {
    AdminProductsPanel,
    AdminSpecialDaysPanel,
    AdminThemesPanel,
    AdminOrdersPanel
  },
  data() {
    return {
      activeTab: 'products',
      tabs: [
        { 
          label: 'Produse', 
          value: 'products',
        },
        { 
          label: 'Zile Speciale', 
          value: 'specialDays',
        },
        {
          label: 'Săptămâni Tematice',
          value: 'themes',
        },
        {
          label: 'Comenzi',
          value: 'orders',
        }
      ],
      notification: null
    };
  },
  created() {
    // Check if URL has tab parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && this.tabs.some(tab => tab.value === tabParam)) {
      this.activeTab = tabParam;
    }
  },
  watch: {
    activeTab(newTab) {
      // Update URL when tab changes
      const url = new URL(window.location);
      url.searchParams.set('tab', newTab);
      window.history.pushState({}, '', url);
    }
  },
  methods: {
    showNotification(notification) {
      this.notification = notification;
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        if (this.notification === notification) {
          this.notification = null;
        }
      }, 5000);
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background-color: #f7f9fc;
}

.notification {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-success {
  background-color: #f0fff4;
  border-left: 4px solid #48bb78;
}

.notification-error {
  background-color: #fff5f5;
  border-left: 4px solid #f56565;
}

.notification-info {
  background-color: #ebf8ff;
  border-left: 4px solid #4299e1;
}

.tab-pane {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .tabs {
    flex-direction: column;
  }
  
  .tab-button {
    border-bottom: 1px solid #e2e8f0;
  }
  
  .tab-button:last-child {
    border-bottom: none;
  }
  
  .tab-button.active {
    border-left: 4px solid #3182ce;
    border-bottom: 1px solid #e2e8f0;
  }
}

/* Improve focus states for accessibility */
button:focus, 
select:focus, 
input:focus, 
textarea:focus {
  outline: 2px solid rgba(49, 130, 206, 0.5);
  outline-offset: 2px;
}

/* Improve hover states */
button:hover {
  opacity: 0.9;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  .admin-dashboard {
    background-color: #f7f9fc;
  }
  
  .header {
    background-color: #ffffff;
    color: #1e293b;
  }
  
  .tabs-container {
    background-color: #ffffff;
  }
  
  .tab-button {
    color: #4a5568;
  }
  
  .tab-button.active {
    color: #3182ce;
  }
}
</style>