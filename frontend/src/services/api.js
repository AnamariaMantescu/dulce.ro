// client/src/services/api.js
import axios from 'axios'


const API_URL = 'http://localhost:5001/api'

export default {
  // Produse
  getProducts(category = null) {
    const url = category ? `${API_URL}/products?category=${category}` : `${API_URL}/products`
    return axios.get(url)
  },
  getProduct(id) {
    return axios.get(`${API_URL}/products/${id}`)
  },
  
  // Teme
  getActiveThemes() {
    return axios.get(`${API_URL}/themes?active=true`)
  },
  
  // Elemente tort personalizat
  getCakeElements() {
    return axios.get(`${API_URL}/custom-cake/elements`)
  },
  
  // Quiz
  getQuizQuestions() {
    return axios.get(`${API_URL}/quiz/questions`)
  },
  submitQuizAnswers(answers) {
    return axios.post(`${API_URL}/quiz/submit`, answers)
  }
  
  // Adaugă alte metode pentru toate endpoint-urile API
}
