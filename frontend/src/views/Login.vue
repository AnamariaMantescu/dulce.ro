<template>
  <div class="login-container">
    <div class="form-box">
      <h2>Autentificare</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Email"
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Parolă</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="Parolă"
            autocomplete="current-password"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Se procesează...' : 'Autentificare' }}
          </button>
        </div>
        
        <div class="form-footer">
          <p>Nu aveți cont? <router-link to="/signup">Înregistrați-vă</router-link></p>
          <p><a href="#" @click.prevent="resetPassword">Ați uitat parola?</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useStore } from 'vuex';

export default {
  name: 'LoginView',
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);
    
    const router = useRouter();
    const toast = useToast();
    const store = useStore();

    const login = async () => {
      error.value = '';
      loading.value = true;
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
        
        // Enhanced debugging
        console.log('Authentication successful:', userCredential.user);
        
        // Set the user in the store and AWAIT this operation to ensure it completes
        await store.dispatch('user/setUser', userCredential.user);
        
        // More debugging to confirm the auth state
        console.log('User set in store, auth state:', store.getters['user/isAuthenticated']);
        console.log('Current user after login:', store.getters['user/currentUser']);
        
        // Show success toast
        toast.success('Autentificare reușită!');
        
        // Check for redirect parameter and wait a moment to ensure store is updated
        setTimeout(() => {
          const redirectTo = router.currentRoute.value.query.redirect;
          console.log('Redirect parameter:', redirectTo);
          
          if (redirectTo) {
            // Redirect to the specified route
            console.log('Redirecting to:', redirectTo);
            router.push({ name: redirectTo });
          } else {
            // Default redirect
            router.push('/');
          }
        }, 300); // Short delay to ensure store updates are processed
      } catch (err) {
        console.error('Eroare autentificare:', err);
        
        switch(err.code) {
          case 'auth/invalid-email':
            error.value = 'Adresa de email este invalidă.';
            break;
          case 'auth/user-disabled':
            error.value = 'Acest cont a fost dezactivat.';
            break;
          case 'auth/user-not-found':
            error.value = 'Nu există un cont asociat cu acest email.';
            break;
          case 'auth/wrong-password':
            error.value = 'Parolă incorectă.';
            break;
          default:
            error.value = 'A apărut o eroare la autentificare.';
        }
      } finally {
        loading.value = false;
      }
    };
    
    const resetPassword = async () => {
      if (!email.value) {
        error.value = 'Introduceți adresa de email pentru resetarea parolei.';
        return;
      }
      
      try {
        await sendPasswordResetEmail(auth, email.value);
        toast.info('Un email pentru resetarea parolei a fost trimis la adresa indicată.');
      } catch (err) {
        console.error('Eroare resetare parolă:', err);
        error.value = 'Nu s-a putut trimite emailul pentru resetarea parolei.';
      }
    };
    
    return {
      email,
      password,
      error,
      loading,
      login,
      resetPassword
    };
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #fafafa;
}

.form-box {
  width: 100%;
  max-width: 500px; /* Mărită de la 400px la 500px */
  padding: 50px; /* Mărită de la 40px la 50px pentru mai mult spațiu interior */
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 500;
  font-size: 28px; /* Mărită de la 24px la 28px */
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 28px; /* Mărită de la 24px la 28px */
  position: relative;
}

label {
  display: block;
  margin-bottom: 10px; /* Mărită de la 8px la 10px */
  font-weight: 400;
  font-size: 16px; /* Mărită de la 14px la 16px */
  color: #555;
}

input {
  width: 100%;
  padding: 14px 0; /* Mărită de la 12px la 14px */
  border: none;
  border-bottom: 1px solid #ddd;
  font-size: 16px;
  background-color: #fff;
  color: #333;
  transition: border-color 0.3s;
}

input::placeholder {
  color: #999;
  opacity: 1;
}

input:focus {
  border-color: #b5838d;
  outline: none;
}

.btn-primary {
  width: 100%;
  padding: 14px; /* Mărită de la 12px la 14px */
  background-color: #b5838d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  margin-top: 10px;
}

.btn-primary:hover {
  background-color: #a26769;
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background-color: #d0b3b9;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background-color: #fff4f4;
  color: #e63946;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 3px solid #e63946;
}

.form-footer {
  margin-top: 30px;
  text-align: center;
  font-size: 16px; /* Mărită de la 14px la 16px */
  color: #777;
}

.form-footer a {
  color: #b5838d;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}

.form-footer p {
  margin: 8px 0;
}

/* Media query pentru ecrane mari (desktop) */
@media (min-width: 1200px) {
  .form-box {
    max-width: 600px; /* Și mai lată pe desktop */
    padding: 60px;
  }
  
  h2 {
    font-size: 32px;
    margin-bottom: 40px;
  }
}
</style>