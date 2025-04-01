// services/stripeConfig.js
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLIC_KEY';

export const STRIPE_OPTIONS = {
  locale: 'ro',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#7b5e94', // Adaptați la culorile temei dvs
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px'
    }
  }
};

// Funcție helper pentru a încărca Stripe
export const loadStripe = async () => {
  if (!window.Stripe) {
    // Încarcă Stripe.js dacă nu este deja încărcat
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.body.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => {
        resolve(window.Stripe(STRIPE_PUBLIC_KEY));
      };
    });
  }
  
  return window.Stripe(STRIPE_PUBLIC_KEY);
};