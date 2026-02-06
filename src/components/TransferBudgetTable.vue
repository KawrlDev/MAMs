<template>
  <div class="budget-card">
    <div class="section-header">
      <h4>TRANSFER BUDGET</h4>

      <div class="header-buttons">
        <!-- TRANSFER BUDGET BUTTON -->
        <RouterLink to="/transfer-supplemental-budget">
          <q-btn icon="edit" label="TRANSFER BUDGET" class="edit-btn" />
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
  { name: 'added_on', label: 'Added on', field: 'added_on', align: 'center', sortable: true },
  { name: 'from', label: 'From', field: 'from', align: 'center', sortable: true },
  { name: 'to', label: 'To', field: 'to', align: 'center', sortable: true },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'center', sortable: true }
]

onMounted(() => {
  const getTransferBudget = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/transfer-budget-history')
      rows.value = res.data
    } catch (err) {
      console.log(err)
    }
  }

  getTransferBudget()
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

.edit-btn {
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
