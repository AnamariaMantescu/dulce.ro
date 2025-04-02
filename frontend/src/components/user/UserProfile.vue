<!-- components/user/UserProfile.vue -->
<template>
  <div class="profile-container">
    <!-- Profile Summary Card -->
    <div class="profile-summary">
      <div class="summary-content">
        <div class="user-avatar">
          <span>{{ initials }}</span>
        </div>
        <div class="user-details">
          <h2>{{ user.displayName || 'Nume Utilizator' }}</h2>
          <p class="user-email">{{ user.email }}</p>
          <p v-if="user.createdAt" class="member-since">
            <span class="label">Membru din:</span> {{ formattedDate }}
          </p>
        </div>
      </div>
      <div class="actions">
        <button class="action-btn edit" @click="$emit('edit-profile')">
          <span class="icon">✏️</span>
          <span>Editare Profil</span>
        </button>
      </div>
    </div>

    <!-- Profile Details Section -->
    <div class="profile-details-section">
      <h3 class="section-title">Informații Cont</h3>
      
      <div class="details-grid">
        <div class="detail-card">
          <div class="card-icon">📧</div>
          <div class="card-content">
            <h4>Email</h4>
            <p>{{ user.email }}</p>
          </div>
        </div>
        
        <div class="detail-card">
          <div class="card-icon">📱</div>
          <div class="card-content">
            <h4>Telefon</h4>
            <p>{{ user.phone || 'Nespecificat' }}</p>
          </div>
        </div>
        
        <div class="detail-card">
          <div class="card-icon">👤</div>
          <div class="card-content">
            <h4>Rol</h4>
            <p>{{ getUserRole(user.role) }}</p>
          </div>
        </div>
        
        <div class="detail-card">
          <div class="card-icon">📅</div>
          <div class="card-content">
            <h4>Data înregistrării</h4>
            <p>{{ formattedDate }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {};
  },
  computed: {
    initials() {
      if (!this.user.displayName) return '?';
      return this.user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    },
    formattedDate() {
      if (!this.user.createdAt) return 'N/A';
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return new Date(this.user.createdAt).toLocaleDateString('ro-RO', options);
    }
  },
  methods: {
    getUserRole(role) {
      const roleMap = {
        'customer': 'Client',
        'admin': 'Administrator',
        'editor': 'Editor'
      };
      return roleMap[role] || role;
    }
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Profile Summary Card */
.profile-summary {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

.profile-summary::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(181, 131, 141, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-avatar {
  width: 100px;
  height: 100px;
  background:  #b5838d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.2rem;
  font-weight: 300;
  box-shadow: 0 8px 20px rgba(181, 131, 141, 0.2);
  position: relative;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-details h2 {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 500;
  color: #333;
  margin: 0 0 0.3rem 0;
}

.user-email {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
}

.member-since {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.member-since .label {
  font-weight: 500;
  color: #777;
}

.actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #b5838d;
  color: #b5838d;
  border-radius: 5px;
  padding: 0.7rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #b5838d;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(181, 131, 141, 0.2);
}

.action-btn .icon {
  font-size: 1.1rem;
}

/* Profile Details Section */
.profile-details-section, 
.account-stats, 
.last-order-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
  padding: 2rem;
}

.section-title {
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: #333;
  margin: 0 0 1.5rem 0;
  position: relative;
  padding-bottom: 0.8rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: #b5838d;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.detail-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.detail-card:hover {
  background-color: #f5f5f5;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.card-icon {
  font-size: 1.8rem;
  color: #b5838d;
}

.card-content h4 {
  margin: 0 0 0.3rem 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.card-content p {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background-color: #f5f5f5;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 2rem;
  font-weight: 300;
  color: #b5838d;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* Last Order Section */
.order-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.order-number {
  font-weight: 500;
  font-size: 1rem;
  color: #333;
}

.order-date {
  font-size: 0.9rem;
  color: #666;
}

.order-status {
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.processing {
  background-color: rgba(255, 193, 7, 0.1);
  color: #FFC107;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.status-badge.shipped {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.status-badge.delivered {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.status-badge.cancelled {
  background-color: rgba(244, 67, 54, 0.1);
  color: #F44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.order-total {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.order-total .label {
  font-weight: 500;
  color: #666;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

.secondary-btn {
  background-color: transparent;
  border: 1px solid #b5838d;
  color: #b5838d;
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background-color: #b5838d;
  color: white;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .profile-summary {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .summary-content {
    width: 100%;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .details-grid, .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .summary-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .actions {
    justify-content: center;
  }
  
  .details-grid, .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .order-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>