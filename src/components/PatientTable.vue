<template>
  <div class="toolbar-wrapper">

    <q-card flat bordered class="filter-card">
      <q-card-section class="row q-col-gutter-md items-center">

        <!-- SEARCH -->
        <div class="col-10">
          <q-input v-model="search" placeholder="Search by name, category, GL No., barangay, or date (YYYY-MM-DD)" outlined dense clearable>
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- BUTTON -->
        <div class="col-auto">
          <RouterLink to="/add-patient">
            <q-btn icon="add" label="ADD PATIENT" color="green" style="margin-left: 20px;" />
          </RouterLink>
        </div>

      </q-card-section>
    </q-card>

  </div>
  <br>
  <div class="budget-table table-scroll">
    <q-table title="Patient's Record" :rows="rows" :columns="columns" row-key="glNum">
      <template #body-cell-action="props">
        <ActionBtn :row="props.row" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch } from 'vue'
import ActionBtn from './ActionBtn.vue'

const rows = ref([])

const columns = [
  { name: 'name', label: "Patient's Name", field: 'name', align: 'center', sortable: true },
  { name: 'barangay', label: 'Barangay', field: 'barangay', align: 'center', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'center', sortable: true },
  { name: 'glNum', label: 'GL No.', field: 'glNum', align: 'center', sortable: true },
  { name: 'date', label: 'Date Issued', field: 'date', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

onMounted(() => {
  const getPatientList = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/patients')

      // Map the data to include concatenated name
      rows.value = mapPatientsToRows(res.data)
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  getPatientList()
})

const search = ref('')

const mapPatientsToRows = (patients) => {
  return patients.map(patient => {
    const name = [
      patient.lastname ? patient.lastname + ',' : '',
      patient.firstname,
      patient.middlename,
      patient.suffix
    ].filter(Boolean).join(' ')

    return {
      ...patient,
      name,
      barangay: patient.barangay,
      category: patient.category,
      glNum: patient.gl_no,
      date: patient.date_issued
    }
  })
}

watch(search, async (val) => {
  const res = await axios.get(
    'http://localhost:8000/api/patients/search',
    { params: { q: val } }
  )

  rows.value = mapPatientsToRows(res.data)
})
</script>

<style scoped>
.budget-table {
  width: 100%;
}

.budget-table :deep(thead tr) {
  background: #1f8f2e;
}

.budget-table :deep(thead th) {
  color: #ffffff;
  font-weight: 600;
  text-align: center !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  font-size: 12px;
}

.budget-table :deep(thead th .q-table__sort-icon) {
  margin-left: 4px;
}

.budget-table :deep(td) {
  text-align: center;
  vertical-align: middle;
}

.budget-table :deep(.q-table__title) {
  font-size: 24px;
  font-weight: 700;
  color: #1f8f2e;
}

.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>