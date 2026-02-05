<template>
  <div class="budget-card">
    <div class="section-header">
      <h4>SUPPLEMENTAL BUDGET</h4>

      <RouterLink to="/add-supplementary-bonus">
        <q-btn icon="add" label="ADD BONUS" class="add-btn" />
      </RouterLink>
    </div>

    <q-table flat bordered :rows="rows" :columns="columns" row-key="id" class="budget-table"
      :rows-per-page-options="[5, 10, 15, 20, 0]" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';

const rows = ref([])

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'year', label: 'Year', field: 'year', align: 'center', sortable: true },
  { name: 'addedOn', label: 'Added on', field: 'date_added', align: 'center', sortable: true },
  { name: 'medicine', label: 'Supplemental Medicine Bonus', field: 'medicine_supplementary_bonus', align: 'center', sortable: true },
  { name: 'lab', label: 'Supplemental Laboratory Bonus', field: 'laboratory_supplementary_bonus', align: 'center', sortable: true },
  { name: 'hospital', label: 'Supplemental Hospital Bonus', field: 'hospital_supplementary_bonus', align: 'center', sortable: true }
]

onMounted(() => {
  const getSupplementaryBudget = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/supplementary-bonus')
      rows.value = res.data
    } catch (err) {
      console.log(err)
    }
  }
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