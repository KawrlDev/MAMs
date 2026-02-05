<template>
  <div class="budget-table">
    <q-table :rows="rows" :columns="columns" row-key="glNum">
      <!-- TOP BAR -->
      <template #top>
        <div class="row items-center full-width">
          <div class="text-h4 text-weight-bold text-green">
            Patient's History
          </div>
          <q-space />
        </div>
      </template>

      <!-- ELIGIBILITY DATE -->
      <template #body-cell-eligibilityDate="props">
        <q-td :class="props.row.eligibilityClass">
          {{ props.row.eligibilityDate }}

          <q-tooltip anchor="top middle" self="bottom middle" class="text-subtitle2 q-pa-xs" disable-reposition>
            <span v-if="props.row.daysRemaining > 0">
              Eligible in {{ props.row.daysRemaining }} day<span v-if="props.row.daysRemaining > 1">s</span>
            </span>
            <span v-else>
              Eligible
            </span>
          </q-tooltip>
        </q-td>
      </template>

      <!-- ACTION COLUMN -->
      <template #body-cell-action="props">
  <q-td class="action-cell">
    <q-btn
      icon="visibility"
      color="primary"
      flat
      round
      dense
      @click="viewDetails(props.row.glNum)"
    >
      <q-tooltip>View Details</q-tooltip>
    </q-btn>
  </q-td>
