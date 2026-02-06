<template>
  <div class="toolbar-wrapper">

    <!-- SEARCH & ADD BUTTON -->
    <q-card flat bordered class="filter-card">
      <q-card-section class="row q-col-gutter-md items-center">

        <!-- SEARCH -->
        <div class="col-10">
          <div>Patient's Record</div>
          <q-input
            v-model="search"
            placeholder="Search by date (YYYY-MM-DD)"
            outlined
            dense
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- ADD PATIENT BUTTON -->
        <div class="col-auto">
          <q-btn
            icon="add"
            label="ADD PATIENT"
            color="green"
            class="q-ml-md"
            to="/add-patient"
          />
        </div>

      </q-card-section>
    </q-card>

    <br />

    <!-- PATIENT TABLE -->
    <div class="budget-table table-scroll">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="glNum"
        :loading="loading"
        flat
        bordered
      >
        <template #body-cell-action="props">
          <ActionBtn :row="props.row" />
        </template>
      </q-table>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import debounce from 'lodash/debounce'
import ActionBtn from './ActionBtn.vue'

const rows = ref([])
const loading = ref(false)
const search = ref('')

const columns = [
  { name: 'name', label: "Patient's Name", field: 'name', align: 'center', sortable: true },
  { name: 'barangay', label: 'Barangay', field: 'barangay', align: 'center', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'center', sortable: true },
  { name: 'glNum', label: 'GL No.', field: 'glNum', align: 'center', sortable: true },
  { name: 'date', label: 'Date Issued', field: 'date', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

// Fetch all patients
const fetchPatients = async (query = '') => {
  loading.value = true
  try {
    const res = await axios.get(
      query
        ? 'http://localhost:8000/api/patients/search'
        : 'http://localhost:8000/api/patients',
      { params: query ? { q: query } : {} }
    )
    rows.value = mapPatientsToRows(res.data)
  } catch (err) {
    console.error('Failed to fetch patients:', err)
  } finally {
    loading.value = false
  }
}

// Map patient data to table rows
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

// Debounced search
const debouncedSearch = debounce((val) => {
  fetchPatients(val)
}, 300)

// Watch search input
watch(search, (val) => {
  debouncedSearch(val)
})

// On mount, fetch all patients
onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.budget-table {
  width: 100%;
  overflow-x: auto;
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
