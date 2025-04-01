<template>
    <div class="special-day-list">
      <h2 class="text-xl font-bold mb-4">Lista Zile Speciale</h2>
      
      <div v-if="loading" class="text-center py-4">
        <p>Se încarcă lista de evenimente speciale...</p>
      </div>
      
      <div v-else-if="specialDays.length === 0" class="text-center py-4 bg-gray-100 rounded">
        <p>Nu există zile speciale în baza de date</p>
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
                <th class="py-2 px-4 border-b text-left">Data</th>
                <th class="py-2 px-4 border-b text-center">Status</th>
                <th class="py-2 px-4 border-b text-right">Discount</th>
                <th class="py-2 px-4 border-b text-center">Produse</th>
                <th class="py-2 px-4 border-b text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="specialDay in specialDays" :key="specialDay.id" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">
                  <div class="font-medium">{{ specialDay.name }}</div>
                  <div class="text-xs text-gray-500">ID: {{ specialDay.id }}</div>
                </td>
                <td class="py-2 px-4 border-b">
                  {{ formatDate(specialDay.date) }}
                </td>
                <td class="py-2 px-4 border-b text-center">
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium', 
                      specialDay.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ specialDay.active ? 'Activ' : 'Inactiv' }}
                  </span>
                </td>
                <td class="py-2 px-4 border-b text-right">
                  {{ specialDay.discount }}%
                </td>
                <td class="py-2 px-4 border-b text-center">
                  {{ specialDay.products_ids ? specialDay.products_ids.length : 0 }}
                </td>
                <td class="py-2 px-4 border-b text-center">
                  <div class="flex justify-end space-x-2">
                    <button 
                      @click="toggleActive(specialDay)"
                      :title="specialDay.active ? 'Dezactivează' : 'Activează'"
                      class="p-1 rounded"
                      :class="specialDay.active ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'"
                    >
                      {{ specialDay.active ? '⏸️' : '▶️' }}
                    </button>
                    <button 
                      @click="editSpecialDay(specialDay)" 
                      class="bg-blue-100 text-blue-700 p-1 rounded"
                      title="Editează"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="deleteSpecialDay(specialDay)" 
                      :disabled="isDeleting === specialDay.id"
                      class="bg-red-100 text-red-700 p-1 rounded"
                      title="Șterge"
                    >
                      {{ isDeleting === specialDay.id ? '⏳' : '🗑️' }}
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
    name: 'AdminSpecialDayList',
    props: {
      specialDays: {
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
      
      async toggleActive(specialDay) {
        try {
          const newStatus = !specialDay.active;
          await updateDoc(doc(db, 'specialDays', specialDay.id), { 
            active: newStatus 
          });
          
          // Emit event to parent component to refresh data
          this.$emit('specialDayUpdated');
          this.$emit('showNotification', { 
            type: 'success', 
            message: `Evenimentul a fost ${newStatus ? 'activat' : 'dezactivat'} cu succes!` 
          });
        } catch (error) {
          console.error("Error toggling active status:", error);
          this.$emit('showNotification', { 
            type: 'error', 
            message: `Eroare la ${!specialDay.active ? 'activarea' : 'dezactivarea'} evenimentului: ${error.message}` 
          });
        }
      },
      
      async deleteSpecialDay(specialDay) {
        if (!confirm(`Sigur doriți să ștergeți evenimentul "${specialDay.name}"?`)) {
          return;
        }
        
        try {
          this.isDeleting = specialDay.id;
          this.deleteError = null;
          
          console.log("Attempting to delete special day:", specialDay.name);
          console.log("Special Day ID:", specialDay.id);
          
          // Delete the document
          await deleteDoc(doc(db, 'specialDays', specialDay.id));
          
          console.log("Special day deleted successfully!");
          
          // Emit event to parent component to refresh data
          this.$emit('specialDayDeleted', specialDay.id);
          this.$emit('showNotification', { 
            type: 'success', 
            message: 'Evenimentul special a fost șters cu succes!' 
          });
          
        } catch (error) {
          console.error("Error deleting special day:", error);
          this.deleteError = `Eroare la ștergerea evenimentului: ${error.message}`;
          this.$emit('showNotification', { 
            type: 'error', 
            message: this.deleteError 
          });
        } finally {
          this.isDeleting = null;
        }
      },
      
      editSpecialDay(specialDay) {
        this.$emit('editSpecialDay', specialDay.id);
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