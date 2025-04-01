// store/modules/config.js
export default {
  namespaced: true,
  state: {
    siteConfig: {
      homepage: {
        show_testimonials: true,
        show_featured_categories: true,
        show_featured_products: true
      },
      contact: {
        email: "contact@cofetarieartizanala.ro",
        phone: "+40 723 456 789",
        address: "Strada Exemplu nr. 123, București"
      },
      social: {
        facebook: "https://facebook.com/cofetarieartizanala",
        instagram: "https://instagram.com/cofetarieartizanala"
      }
    }
  },
  mutations: {
    UPDATE_SITE_CONFIG(state, config) {
      state.siteConfig = { ...state.siteConfig, ...config };
    }
  },
  actions: {
    fetchSiteConfig({ commit }) {
      // În mod normal, aici ar fi un apel API
      // Pentru moment, folosim date statice
      const config = {
        homepage: {
          show_testimonials: true,
          show_featured_categories: true,
          show_featured_products: true
        },
        contact: {
          email: "contact@cofetarieartizanala.ro",
          phone: "+40 723 456 789",
          address: "Strada Exemplu nr. 123, București"
        },
        social: {
          facebook: "https://facebook.com/cofetarieartizanala",
          instagram: "https://instagram.com/cofetarieartizanala"
        }
      };
      commit('UPDATE_SITE_CONFIG', config);
    }
  }
}
