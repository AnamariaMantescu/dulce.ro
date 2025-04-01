<!-- components/user/EditProfileForm.vue -->
<template>
  <div class="edit-profile-modal">
    <div class="edit-form-container">
      <div class="modal-header">
        <h2>Editare Profil</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="submitChanges" class="profile-form">
        <div class="form-group">
          <label for="displayName">Nume</label>
          <input 
            type="text" 
            id="displayName" 
            v-model="formData.displayName" 
            placeholder="Numele dumneavoastră complet" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            placeholder="Adresa dumneavoastră de email" 
            required
            disabled
          />
          <small>Adresa de email nu poate fi modificată</small>
        </div>
        
        <div class="form-group">
          <label for="phone">Telefon</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="formData.phone" 
            placeholder="Numărul dumneavoastră de telefon" 
          />
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Renunță
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="isSubmitting || !isValid"
          >
            {{ isSubmitting ? 'Se salvează...' : 'Salvează Modificările' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditProfileForm',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      formData: {
        displayName: this.user.displayName || '',
        email: this.user.email || '',
        phone: this.user.phone || ''
      },
      isSubmitting: false
    }
  },
  computed: {
    isValid() {
      return this.formData.displayName.trim() !== '';
    }
  },
  methods: {
    async submitChanges() {
      if (!this.isValid || this.isSubmitting) return;
      
      this.isSubmitting = true;
      
      try {
        // Create update object with just the fields in your database
        const updates = {
          displayName: this.formData.displayName,
          email: this.formData.email, // This won't change as it's disabled
          phone: this.formData.phone
        };
        
        // Emit data to parent component
        this.$emit('save-profile', updates);
        
      } catch (error) {
        console.error('Error updating profile:', error);
        this.$emit('error', 'Nu s-a putut actualiza profilul. Vă rugăm să încercați din nou.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style scoped>
.edit-profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.edit-form-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 400;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: #999;
  padding: 0;
  margin-left: 1rem;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #333;
}

.profile-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.form-group small {
  display: block;
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.4rem;
}

input[type="text"],
input[type="email"],
input[type="tel"] {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus {
  border-color: #b5838d;
  outline: none;
  box-shadow: 0 0 0 3px rgba(181, 131, 141, 0.1);
}

input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
}

.btn-primary {
  background: linear-gradient(to right, #b5838d, #9c27b0);
  color: white;
  box-shadow: 0 4px 12px rgba(181, 131, 141, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(181, 131, 141, 0.3);
}

.btn-primary:disabled {
  background: linear-gradient(to right, #d1b3bd, #ce93d8);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background-color: #f9f9f9;
  border-color: #ccc;
}

@media (max-width: 600px) {
  .edit-form-container {
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
  }
}
</style>