</template>

    </q-table>

    <!-- DETAILS DIALOG -->
    <q-dialog v-model="showDetailsDialog" persistent>
      <q-card style="min-width: 650px; max-width: 750px;">
        <q-card-section class="bg-orange-6 text-white q-pa-md">
          <div class="text-h6">
            <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
            Record Details - GL No: {{ selectedRecord?.glNum }}
          </div>
        </q-card-section>

        <q-card-section v-if="selectedRecord" class="q-pa-md">
          <!-- Transaction Details -->
          <div class="info-section q-mb-md">
            <div class="section-title">Transaction Details:</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Partner:</span>
                <span class="info-value">{{ selectedRecord.partner }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Issued By:</span>
                <span class="info-value">{{ selectedRecord.issuedBy }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Issued Amount:</span>
                <span class="info-value">₱{{ Number(selectedRecord.issuedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
              </div>
              <div class="info-item" v-if="selectedRecord.category === 'HOSPITAL' && selectedRecord.hospitalBill">
                <span class="info-label">Hospital Bill:</span>
                <span class="info-value">₱{{ Number(selectedRecord.hospitalBill).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
              </div>
            </div>
          </div>

          <!-- Client Details -->
          <div class="info-section">
            <div class="section-title">Client Information:</div>
            <div class="info-grid">
              <div v-if="selectedRecord.clientName" class="info-item">
                <span class="info-label">Name:</span>
                <span class="info-value">{{ selectedRecord.clientName }}</span>
              </div>
              <div v-if="selectedRecord.clientName" class="info-item">
                <span class="info-label">Relationship:</span>
                <span class="info-value">{{ selectedRecord.relationship }}</span>
              </div>
              <div v-else class="info-item-full">
                <span class="text-grey-7 text-italic">Patient is same as client</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CLOSE" icon="close" unelevated class="dialog-close-btn" @click="showDetailsDialog = false" />
          <q-btn label="PRINT PDF" icon="picture_as_pdf" unelevated class="dialog-print-btn" @click="generatePDF" :loading="pdfLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { toWords } from 'number-to-words'
import { useQuasar } from 'quasar'

dayjs.extend(isSameOrAfter)

const route = useRoute()
const $q = useQuasar()
const glNum = computed(() => route.params.glNum)

const rows = ref([])
const showDetailsDialog = ref(false)
const selectedRecord = ref(null)
const pdfLoading = ref(false)

const columns = [
  { name: 'GL No.', label: 'GL No.', field: 'glNum', align: 'right' },
  { name: 'Category', label: 'Category', field: 'category' },
  { name: 'Issued At', label: 'Date Issued', field: 'issuedAt' },
  { name: 'eligibilityDate', label: 'Eligibility Date', field: 'eligibilityDate' },
  { name: 'Issued By', label: 'Issued By', field: 'issuedBy' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const calculateAge = (birthdate) => {
  if (!birthdate) return null
  const birth = dayjs(birthdate)
  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null
  return dayjs().diff(birth, 'year')
}

const viewDetails = async (glNumber) => {
  try {
    const res = await axios.get(`http://localhost:8000/api/patient-details/${glNumber}`)
    const data = res.data

    // Format client name if exists
    let clientName = null
    if (data.client_lastname) {
      clientName = `${data.client_lastname}, ${data.client_firstname}` +
        (data.client_middlename ? ` ${data.client_middlename}` : '') +
        (data.client_suffix ? ` ${data.client_suffix}` : '')
    }

    selectedRecord.value = {
      glNum: glNumber,
      category: data.category,
      partner: data.partner,
      issuedBy: data.issued_by,
      issuedAmount: data.issued_amount,
      hospitalBill: data.hospital_bill,
      clientName: clientName,
      relationship: data.relationship,
      // Store raw data for PDF generation
      rawData: data
    }

    showDetailsDialog.value = true
  } catch (err) {
    console.error('Error fetching details:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load record details',
      position: 'top'
    })
  }
}

const generatePDF = async () => {
  if (!selectedRecord.value) return

  pdfLoading.value = true

  try {
    const data = selectedRecord.value.rawData

    const pdfMap = {
      MEDICINE: '/med.pdf',
      LABORATORY: '/lab.pdf',
      HOSPITAL: '/hosp.pdf',
    }

    const pdfPath = pdfMap[data.category]
    const existingPdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const amountWords = toWords(parseInt(data.issued_amount)).toUpperCase() + ' PESOS'
    const page = pdfDoc.getPages()[0]
    page.setSize(page.getWidth(), 1200)
    page.translateContent(0, 605)

    const parsedDate = new Date(data.date_issued)
    const dayNum = parsedDate.getDate() + getDaySuffix(parsedDate.getDate())
    const monthName = parsedDate.toLocaleString('default', { month: 'long' })

    const fullNameValue = data.patient_lastname + ", " + data.patient_firstname +
      (data.patient_middlename ? " " + data.patient_middlename : "") +
      (data.patient_suffix ? " " + data.patient_suffix : "")

    let clientValue = fullNameValue
    if (data.client_lastname) {
      clientValue = data.client_lastname + ", " + data.client_firstname +
        (data.client_middlename ? " " + data.client_middlename : "") +
        (data.client_suffix ? " " + data.client_suffix : "") +
        " / " + (data.relationship ? " " + data.relationship : "")
    }

    const fullAddressValue = data.house_address + ", " + data.barangay + ", " + data.city + ", " + data.province
    const age = calculateAge(data.birthdate)

    page.drawText(data.gl_no + ' / ' + data.partner, {
      x: 600,
      y: 489,
      size: 14,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
    page.drawText(fullNameValue.toUpperCase(), {
      x: 140,
      y: 375,
      size: 10,
      color: rgb(0, 0, 0),
      font: boldFont,
    })

    if (age !== null) {
      page.drawText(String(age), {
        x: 400,
        y: 375,
        size: 12,
        color: rgb(0, 0, 0),
        font: boldFont,
      })
    }

    page.drawText(data.sex.toUpperCase(), {
      x: 455,
      y: 375,
      size: 10,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
    page.drawText(fullAddressValue.toUpperCase(), {
      x: 95,
      y: 350,
      size: 10,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
    page.drawText(clientValue.toUpperCase(), {
      x: 70,
      y: 300,
      size: 10,
      color: rgb(0, 0, 0),
      font: boldFont,
    })

    if (data.category == 'MEDICINE') {
      page.drawText(amountWords, {
        x: 245,
        y: 273,
        size: 10,
        color: rgb(0, 0, 0),
        font: boldFont,
      })
    } else {
      page.drawText(amountWords, {
        x: 260,
        y: 273,
        size: 10,
        color: rgb(0, 0, 0),
        font: boldFont,
      })
    }

    page.drawText(Number(data.issued_amount).toFixed(2), {
      x: 90,
      y: 248,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
    page.drawText(dayNum, {
      x: 137,
      y: 197,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
    page.drawText(monthName.toUpperCase(), {
      x: 225,
      y: 197,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
    page.drawText(data.issued_by.toUpperCase(), {
      x: 340,
      y: 65,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    })

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    window.open(url)

    $q.notify({
      type: 'positive',
      message: 'PDF generated successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to generate PDF',
      position: 'top'
    })
  } finally {
    pdfLoading.value = false
  }
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

onMounted(() => {
  const getPatientHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/patient-history/${glNum.value}`)
      const today = dayjs().startOf('day')
      rows.value = res.data.history.map(item => {
        const eligibilityDate = dayjs(item.date_issued).add(3, 'month')
        const diff = eligibilityDate.diff(today, 'day')
        const isEligible = diff <= 0

        return {
          glNum: item.gl_no,
          category: item.category,
          issuedAt: item.date_issued,
          eligibilityDate: eligibilityDate.format('YYYY-MM-DD'),
          eligibilityClass: isEligible ? 'text-positive' : 'text-negative',
          daysRemaining: diff > 0 ? diff : 0,
          issuedBy: item.issued_by
        }
      })
    } catch (err) {
      console.log(err)
    }
  }
  getPatientHistory()
})
</script>

<style scoped>
.cancel-btn {
  background: #ff3b3b;
  color: white;
  font-weight: bold;
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

.budget-table :deep(.q-table__title) {
  font-size: 40px;
  font-weight: 600;
  color: #1f8f2e;
}

.budget-table :deep(td) {
  vertical-align: middle;
}

.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dialog Styling */
.info-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item-full {
  grid-column: 1 / -1;
  padding: 8px 0;
}

.info-label {
  font-weight: 600;
  color: #1f8f2e;
  font-size: 13px;
}

.info-value {
  color: #333;
  font-size: 14px;
}

.dialog-close-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-print-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}
.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>