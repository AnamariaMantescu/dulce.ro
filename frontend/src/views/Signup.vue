<template>
    <div class="signup-container">
      <div class="form-box">
        <h2>Înregistrare</h2>
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <form @submit.prevent="register">
          <div class="form-group">
            <label for="name">Nume</label>
            <input 
              type="text" 
              id="name" 
              v-model="name" 
              required 
              placeholder="Numele dumneavoastră"
            />
          </div>

          <div class="form-group">
            <label for="phone">Telefon</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="phone" 
              required 
              placeholder="Număr de telefon"
            />
          </div>
          
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
              placeholder="Minim 6 caractere"
              autocomplete="new-password"
            />
            <div class="password-strength" v-if="password">
              <span :class="passwordStrength.className">{{ passwordStrength.message }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmă parola</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required 
              placeholder="Confirmare parolă"
               autocomplete="new-password"
            />
            <div v-if="passwordMismatch" class="password-mismatch">
              Parolele nu coincid!
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading || passwordMismatch || !isPasswordValid">
              {{ loading ? 'Se procesează...' : 'Creare cont' }}
            </button>
          </div>
          
          <div class="form-footer">
            <p>Aveți deja cont? <router-link to="/login">Autentificați-vă</router-link></p>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'vue-toastification';
  import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
  import { setDoc, doc } from 'firebase/firestore';
  import { auth, db } from '../firebase';
  import { useStore } from 'vuex';
  
  export default {
    name: 'SignupView',
    setup() {
      const name = ref('');
      const email = ref('');
      const phone = ref('');
      const password = ref('');
      const confirmPassword = ref('');
      const error = ref('');
      const loading = ref(false);
      
      const router = useRouter();
      const toast = useToast();
      const store = useStore();
      
      const passwordMismatch = computed(() => {
        return password.value && confirmPassword.value && password.value !== confirmPassword.value;
      });
      
      const passwordStrength = computed(() => {
        if (!password.value) return { message: '', className: '' };
        
        if (password.value.length < 6) {
          return { message: 'Parolă prea scurtă', className: 'weak' };
        } else if (password.value.length < 10) {
          return { message: 'Parolă de complexitate medie', className: 'medium' };
        } else if (/[A-Z]/.test(password.value) && /[0-9]/.test(password.value) && /[^A-Za-z0-9]/.test(password.value)) {
          return { message: 'Parolă puternică', className: 'strong' };
        } else {
          return { message: 'Parolă de complexitate medie', className: 'medium' };
        }
      });
      
      const isPasswordValid = computed(() => {
        return password.value && password.value.length >= 6;
      });
      
      const register = async () => {
        error.value = '';
        loading.value = true;
        
        if (passwordMismatch.value) {
          error.value = 'Parolele nu coincid!';
          loading.value = false;
          return;
        }
        
        if (!isPasswordValid.value) {
          error.value = 'Parola trebuie să aibă minim 6 caractere!';
          loading.value = false;
          return;
        }
        
        try {
          // 1. Creăm contul în Firebase Authentication
          const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
          const user = userCredential.user;
          
          // 2. Actualizăm profilul utilizatorului cu numele său
          await updateProfile(user, {
            displayName: name.value
          });
          
          // 3. Stocăm datele utilizatorului în Firestore
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: name.value,
            email: email.value,
            phone: phone.value,
            role: 'customer', // Rol implicit pentru utilizatorii noi
            createdAt: new Date().toISOString()
          });
          
          // 4. Setăm utilizatorul în store
          store.dispatch('user/setUser', {
            ...user,
            phone: phone.value,
            role: 'customer'
          });
          
          toast.success('Cont creat cu succes!');
          router.push('/');
        } catch (err) {
          console.error('Eroare înregistrare:', err);
          
          switch(err.code) {
            case 'auth/email-already-in-use':
              error.value = 'Acest email este deja asociat unui cont.';
              break;
            case 'auth/invalid-email':
              error.value = 'Adresa de email este invalidă.';
              break;
            case 'auth/weak-password':
              error.value = 'Parola este prea slabă.';
              break;
            default:
              error.value = 'A apărut o eroare la înregistrare.';
          }
        } finally {
          loading.value = false;
        }
      };
      
      return {
        name,
        email,
        phone,
        password,
        confirmPassword,
        error,
        loading,
        passwordMismatch,
        passwordStrength,
        isPasswordValid,
        register
      };
    }
  };
  </script>
  
  <style scoped>
  .signup-container {
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
    margin-top: 20px; /* Mărită de la 10px la 20px */
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
  
  .password-strength {
    margin-top: 10px; /* Mărită de la 8px la 10px */
    font-size: 14px; /* Mărită de la 13px la 14px */
  }
  
  .password-strength .weak {
    color: #e63946;
  }
  
  .password-strength .medium {
    color: #f4a261;
  }
  
  .password-strength .strong {
    color: #2a9d8f;
  }
  
  .password-mismatch {
    color: #e63946;
    font-size: 14px; /* Mărită de la 13px la 14px */
    margin-top: 8px;
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