<template>
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-sections">
          <!-- Secțiunea de contact -->
          <div class="footer-section">
            <h3 class="footer-heading">Contact</h3>
            <ul class="footer-contact-info">
              <li class="contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>+40 712 345 678</span>
              </li>
              <li class="contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>contact@dulce.ro</span>
              </li>
              <li class="contact-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>Str. Dulce Nr. 123, București</span>
              </li>
            </ul>
          </div>
          
          <!-- Logo în centru -->
          <div class="footer-logo">
            <router-link to="/">
              <img src="@/assets/images/dulce-logo.png" alt="Logo Dulce" class="footer-site-logo">
            </router-link>
          </div>
          
          <!-- Secțiunea social media -->
          <div class="footer-section">
            <h3 class="footer-heading">Urmărește-ne</h3>
            <div class="social-icons">
              <a href="#" class="social-icon" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" class="social-icon" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" class="social-icon" aria-label="Pinterest">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </a>
              <a href="#" class="social-icon" aria-label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 8v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <!-- Copyright footer -->
        <div class="copyright">
          <p>&copy; {{ currentYear }} Dulce. <span class="heart">❤</span> Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    data() {
      return {
        currentYear: new Date().getFullYear()
      }
    }
  }
  </script>
  
  <style scoped>
  /* Stiluri pentru footer - versiunea ultra-subțire cu logo */
  .site-footer {
    background-color: #fcf8f9;
    padding: 20px 0 15px;
    margin-top: 40px;
    border-top: 1px solid rgba(181, 131, 141, 0.1);
  }
  
  .footer-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  /* Secțiuni footer - aranjament ultra-subțire cu logo în centru */
  .footer-sections {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }
  
  .footer-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
  }
  
  .footer-section:last-child {
    align-items: flex-end;
  }
  
  /* Logo footer */
  .footer-logo {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
  }
  
  .footer-site-logo {
    height: 76px;
  }
  
  .footer-heading {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #b5838d;
    letter-spacing: 0.5px;
  }
  
  .footer-contact-info {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  /* Secțiune contact */
  .contact-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #999;
    font-size: 12px;
  }
  
  .contact-item svg {
    color: #b5838d;
    opacity: 0.7;
  }
  
  /* Social media */
  .social-icons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .social-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #fff;
    color: #b5838d;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  
  .social-icon:hover {
    color: #e6a0aa;
  }
  
  /* Copyright */
  .copyright {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    text-align: center;
    color: #aaa;
    font-size: 12px;
    margin-top: 5px;
  }
  
  .heart {
    color: #e6a0aa;
    font-size: 10px;
  }
  
  /* Responsivitate */
  @media (max-width: 768px) {
    .site-footer {
      padding: 15px 0 10px;
      margin-top: 30px;
    }
    
    .footer-content {
      gap: 10px;
    }
    
    .footer-sections {
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }
    
    .footer-section {
      width: 100%;
      align-items: center;
    }
    
    .footer-section:last-child {
      align-items: center;
    }
    
    .social-icons {
      justify-content: center;
    }
    
    .footer-heading {
      margin-bottom: 8px;
      text-align: center;
    }
    
    .footer-logo {
      order: -1;
      margin-bottom: 5px;
    }
  }
  
  @media (max-width: 576px) {
    .footer-content {
      padding: 0 10px;
    }
    
    .contact-item {
      font-size: 11px;
    }
    
    .footer-site-logo {
      height: 30px;
    }
  }
  </style>