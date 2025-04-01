<template>
  <div class="product-list">
    <h2>Lista Produse</h2>
    <div v-if="deleteError" class="error-message">
      {{ deleteError }}
    </div>
    <div v-for="prod in products" :key="prod.id" class="product-item">
      <p>{{ prod.name }} - {{ prod.price }} lei</p>
      <span class="product-ids">
        <span class="product-id">ID: {{ prod.id }}</span>
        <span v-if="prod._firestoreId" class="firestore-id">Firestore ID: {{ prod._firestoreId }}</span>
      </span>
      <div class="action-buttons">
        <button @click="deleteProduct(prod)" :disabled="isDeleting === prod.id">
          {{ isDeleting === prod.id ? 'Ștergere...' : 'Șterge' }}
        </button>
        <button @click="editProduct(prod)">Editează</button>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

export default {
  name: 'AdminProductList',
  props: {
    products: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isDeleting: null, // Tracks which product is being deleted
      deleteError: null // Stores any error messages
    };
  },
  methods: {
    async deleteProduct(product) {
      try {
        this.isDeleting = product.id;
        this.deleteError = null;
        
        console.log("Attempting to delete product:", product.name);
        console.log("Product ID:", product.id);
        console.log("Firestore document ID:", product._firestoreId);
        
        // Use the Firestore document ID if available, otherwise fall back to product ID
        const documentId = product._firestoreId || product.id;
        console.log(`Using document ID for deletion: "${documentId}"`);
        
        // Delete the document
        await deleteDoc(doc(db, 'products', documentId));
        
        console.log("Product deleted successfully!");
        
        // Immediately remove the product from the local array to update UI
        this.$emit('productDeleted', product.id);
        
        // Force the component to re-render
        this.$forceUpdate();
        
      } catch (error) {
        console.error("Error deleting product:", error);
        this.deleteError = `Eroare la ștergerea produsului: ${error.message}`;
      } finally {
        this.isDeleting = null;
      }
    },
    
    async editProduct(product) {
      const updatedName = prompt("Noul nume pentru produs:", product.name);
      if (updatedName) {
        try {
          // Use the Firestore document ID if available, otherwise fall back to product ID
          const documentId = product._firestoreId || product.id;
          await updateDoc(doc(db, 'products', documentId), { name: updatedName });
          this.$emit('productUpdated');
        } catch (error) {
          console.error("Eroare la actualizarea produsului:", error);
          alert(`Eroare la actualizarea produsului: ${error.message}`);
        }
      }
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  background-color: #ffeeee;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ffaaaa;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.product-ids {
  font-size: 0.85em;
  color: #666;
}

.product-id, .firestore-id {
  margin-right: 10px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: #007BFF;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>