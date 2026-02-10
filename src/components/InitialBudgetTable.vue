<template>
  <div class="budget-card">
    <q-table 
      title="Annual Budget"
      flat 
      bordered 
      class="budget-table" 
      :rows="rows" 
      :columns="columns" 
      row-key="year"
      :rows-per-page-options="[5, 10, 15, 20, 0]"
    >
      <template #top-right>
        <q-btn icon="add" label="ADD BUDGET" class="add-btn" @click="checkBeforeCreate" />
      </template>
      
      <template v-slot:body-cell-medicine="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.medicine_budget) }}
        </q-td>
      </template>
      <template v-slot:body-cell-lab="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.laboratory_budget) }}
        </q-td>
      </template>
      <template v-slot:body-cell-hospital="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.hospital_budget) }}
        </q-td>
      </template>
    </q-table>

    <!-- Warning Dialog -->
    <q-dialog v-model="showWarning" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="dialog-header">
          <q-icon name="warning" size="50px" color="orange" class="warning-icon" />
          <strong class="dialog-title">Budget Already Exists</strong>
        </q-card-section>

        <q-card-section class="q-pt-none">
          You have already created a budget for this year.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="check" label="OK" class="dialog-cancel-btn" @click="closeWarning" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import axios from 'axios'

const router = useRouter()
const rows = ref([])
const showWarning = ref(false)
const currentYear = new Date().getFullYear()

const columns = [
  { name: 'year', label: 'Year', field: 'year', align: 'center' },
  { name: 'medicine', label: 'Medicine Budget', field: 'medicine_budget', align: 'center' },
  { name: 'lab', label: 'Laboratory Budget', field: 'laboratory_budget', align: 'center' },
  { name: 'hospital', label: 'Hospital Budget', field: 'hospital_budget', align: 'center' }
]

onMounted(() => {
  getYearlyBudget()
})

const getYearlyBudget = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/yearly-budget')
    rows.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0.00'
  const num = parseFloat(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const checkBeforeCreate = () => {
  // Check if current year budget already exists
  const existingBudget = rows.value.find(budget => budget.year === currentYear)
  
  if (existingBudget) {
    showWarning.value = true
  } else {
    // If no budget exists for current year, proceed to create page
    router.push('/create-yearly-budget')
  }
}

const closeWarning = () => {
  showWarning.value = false
}
</script>

<style scoped>
.budget-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  margin-top: 32px;
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

/* Dialog Button Styling - Matching Patient Form */
.dialog-cancel-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-cancel-btn .q-icon {
  margin-right: 6px;
}

.dialog-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  text-align: center;
}
</style>