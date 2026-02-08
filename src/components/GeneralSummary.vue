<template>
  <div>
    <!-- FILTERS -->
    <q-card flat bordered class="filter-card">
      <q-card-section>
        <div class="row items-center q-col-gutter-md">
          <!-- DATE SEARCH -->
          <div class="col-auto">
            <div class="row items-center" style="gap: 8px;">
              <span class="text-body2 text-weight-medium" style="white-space: nowrap;">
                Filter by Period:
              </span>

              <q-input style="width: 250px;" :model-value="formattedDate" outlined dense
                placeholder="dd/mm/yyyy - dd/mm/yyyy" @clear="onClearDate" readonly clearable>
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover>
                      <q-date v-model="dateRange" range emit-immediately mask="DD/MM/YYYY">
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

          <!-- CATEGORY -->
          <div class="col-auto" style="width: 200px;">
            <q-select v-model="categoryValue" :options="categoryOptions" label="Category" placeholder="Category" dense
              outlined clearable @clear="onClearCategory" />
          </div>

          <!-- PARTNER -->
          <div class="col-auto" style="width: 200px;">
            <q-select v-model="partnerValue" dense outlined :options="partnerOptions" label="Partner"
              placeholder="Partner" clearable @clear="onClearPartner" :disable="categoryValue == null" />
          </div>

          <!-- BARANGAY -->
          <div class="col-auto" style="width: 200px;">
            <q-select v-model="barangayValue" :options="barangayOptions" label="Barangay" placeholder="Barangay" dense
              outlined clearable @clear="onClearBarangay" />
          </div>

          <!-- SPACER -->
          <div class="col"></div>

          <!-- DOWNLOAD CSV BUTTON -->
          <div class="col-auto">
            <q-btn icon="download" label="Download CSV" color="green" @click="downloadCSV"
              :disable="filteredRows.length === 0" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE CONTAINER -->
    <div class="table-container">
      <div class="scrollable-wrapper">
        <!-- LEFT SECTION (Patient Info) -->
        <div class="left-section" :style="{ width: sectionWidths.left + '%' }">
          <table class="data-table">
            <thead>
              <tr v-if="!categoryValue" class="month-headers-spacer">
                <th colspan="7" class="category-header">&nbsp;</th>
              </tr>
              <!-- Category header row - only show if category filter is applied -->
              <tr v-if="categoryValue" class="category-header-row">
                <th colspan="7" class="category-header">
                  {{ categoryValue }}
                </th>
              </tr>
              <!-- Column headers -->
              <tr>
                <th class="sticky-col">NO.</th>
                <th class="resizable-col"
                  :style="{ width: columnWidths.name + 'px', minWidth: columnWidths.name + 'px', maxWidth: columnWidths.name + 'px' }">
                  <div class="resizable-header">
                    <span>PATIENT'S NAME</span>
                    <div class="resize-handle" @mousedown="startResize($event, 'name')"></div>
                  </div>
                </th>
                <th class="resizable-col"
                  :style="{ width: columnWidths.address + 'px', minWidth: columnWidths.address + 'px', maxWidth: columnWidths.address + 'px' }">
                  <div class="resizable-header">
                    <span>ADDRESS</span>
                    <div class="resize-handle" @mousedown="startResize($event, 'address')"></div>
                  </div>
                </th>
                <th>CONTACT NO.</th>
                <th>AGE</th>
                <th>SEX</th>
                <th>PREFERENCE</th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr>
                <td colspan="7" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="50px" />
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredRows.length === 0">
              <tr>
                <td colspan="7" class="text-center q-pa-lg text-grey-6">
                  No records found
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="(row, index) in filteredRows" :key="row.glNum">
                <td class="sticky-col">{{ index + 1 }}</td>
                <td class="name-cell"
                  :style="{ width: columnWidths.name + 'px', minWidth: columnWidths.name + 'px', maxWidth: columnWidths.name + 'px' }">
                  {{ row.name }}</td>
                <td class="address-cell"
                  :style="{ width: columnWidths.address + 'px', minWidth: columnWidths.address + 'px', maxWidth: columnWidths.address + 'px' }">
                  {{ row.address }}</td>
                <td>{{ row.phoneNumber || 'N/A' }}</td>
                <td>{{ row.age !== null ? row.age : 'N/A' }}</td>
                <td>{{ row.sex || 'N/A' }}</td>
                <td>{{ row.preference || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- DIVIDER (resizable) -->
        <div class="section-divider" @mousedown="startSectionResize">
          <div class="divider-line"></div>
        </div>

        <!-- RIGHT SECTION (Monthly Records) -->
        <div class="right-section" :style="{ width: sectionWidths.right + '%' }">
          <div class="horizontal-scroll">
            <table class="data-table">
              <thead>
                <!-- Month headers row -->
                <tr class="month-headers">
                  <th v-for="monthYear in visibleMonths" :key="monthYear" :colspan="getMonthColspan(monthYear)"
                    :class="`month-header month-${monthYear.split(' ')[0].toLowerCase()}`">
                    {{ monthYear }}
                  </th>
                </tr>
                <!-- Column headers -->
                <tr>
                  <template v-for="monthYear in visibleMonths" :key="`cols-${monthYear}`">
                    <th>GL NO.</th>
                    <th v-if="!categoryValue && !partnerValue">CATEGORY</th>
                    <th v-if="!partnerValue">PARTNER</th>
                    <th>CLIENT'S NAME</th>
                    <th>DATE ISSUED</th>
                    <th v-if="showHospitalBill">HOSPITAL BILL</th>
                    <th>AMOUNT</th>
                    <th>ISSUED BY</th>
                  </template>
                </tr>
              </thead>
              <tbody v-if="loading">
                <tr>
                  <td :colspan="totalColumns" class="text-center q-pa-lg">
                    <q-spinner color="primary" size="50px" />
                  </td>
                </tr>
              </tbody>
              <tbody v-else-if="filteredRows.length === 0">
                <tr>
                  <td :colspan="totalColumns" class="text-center q-pa-lg text-grey-6">
                    No records found
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr v-for="row in filteredRows" :key="row.glNum">
                  <template v-for="monthYear in visibleMonths" :key="`${row.glNum}-${monthYear}`">
                    <template v-if="row.monthlyRecords[monthYear]">
                      <td>{{ row.monthlyRecords[monthYear].glNo }}</td>
                      <td v-if="!categoryValue && !partnerValue">{{ row.monthlyRecords[monthYear].category }}</td>
                      <td v-if="!partnerValue">{{ row.monthlyRecords[monthYear].partner }}</td>
                      <td>{{ row.monthlyRecords[monthYear].clientName }}</td>
                      <td>{{ row.monthlyRecords[monthYear].dateIssued }}</td>
                      <td v-if="showHospitalBill">{{ formatCurrency(row.monthlyRecords[monthYear].hospitalBill) }}</td>
                      <td>{{ formatCurrency(row.monthlyRecords[monthYear].issuedAmount) }}</td>
                      <td>{{ row.monthlyRecords[monthYear].issuedBy }}</td>
                    </template>
                    <template v-else>
                      <td>-</td>
                      <td v-if="!categoryValue && !partnerValue">-</td>
                      <td v-if="!partnerValue">-</td>
                      <td>-</td>
                      <td>-</td>
                      <td v-if="showHospitalBill">-</td>
                      <td>-</td>
                      <td>-</td>
                    </template>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Extend dayjs with customParseFormat plugin
dayjs.extend(customParseFormat)

const rows = ref([])
const allPatients = ref([])
const loading = ref(false)
const dateRange = ref(null)

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const barangayOptions = [
  "APOKON", "BINCUNGAN", "BUSAON", "CANOCOTAN", "CUAMBOGAN", "LA FILIPINA", "LIBOGANON", "MADAUM",
  "MAGDUM", "MAGUGPO EAST", "MAGUGPO NORTH", "MAGUGPO POBLACION", "MAGUGPO SOUTH", "MAGUGPO WEST",
  "MANKILAM", "NEW BALAMBAN", "NUEVA FUERZA", "PAGSABANGAN", "PANDAPAN", "SAN AGUSTIN", "SAN ISIDRO",
  "SAN MIGUEL (CAMP 4)", "VISAYAN VILLAGE"
]

const categoryValue = ref(null)
const partnerValue = ref(null)
const barangayValue = ref(null)

// Column widths for resizable columns
const columnWidths = ref({
  name: 300,
  address: 350
})

// Section widths (percentages) - resizable
const sectionWidths = ref({
  left: 50,
  right: 50
})

// Resize state
const resizeState = ref({
  isResizing: false,
  column: null,
  startX: 0,
  startWidth: 0
})

// Section resize state
const sectionResizeState = ref({
  isResizing: false,
  startX: 0,
  startLeftWidth: 0
})

const visibleMonths = computed(() => {
  // If date filter is applied, show only those months
  if (dateRange.value) {
    let fromDate, toDate

    if (typeof dateRange.value === 'string') {
      fromDate = toDate = dayjs(dateRange.value, 'DD/MM/YYYY')
    } else {
      const { from, to } = dateRange.value
      fromDate = dayjs(from, 'DD/MM/YYYY')
      toDate = to ? dayjs(to, 'DD/MM/YYYY') : fromDate
    }

    if (!fromDate.isValid()) {
      const currentYear = dayjs().format('YYYY')
      return [
        `JANUARY ${currentYear}`, `FEBRUARY ${currentYear}`, `MARCH ${currentYear}`,
        `APRIL ${currentYear}`, `MAY ${currentYear}`, `JUNE ${currentYear}`,
        `JULY ${currentYear}`, `AUGUST ${currentYear}`, `SEPTEMBER ${currentYear}`,
        `OCTOBER ${currentYear}`, `NOVEMBER ${currentYear}`, `DECEMBER ${currentYear}`
      ]
    }

    const monthYears = []
    let current = fromDate.clone().startOf('month')
    const end = toDate.clone().endOf('month')

    while (current.isBefore(end) || current.isSame(end, 'month')) {
      const monthYear = `${current.format('MMMM').toUpperCase()} ${current.format('YYYY')}`
      monthYears.push(monthYear)
      current = current.add(1, 'month')
    }

    return monthYears
  }

  // No date filter - show all months for current year
  const currentYear = dayjs().format('YYYY')
  return [
    `JANUARY ${currentYear}`, `FEBRUARY ${currentYear}`, `MARCH ${currentYear}`,
    `APRIL ${currentYear}`, `MAY ${currentYear}`, `JUNE ${currentYear}`,
    `JULY ${currentYear}`, `AUGUST ${currentYear}`, `SEPTEMBER ${currentYear}`,
    `OCTOBER ${currentYear}`, `NOVEMBER ${currentYear}`, `DECEMBER ${currentYear}`
  ]
})

// Computed: Partner options based on category
const partnerOptions = computed(() => {
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

// Computed: Show hospital bill column if category is HOSPITAL or no category filter
const showHospitalBill = computed(() => {
  return categoryValue.value === 'HOSPITAL' || categoryValue.value === null
})

// Computed: Get colspan for each month header
const getMonthColspan = (monthYear) => {
  let cols = 5 // GL NO., CLIENT'S NAME, DATE ISSUED, AMOUNT, ISSUED BY

  if (!categoryValue.value && !partnerValue.value) {
    cols += 1 // CATEGORY
  }

  if (!partnerValue.value) {
    cols += 1 // PARTNER
  }

  if (showHospitalBill.value) {
    cols += 1 // HOSPITAL BILL
  }

  return cols
}

// Computed: Total columns for empty state colspan
const totalColumns = computed(() => {
  return visibleMonths.value.length * getMonthColspan('JANUARY 2026')
})

// Watch category changes to reset partner
watch(categoryValue, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    partnerValue.value = null
  }
})

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

// Calculate age from birthdate
const calculateAge = (birthdate) => {
  if (!birthdate) return null
  const birth = dayjs(birthdate)
  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null
  const age = dayjs().diff(birth, 'year')
  return age
}

// Format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A'
  return '₱' + parseFloat(amount).toFixed(2)
}

// Format client name
const formatClientName = (clientData, patientName) => {
  if (!clientData || !clientData.firstname) {
    return 'SAME' // Same as patient
  }

  const parts = [
    clientData.lastname ? clientData.lastname + ',' : '',
    clientData.firstname,
    clientData.middlename,
    clientData.suffix
  ].filter(Boolean)

  return parts.join(' ')
}

// Process raw data into grouped structure
const processPatientData = (rawData) => {
  const patientMap = new Map()

  rawData.forEach(record => {
    const patientKey = record.patient_id

    if (!patientMap.has(patientKey)) {
      const name = [
        record.lastname ? record.lastname + ',' : '',
        record.firstname,
        record.middlename,
        record.suffix
      ].filter(Boolean).join(' ')

      const address = [
        record.house_address,
        record.barangay,
        record.city,
        record.province
      ].filter(Boolean).join(', ')

      patientMap.set(patientKey, {
        patientId: record.patient_id,
        glNum: record.gl_no,
        name: name,
        address: address,
        phoneNumber: record.phone_number,
        age: calculateAge(record.birthdate),
        sex: record.sex,
        preference: record.preference,
        barangay: record.barangay,
        category: record.category,
        partner: record.partner,
        monthlyRecords: {}
      })
    }

    // Add record to appropriate month WITH YEAR
    const recordDate = dayjs(record.date_issued)
    const year = recordDate.format('YYYY')
    const month = recordDate.format('MMMM').toUpperCase()
    const monthYear = `${month} ${year}`
    const patient = patientMap.get(patientKey)

    const patientName = patient.name

    if (!patient.monthlyRecords[monthYear] || recordDate.isAfter(dayjs(patient.monthlyRecords[monthYear].dateIssued))) {
      patient.monthlyRecords[monthYear] = {
        glNo: record.gl_no,
        category: record.category,
        partner: record.partner,
        clientName: formatClientName({
          lastname: record.client_lastname,
          firstname: record.client_firstname,
          middlename: record.client_middlename,
          suffix: record.client_suffix
        }, patientName),
        dateIssued: recordDate.format('YYYY-MM-DD'),
        hospitalBill: record.hospital_bill,
        issuedAmount: record.issued_amount,
        issuedBy: record.issued_by
      }
    }
  })

  return Array.from(patientMap.values())
}

// Computed: Filtered rows
const filteredRows = computed(() => {
  let filtered = allPatients.value

  if (categoryValue.value) {
    filtered = filtered.filter(patient => {
      return Object.values(patient.monthlyRecords).some(record => record.category === categoryValue.value)
    })
  }

  if (partnerValue.value) {
    filtered = filtered.filter(patient => {
      return Object.values(patient.monthlyRecords).some(record => record.partner === partnerValue.value)
    })
  }

  if (barangayValue.value) {
    filtered = filtered.filter(patient => patient.barangay === barangayValue.value)
  }

  return filtered
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
    } else {
      const currentYear = dayjs().format('YYYY')
      params.from = `01/01/${currentYear}`
      params.to = `31/12/${currentYear}`
    }

    const res = await axios.get('http://localhost:8000/api/general-summary-records', { params })
    allPatients.value = processPatientData(res.data)
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

// Clear filters
const onClearDate = () => {
  dateRange.value = null
}

const onClearCategory = () => {
  categoryValue.value = null
  partnerValue.value = null
}

const onClearPartner = () => {
  partnerValue.value = null
}

const onClearBarangay = () => {
  barangayValue.value = null
}

// Column resize functions
const startResize = (event, column) => {
  event.preventDefault()
  resizeState.value = {
    isResizing: true,
    column: column,
    startX: event.pageX,
    startWidth: columnWidths.value[column]
  }

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onResize = (event) => {
  if (!resizeState.value.isResizing) return

  const diff = event.pageX - resizeState.value.startX
  const newWidth = Math.max(150, resizeState.value.startWidth + diff)

  columnWidths.value[resizeState.value.column] = newWidth
}

const stopResize = () => {
  resizeState.value.isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Section resize functions
const startSectionResize = (event) => {
  event.preventDefault()
  sectionResizeState.value = {
    isResizing: true,
    startX: event.pageX,
    startLeftWidth: sectionWidths.value.left
  }

  document.addEventListener('mousemove', onSectionResize)
  document.addEventListener('mouseup', stopSectionResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onSectionResize = (event) => {
  if (!sectionResizeState.value.isResizing) return

  const container = document.querySelector('.table-container')
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width

  // Calculate the mouse position relative to the container
  const relativeX = event.pageX - containerRect.left

  // Calculate new percentage (with constraints)
  let newLeftPercent = (relativeX / containerWidth) * 100

  // Constrain between 20% and 80%
  newLeftPercent = Math.max(20, Math.min(80, newLeftPercent))

  sectionWidths.value.left = newLeftPercent
  sectionWidths.value.right = 100 - newLeftPercent
}

const stopSectionResize = () => {
  sectionResizeState.value.isResizing = false
  document.removeEventListener('mousemove', onSectionResize)
  document.removeEventListener('mouseup', stopSectionResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Download CSV function
const downloadCSV = () => {
  const rows = []

  if (categoryValue.value) {
    const categoryRow = [categoryValue.value]
    rows.push(categoryRow)
  }

  const monthHeaders = ['', '', '', '', '', '', '']
  visibleMonths.value.forEach(monthYear => {
    const colspan = getMonthColspan(monthYear)
    monthHeaders.push(monthYear)
    for (let i = 1; i < colspan; i++) {
      monthHeaders.push('')
    }
  })
  rows.push(monthHeaders)

  const columnHeaders = [
    'NO.',
    'PATIENT\'S NAME',
    'ADDRESS',
    'CONTACT NO.',
    'AGE',
    'SEX',
    'PREFERENCE'
  ]

  visibleMonths.value.forEach(monthYear => {
    columnHeaders.push('GL NO.')
    if (!categoryValue.value && !partnerValue.value) {
      columnHeaders.push('CATEGORY')
    }
    if (!partnerValue.value) {
      columnHeaders.push('PARTNER')
    }
    columnHeaders.push('CLIENT\'S NAME')
    columnHeaders.push('DATE ISSUED')
    if (showHospitalBill.value) {
      columnHeaders.push('HOSPITAL BILL')
    }
    columnHeaders.push('AMOUNT')
    columnHeaders.push('ISSUED BY')
  })

  rows.push(columnHeaders)

  filteredRows.value.forEach((row, index) => {
    const dataRow = [
      index + 1,
      row.name,
      row.address,
      row.phoneNumber ? `\t${row.phoneNumber}` : 'N/A',
      row.age !== null ? row.age : 'N/A',
      row.sex || 'N/A',
      row.preference || 'N/A'
    ]

    visibleMonths.value.forEach(monthYear => {
      const record = row.monthlyRecords[monthYear]
      if (record) {
        dataRow.push(record.glNo)
        if (!categoryValue.value && !partnerValue.value) {
          dataRow.push(record.category)
        }
        if (!partnerValue.value) {
          dataRow.push(record.partner)
        }
        dataRow.push(record.clientName)
        dataRow.push(`\t${record.dateIssued}`)
        if (showHospitalBill.value) {
          const hospitalBill = record.hospitalBill ? parseFloat(record.hospitalBill).toFixed(2) : '0.00'
          dataRow.push(`\t${hospitalBill}`)
        }
        const amount = record.issuedAmount ? parseFloat(record.issuedAmount).toFixed(2) : '0.00'
        dataRow.push(`\t${amount}`)
        dataRow.push(record.issuedBy)
      } else {
        dataRow.push('-')
        if (!categoryValue.value && !partnerValue.value) {
          dataRow.push('-')
        }
        if (!partnerValue.value) {
          dataRow.push('-')
        }
        dataRow.push('-')
        dataRow.push('-')
        if (showHospitalBill.value) {
          dataRow.push('-')
        }
        dataRow.push('-')
        dataRow.push('-')
      }
    })

    rows.push(dataRow)
  })

  const csvContent = '\uFEFF' + rows.map(row =>
    row.map(cell => {
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return '"' + cellStr.replace(/"/g, '""') + '"'
      }
      return cellStr
    }).join(',')
  ).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const today = dayjs().format('YYYY-MM-DD')
  let filename = `general-summary-${today}`

  if (categoryValue.value) {
    filename += `-${categoryValue.value.toLowerCase()}`
  }
  if (partnerValue.value) {
    filename += `-${partnerValue.value.toLowerCase().replace(/\s+/g, '-')}`
  }
  if (barangayValue.value) {
    filename += `-${barangayValue.value.toLowerCase().replace(/\s+/g, '-')}`
  }
  if (dateRange.value) {
    if (typeof dateRange.value === 'string') {
      filename += `-${dateRange.value.replace(/\//g, '-')}`
    } else if (dateRange.value.from && dateRange.value.to) {
      filename += `-${dateRange.value.from.replace(/\//g, '-')}_to_${dateRange.value.to.replace(/\//g, '-')}`
    }
  }

  filename += '.csv'

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.filter-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.table-container {
  width: 100%;
  margin-top: 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.scrollable-wrapper {
  display: flex;
  overflow: hidden;
  width: 100%;
  flex: 1;
  position: relative;
}

.left-section {
  flex-shrink: 0;
  overflow: auto;
  border-right: 2px solid #e0e0e0;
  position: relative;
  background: white;
}

.section-divider {
  width: 8px;
  background: #e0e0e0;
  cursor: col-resize;
  position: relative;
  flex-shrink: 0;
  z-index: 20;
  transition: background-color 0.2s;
}

.section-divider:hover {
  background: #1f8f2e;
}

.section-divider .divider-line {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 40px;
  background: white;
  border-radius: 1px;
}

.right-section {
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  background: white;
}

.horizontal-scroll {
  overflow: auto;
  height: 100%;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
  background: white;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  background-color: #1f8f2e;
  color: #ffffff;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  white-space: nowrap;
  font-size: 12px;
  letter-spacing: 0.01em;
}

.data-table td {
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  font-size: 12px;
}

.data-table tbody tr {
  background-color: white;
  transition: background-color 0.2s;
}

.data-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* Category header row */
.category-header-row th {
  height: auto !important;
  padding: 12px 16px !important;
}

.category-header {
  background-color: #ff9800 !important;
  font-size: 14px;
  font-weight: 700;
  color: white;
}

/* Month headers with different colors */
.month-headers th {
  font-size: 13px;
  font-weight: 700;
  padding: 10px 12px;
  color: white;
}

.month-january {
  background-color: #4CAF50 !important;
}

.month-february {
  background-color: #FF5722 !important;
}

.month-march {
  background-color: #9C27B0 !important;
}

.month-april {
  background-color: #2196F3 !important;
}

.month-may {
  background-color: #FFC107 !important;
  color: #333 !important;
}

.month-june {
  background-color: #795548 !important;
}

.month-july {
  background-color: #E91E63 !important;
}

.month-august {
  background-color: #00BCD4 !important;
}

.month-september {
  background-color: #FF9800 !important;
}

.month-october {
  background-color: #607D8B !important;
}

.month-november {
  background-color: #3F51B5 !important;
}

.month-december {
  background-color: #F44336 !important;
}

/* Sticky first column */
.sticky-col {
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 5;
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.08);
}

.data-table tbody tr:nth-child(even) .sticky-col {
  background-color: #fafafa;
}

.data-table tbody tr:hover .sticky-col {
  background-color: #f5f5f5;
}

/* Cell widths */
.resizable-col {
  position: relative;
}

.resizable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
  user-select: none;
  background: transparent;
  z-index: 10;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.resize-handle:active {
  background: rgba(255, 255, 255, 0.3);
}

.name-cell {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-cell {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Scrollbar styling */
.left-section::-webkit-scrollbar,
.horizontal-scroll::-webkit-scrollbar,
.right-section::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.left-section::-webkit-scrollbar-track,
.horizontal-scroll::-webkit-scrollbar-track,
.right-section::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.left-section::-webkit-scrollbar-thumb,
.horizontal-scroll::-webkit-scrollbar-thumb,
.right-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.left-section::-webkit-scrollbar-thumb:hover,
.horizontal-scroll::-webkit-scrollbar-thumb:hover,
.right-section::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.left-section::-webkit-scrollbar-corner,
.horizontal-scroll::-webkit-scrollbar-corner,
.right-section::-webkit-scrollbar-corner {
  background: transparent;
}

/* Loading and empty state styling */
.text-center {
  text-align: center;
}

.q-pa-lg {
  padding: 24px;
}

.text-grey-6 {
  color: rgba(0, 0, 0, 0.54);
}
</style>