<template>
  <div class="budget-card">
    <q-table
      title="Supplemental Budget"
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      class="budget-table"
      :rows-per-page-options="[5, 10, 15, 20, 0]"
    >
      <template #top-right>
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
      </template>

      <template v-slot:body-cell-medicine="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.medicine_supplementary_bonus) }}
        </q-td>
      </template>
      <template v-slot:body-cell-lab="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.laboratory_supplementary_bonus) }}
        </q-td>
      </template>
      <template v-slot:body-cell-hospital="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.hospital_supplementary_bonus) }}
        </q-td>
      </template>
    </q-table>
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
  { name: 'medicine', label: 'Supplemental Medicine Bonus', field: 'medicine_supplementary_bonus', align: 'center', sortable: true },
  { name: 'lab', label: 'Supplemental Laboratory Bonus', field: 'laboratory_supplementary_bonus', align: 'center', sortable: true },
  { name: 'hospital', label: 'Supplemental Hospital Bonus', field: 'hospital_supplementary_bonus', align: 'center', sortable: true }
]

// Format currency helper
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0.00'
  const num = parseFloat(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

.budget-table :deep(.q-table__card) {
  border-radius: 4px;
  overflow: hidden;
}

.budget-table :deep(.q-table__top) {
  padding: 0 16px 0 0 !important;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1f8f2e;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.budget-table :deep(.q-table__title) {
  font-size: 30px;
  font-weight: 700;
  color: #ffffff;
  padding: 12px 16px;
  margin: 0;
  flex: 1;
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