<template>
  <div class="toolbar-wrapper">

    <!-- SEARCH & ADD BUTTON -->
    <q-card flat bordered class="filter-card">
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="title">Patient's Record</div>
        <!-- DATE SEARCH -->
         <div class="search">
        <!-- FILTER BY PERIOD (INLINE LABEL + INPUT) -->
        <div class="col-7 row items-center q-gutter-sm" style="gap: 8px;">
  <span class="text-body2 text-weight-medium" style="white-space: nowrap;">
    Filter by Period:
  </span>

  <q-input 
    style="flex-grow: 1; min-width: 250px;" 
    :model-value="formattedDate" 
    outlined 
    dense 
    placeholder="dd/mm/yyyy - dd/mm/yyyy"
    @clear="onClearDate"
    readonly
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover>
          <q-date 
            v-model="dateRange" 
            range 
            emit-immediately 
            mask="DD/MM/YYYY"
          >
            <div class="row items-center justify-end q-pa-sm">
              <q-btn label="Close" color="primary" flat v-close-popup />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</div>
        </div>
        <div class="row-1">
        <div class="category">
          <q-select 
            v-model="categoryValue" 
            :options="categoryOptions" 
            label="Category" 
            placeholder="Category" 
            dense
            outlined 
            @clear="onClearCategory"
          />
        </div>
      </div>
      <div class="field">
          <q-select v-model="partnerValue" dense outlined :options="partnerOptions"
            :rules="[val => !!val || 'This field is required']" :disable="categoryValue == null"
            :hint="categoryValue == null ? 'Must select a category before selecting a partner!' : ''"
            :persistent-hint="categoryValue == null" />
        </div>
      </q-card-section>
    </q-card>

    <br />

    <!-- PATIENT TABLE -->
    <div class="budget-table table-scroll">
      <q-table
        :rows="filteredRows"
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
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import ActionBtn from './ActionBtn.vue'

const rows = ref([])
const allPatients = ref([]) // Store all patients
const loading = ref(false)
const dateRange = ref(null)

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const categoryValue = ref(null)

const columns = [
  { name: 'name', label: "Patient's Name", field: 'name', align: 'center', sortable: true },
  { name: 'barangay', label: 'Barangay', field: 'barangay', align: 'center', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'center', sortable: true },
  { name: 'glNum', label: 'GL No.', field: 'glNum', align: 'center', sortable: true },
  { name: 'date', label: 'Date Issued', field: 'date', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

// Computed rows - filters by category on frontend
const filteredRows = computed(() => {
  if (!categoryValue.value) {
    return allPatients.value
  }
  return allPatients.value.filter(patient => patient.category === categoryValue.value)
})

const partnerOptions = computed(() => {
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

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

// Format date for display
const formattedDate = computed(() => {
  if (!dateRange.value) {
    return ''
  }

  if (typeof dateRange.value === 'string') {
    return dateRange.value
  }

  const { from, to } = dateRange.value
  if (from && !to) {
    return from
  }
  if (from && to) {
    return `${from} - ${to}`
  }
  return ''
})

// Fetch patients with optional date filter
const fetchPatients = async (dateFilter = null) => {
  loading.value = true
  try {
    let params = {}
    
    if (dateFilter) {
      if (typeof dateFilter === 'string') {
        params.date = dateFilter
      } else {
        const { from, to } = dateFilter
        if (from && to) {
          params.from = from
          params.to = to
        } else if (from) {
          params.date = from
        }
      }
    }
    
    const res = await axios.get('http://localhost:8000/api/patient-records', { params })
    allPatients.value = mapPatientsToRows(res.data)
  } catch (err) {
    console.error('Failed to fetch patients:', err)
  } finally {
    loading.value = false
  }
}

// Watch for date range changes
watch(dateRange, async (newVal) => {
  if (!newVal) {
    fetchPatients()
    return
  }

  if (typeof newVal === 'string') {
    fetchPatients(newVal)
  } else {
    const { from, to } = newVal
    if (from && to) {
      fetchPatients({ from, to })
    } else if (from) {
      fetchPatients(from)
    }
  }
})

// Clear date filter
const onClearDate = () => {
  dateRange.value = null
}

// Clear category filter
const onClearCategory = () => {
  categoryValue.value = null
}

// Initial fetch on mount
onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.title {
  font-size: 24px;
  font-weight: 700;
  color: #1f8f2e;
}
.search {
  margin-left: 100px;
}
.category {
  width: 200px;
}

.field {
    width: 200px;
}
</style>