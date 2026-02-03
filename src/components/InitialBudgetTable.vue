<template>
  <div class="budget-card">
    <div class="section-header">
      <h4>INITIAL BUDGET</h4>

      <q-btn icon="add" label="CREATE NEW YEARLY BUDGET" class="add-btn" @click="checkBeforeCreate" />
    </div>

    <q-table flat bordered class="budget-table" :rows="rows" :columns="columns" row-key="year"
      :rows-per-page-options="[5, 10, 15, 20, 0]" v-slot:bottom="props" />

    <!-- Warning Dialog -->
    <q-dialog v-model="showWarning" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="dialog-header">
          <q-icon name="warning" size="50px" color="orange" class="warning-icon" />
          <strong class="dialog-title">Budget Already Exists</strong>
        </q-card-section>

        <q-card-section class="q-pt-none">
          You have already created a budget for the {{ currentYear }}.
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