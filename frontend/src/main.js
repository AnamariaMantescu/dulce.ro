// main.js
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router/index.js"; 
import store from "./store"; // Importă store-ul

// Import Toast Notification
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import axios from "axios";
axios.defaults.baseURL = "http://localhost:5001"; // Backend Express

// === Import pentru Firebase ===
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Configure Toast options
const toastOptions = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
};

let app;

// Ascultă starea de autentificare cu Firebase:
onAuthStateChanged(auth, async (user) => {
  console.log("Stare autentificare:", user);

  // Montează aplicația o singură dată, când primim răspunsul de la Firebase
  if (!app) {
    // Aici încarci coșul înainte de a monta aplicația
    await store.dispatch('cart/loadCartFromStorage');

    app = createApp(App);
    app.use(router);
    app.use(store);
    app.use(Toast, toastOptions);

    app.mount("#app");

    // Testare conexiune backend
    axios
      .get("/")
      .then((response) => console.log("Backend Express funcționează!"))
      .catch((error) => console.error(error));
  }
});
