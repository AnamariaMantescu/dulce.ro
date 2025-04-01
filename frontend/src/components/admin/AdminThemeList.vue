<template>
    <div class="theme-list">
      <h2 class="text-xl font-bold mb-4">Lista Săptămâni Tematice</h2>
      
      <div v-if="loading" class="text-center py-4">
        <p>Se încarcă lista de săptămâni tematice...</p>
      </div>
      
      <div v-else-if="themes.length === 0" class="text-center py-4 bg-gray-100 rounded">
        <p>Nu există săptămâni tematice în baza de date</p>
      </div>
      
      <div v-else>
        <div v-if="deleteError" class="error-message">
          {{ deleteError }}
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Nume</th>
                <th class="py-2 px-4 border-b text-left">Perioada</th>
                <th class="py-2 px-4 border-b text-center">Status</th>
                <th class="py-2 px-4 border-b text-right">Discount</th>
                <th class="py-2 px-4 border-b text-center">Produse</th>
                <th class="py-2 px-4 border-b text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="theme in themes" :key="theme.id" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">
                  <div class="font-medium">{{ theme.name }}</div>
                  <div class="text-xs text-gray-500">ID: {{ theme.id }}</div>
                </td>
                <td class="py-2 px-4 border-b">
                  {{ formatDate(theme.start_date) }} - {{ formatDate(theme.end_date) }}
                </td>
                <td class="py-2 px-4 border-b text-center">
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium', 
                      theme.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ theme.active ? 'Activ' : 'Inactiv' }}
                  </span>
                </td>
                <td class="py-2 px-4 border-b text-right">
                  {{ theme.special_discount || 0 }}%
                </td>
                <td class="py-2 px-4 border-b text-center">
                  {{ theme.products_ids ? theme.products_ids.length : 0 }}
                </td>
                <td class="py-2 px-4 border-b text-center">
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="toggleActive(theme)"
                      :title="theme.active ? 'Dezactivează' : 'Activează'"
                      class="p-1 rounded"
                      :class="theme.active ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'"
                    >
                      {{ theme.active ? '⏸️' : '▶️' }}
                    </button>
                    <button 
                      @click="editTheme(theme)" 
                      class="bg-blue-100 text-blue-700 p-1 rounded"
                      title="Editează"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="deleteTheme(theme)" 
                      :disabled="isDeleting === theme.id"
                      class="bg-red-100 text-red-700 p-1 rounded"
                      title="Șterge"
                    >
                      {{ isDeleting === theme.id ? '⏳' : '🗑️' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
  import { db } from '@/firebase';
  
  export default {
    name: 'AdminThemeList',
    props: {
      themes: {
        type: Array,
        required: true
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isDeleting: null,
        deleteError: null
      };
    },
    methods: {
      formatDate(dateString) {
        if (!dateString) return '';
        
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', options);
      },
      
      async toggleActive(theme) {
        try {
          const newStatus = !theme.active;
          await updateDoc(doc(db, 'themes', theme.id), { 
            active: newStatus 
          });
          
          // Emit event to parent component to refresh data
          this.$emit('themeUpdated');
          this.$emit('showNotification', { 
            type: 'success', 
            message: `Tema a fost ${newStatus ? 'activată' : 'dezactivată'} cu succes!` 
          });
        } catch (error) {
          console.error("Error toggling active status:", error);
          this.$emit('showNotification', { 
            type: 'error', 
            message: `Eroare la ${!theme.active ? 'activarea' : 'dezactivarea'} temei: ${error.message}` 
          });
        }
      },
      
      async deleteTheme(theme) {
        if (!confirm(`Sigur doriți să ștergeți tema "${theme.name}"?`)) {
          return;
        }
        
        try {
          this.isDeleting = theme.id;
          this.deleteError = null;
          
          console.log("Attempting to delete theme:", theme.name);
          console.log("Theme ID:", theme.id);
          
          // Delete the document
          await deleteDoc(doc(db, 'themes', theme.id));
          
          console.log("Theme deleted successfully!");
          
          // Emit event to parent component to refresh data
          this.$emit('themeDeleted', theme.id);
          this.$emit('showNotification', { 
            type: 'success', 
            message: 'Tema a fost ștearsă cu succes!' 
          });
          
        } catch (error) {
          console.error("Error deleting theme:", error);
          this.deleteError = `Eroare la ștergerea temei: ${error.message}`;
          this.$emit('showNotification', { 
            type: 'error', 
            message: this.deleteError 
          });
        } finally {
          this.isDeleting = null;
        }
      },
      
      editTheme(theme) {
        this.$emit('editTheme', theme.id);
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
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  </style>