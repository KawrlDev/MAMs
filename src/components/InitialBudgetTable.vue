<template>
  <div class="budget-card">
    <div class="section-header">
      <h4>INITIAL BUDGET</h4>

      <RouterLink to="/create-yearly-budget">
        <q-btn icon="add" label="CREATE NEW YEARLY BUDGET" class="add-btn" />
      </RouterLink>
    </div>

    <q-table flat bordered class="budget-table" :rows="rows" :columns="columns" row-key="year"
      :rows-per-page-options="[5, 10, 15, 20, 0]" v-slot:bottom="props" />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { onMounted, ref } from 'vue';
import axios from 'axios';

const rows = ref([])

const columns = [
  { name: 'year', label: 'Year', field: 'year', align: 'center' },
  { name: 'medicine', label: 'Medicine Budget', field: 'medicine_budget', align: 'center' },
  { name: 'lab', label: 'Laboratory Budget', field: 'laboratory_budget', align: 'center' },
  { name: 'hospital', label: 'Hospital Budget', field: 'hospital_budget', align: 'center' }
]

onMounted(() => {
  const getYearlyBudget = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/yearly-budget')
      rows.value = res.data
    } catch (err) {
      console.error(err)
    }
  }
  getYearlyBudget()
})
</script>

<style scoped>
.budget-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-top: 32px;
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