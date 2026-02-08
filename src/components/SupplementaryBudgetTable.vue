<template>
  <div class="budget-card">
    <div class="section-header">
      <h4>Supplemental Budget</h4>

      <div class="header-buttons">
        <!-- TRANSFER BUDGET BUTTON - Now navigates to separate page -->
        <RouterLink to="/transfer-supplemental-budget">
          <q-btn 
            icon="swap_horiz" 
            label="TRANSFER BUDGET" 
            class="transfer-btn" 
          />
        </RouterLink>
        
        <!-- ADD BUDGET BUTTON -->
        <RouterLink to="/add-supplementary-bonus">
          <q-btn icon="add" label="ADD SUPPLEMENTAL BUDGET" class="add-btn" />
        </RouterLink>
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      class="budget-table"
      :rows-per-page-options="[5, 10, 15, 20, 0]"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const rows = ref([])

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'year', label: 'Year', field: 'year', align: 'center', sortable: true },
  { name: 'addedOn', label: 'Added on', field: 'date_added', align: 'center', sortable: true },
  { name: 'medicine', label: 'Supplemental Medicine Bonus', field: 'medicine_supplementary_bonus', align: 'center', sortable: true, format: val => formatCurrency(val) },
  { name: 'lab', label: 'Supplemental Laboratory Bonus', field: 'laboratory_supplementary_bonus', align: 'center', sortable: true, format: val => formatCurrency(val) },
  { name: 'hospital', label: 'Supplemental Hospital Bonus', field: 'hospital_supplementary_bonus', align: 'center', sortable: true, format: val => formatCurrency(val) }
]

// Format currency helper
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0.00'
  return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Fetch supplementary budget
const getSupplementaryBudget = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/supplementary-bonus')
    rows.value = res.data
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  getSupplementaryBudget()
})
</script>

<style scoped>
.budget-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  font-weight: 700;
  margin: 5px;
  color: #1f8f2e;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.transfer-btn {
  background: #ff9800;
  color: #ffffff;
  font-weight: 600;
}

.add-btn {
  background: #0aa64f;
  color: #ffffff;
  font-weight: 600;
}

.budget-table :deep(thead tr) {
  background: #1f8f2e;
}

.budget-table :deep(thead th) {
  color: #ffffff;
  font-weight: 600;
  text-align: center;
}

.budget-table :deep(td) {
  text-align: center;
}
</style>