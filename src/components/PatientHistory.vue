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

        <q-card-section>
          <div class="info-section q-mb-md">
            <div class="section-title">Transcation Details</div>
            
            <!-- VIEW MODE -->
            <div v-if="!editMode">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">GL Number:</span>
                  <span class="info-value">{{ selectedRecord?.glNum }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Category:</span>
                  <span class="info-value">{{ selectedRecord?.category }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Partner:</span>
                  <span class="info-value">{{ selectedRecord?.partner }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Issued By:</span>
                  <span class="info-value">{{ selectedRecord?.issuedBy }}</span>
                </div>
                
                <!-- MEDICINE & LABORATORY: Only show Issued Amount -->
                <div v-if="selectedRecord?.category === 'MEDICINE' || selectedRecord?.category === 'LABORATORY'" class="info-item">
                  <span class="info-label">Issued Amount:</span>
                  <span class="info-value">₱{{ selectedRecord?.issuedAmount }}</span>
                </div>
                
                <!-- HOSPITAL: Show both Hospital Bill and Issued Amount -->
                <template v-if="selectedRecord?.category === 'HOSPITAL'">
                  <div class="info-item">
                    <span class="info-label">Hospital Bill:</span>
                    <span class="info-value">{{ selectedRecord?.hospitalBill ? '₱' + selectedRecord.hospitalBill : 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Issued Amount:</span>
                    <span class="info-value">₱{{ selectedRecord?.issuedAmount }}</span>
                  </div>
                </template>

                <!-- Patient is same as client checkbox (view mode - disabled) -->
                <div class="info-item info-item-full">
                  <q-checkbox :model-value="!selectedRecord?.clientName" label="Patient is same as client?" class="form-checkbox" disable />
                </div>
              </div>

              <!-- Client Information Section - Only show if client exists -->
              <template v-if="selectedRecord?.clientName">
                <div class="section-title q-mt-md q-mb-sm">Client Information</div>
                <div class="info-grid">
                  <div class="info-item info-item-full">
                    <span class="info-label">Client Name:</span>
                    <span class="info-value">{{ selectedRecord?.clientName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Relationship:</span>
                    <span class="info-value">{{ selectedRecord?.relationship }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- EDIT MODE -->
            <div v-else>
              <div class="edit-grid">
                <div class="edit-item">
                  <label class="edit-label">GL Number:</label>
                  <q-input v-model="editData.glNum" dense outlined readonly class="edit-input" />
                </div>
                <div class="edit-item">
                  <label class="edit-label">Category:</label>
                  <q-select v-model="editData.category" :options="categoryOptions" dense outlined class="edit-input" @update:model-value="onCategoryChange" />
                </div>
                <div class="edit-item">
                  <label class="edit-label">Partner:</label>
                  <q-select v-model="editData.partner" :options="partnerOptions" dense outlined class="edit-input" />
                </div>
                <div class="edit-item">
                  <label class="edit-label">Issued By:</label>
                  <q-input v-model="editData.issuedBy" dense outlined readonly class="edit-input" />
                </div>
                
                <!-- MEDICINE & LABORATORY: Only show Issued Amount -->
                <div v-if="editData.category === 'MEDICINE' || editData.category === 'LABORATORY'" class="edit-item">
                  <label class="edit-label">Issued Amount:</label>
                  <q-input v-model="editData.issuedAmount" type="number" dense outlined class="edit-input" prefix="₱" />
                </div>
                
                <!-- HOSPITAL: Show both Hospital Bill and Issued Amount -->
                <template v-if="editData.category === 'HOSPITAL'">
                  <div class="edit-item">
                    <label class="edit-label">Hospital Bill:</label>
                    <q-input v-model="editData.hospitalBill" type="number" dense outlined class="edit-input" prefix="₱" />
                  </div>
                  <div class="edit-item">
                    <label class="edit-label">Issued Amount:</label>
                    <q-input v-model="editData.issuedAmount" type="number" dense outlined class="edit-input" prefix="₱" />
                  </div>
                </template>

                <!-- Patient is same as client checkbox -->
                <div class="edit-item edit-item-full">
                  <q-checkbox v-model="editData.isChecked" label="Patient is same as client?" class="form-checkbox" @update:model-value="onCheckboxChange" />
                </div>
              </div>

              <!-- Client Information Section - Only show if patient is NOT same as client -->
              <template v-if="!editData.isChecked">
                <div class="section-title q-mt-md q-mb-sm">Client Information</div>
                <div class="edit-grid">
                  <div class="edit-item edit-item-full">
                    <label class="edit-label">Client Name:</label>
                    <q-input v-model="editData.clientName" dense outlined class="edit-input" />
                  </div>
                  <div class="edit-item">
                    <label class="edit-label">Relationship:</label>
                    <q-input v-model="editData.relationship" dense outlined class="edit-input" />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <!-- VIEW MODE BUTTONS -->
          <template v-if="!editMode">
            <q-btn
  label="CLOSE"
  icon="close"
  unelevated
  class="dialog-close-btn"
  @click="showCloseConfirmDialog = true"
/>


            <q-btn label="EDIT" icon="edit" unelevated class="dialog-edit-btn" @click="enterEditMode" />
            <q-btn
  label="PRINT PDF"
  icon="print"
  unelevated
  class="dialog-print-btn"
  @click="showPrintConfirmDialog = true"
  :loading="pdfLoading"
/>
          </template>

          <!-- EDIT MODE BUTTONS -->
          <template v-else>
            <q-btn label="CANCEL" icon="close" unelevated class="dialog-close-btn" @click="cancelEdit" />
            <q-btn label="SAVE" icon="save" unelevated class="dialog-save-btn" @click="showSaveConfirmDialog = true" />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCloseConfirmDialog">
  <q-card style="min-width: 350px">
    <q-card-section>
      <div class="text-h6">Close Form?</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      Are you sure you want to close?
    </q-card-section>

    <q-card-actions align="right" class="q-px-md q-pb-md">
      <q-btn
        unelevated
        icon="close"
        label="NO"
        class="dialog-goback-btn"
        v-close-popup
      />
      <q-btn
        unelevated
        icon="check"
        label="YES"
        class="dialog-confirm-btn"
        @click="confirmClose"
      />
    </q-card-actions>
  </q-card>
</q-dialog>


<q-dialog v-model="showPrintConfirmDialog">
  <q-card style="min-width: 350px">
    <q-card-section>
      <div class="text-h6">Print PDF?</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      Do you want to generate and print this PDF?
    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        unelevated
        icon="close"
        label="NO"
        class="dialog-goback-btn"
        v-close-popup
      />
      <q-btn
        unelevated
        icon="print"
        label="YES"
        class="dialog-confirm-btn"
        @click="confirmPrint"
        :loading="pdfLoading"
      />
    </q-card-actions>
  </q-card>
</q-dialog>

    <!-- SAVE CONFIRMATION DIALOG -->
    <q-dialog v-model="showSaveConfirmDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save Changes?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to save these changes to GL Number {{ editData.glNum }}?
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-confirm-btn" @click="confirmSave" :loading="saveLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CANCEL EDIT CONFIRMATION DIALOG -->
    <q-dialog v-model="showCancelConfirmDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Cancel Editing?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to cancel? All unsaved changes will be lost.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-confirm-btn" @click="confirmCancel" />
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
const editMode = ref(false)
const saveLoading = ref(false)
const showSaveConfirmDialog = ref(false)
const showCancelConfirmDialog = ref(false)
const showCloseConfirmDialog = ref(false)
const showPrintConfirmDialog = ref(false)

const editData = ref({
  glNum: null,
  category: null,
  partner: null,
  issuedBy: null,
  issuedAmount: null,
  hospitalBill: null,
  clientName: null,
  relationship: null,
  isChecked: false
})

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']

const partnerOptions = computed(() => {
  if (editData.value.category === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (editData.value.category === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (editData.value.category === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

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

    // Reset edit mode
    editMode.value = false

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

const enterEditMode = () => {
  // Copy current data to edit data
  editData.value = {
    glNum: selectedRecord.value.glNum,
    category: selectedRecord.value.category,
    partner: selectedRecord.value.partner,
    issuedBy: selectedRecord.value.issuedBy,
    issuedAmount: selectedRecord.value.issuedAmount,
    hospitalBill: selectedRecord.value.hospitalBill,
    clientName: selectedRecord.value.clientName,
    relationship: selectedRecord.value.relationship,
    // If clientName is null/empty, patient is same as client
    isChecked: !selectedRecord.value.clientName
  }
  editMode.value = true
}

const confirmPrint = async () => {
  showPrintConfirmDialog.value = false
  await generatePDF()
}

const cancelEdit = () => {
  showCancelConfirmDialog.value = true
}

const confirmCancel = () => {
  showCancelConfirmDialog.value = false
  editMode.value = false
  editData.value = {
    glNum: null,
    category: null,
    partner: null,
    issuedBy: null,
    issuedAmount: null,
    hospitalBill: null,
    clientName: null,
    relationship: null,
    isChecked: false
  }
}

const closeDialog = () => {
  showDetailsDialog.value = false
  editMode.value = false
  selectedRecord.value = null
}

const onCategoryChange = () => {
  // Reset partner when category changes
  editData.value.partner = null
}

const onCheckboxChange = () => {
  // If checked (patient is same as client), clear client name and relationship
  if (editData.value.isChecked) {
    editData.value.clientName = null
    editData.value.relationship = null
  }
}
const confirmClose = () => {
  showCloseConfirmDialog.value = false
  showDetailsDialog.value = false
  editMode.value = false
  selectedRecord.value = null
}
const confirmSave = async () => {
  saveLoading.value = true
  try {
    // Prepare form data for update
    const formData = new FormData()
    formData.append('glNum', editData.value.glNum)
    formData.append('category', editData.value.category)
    formData.append('partner', editData.value.partner)
    formData.append('issued_amount', editData.value.issuedAmount)
    formData.append('hospital_bill', editData.value.hospitalBill || 0)
    formData.append('client_name', editData.value.clientName || '')
    formData.append('relationship', editData.value.relationship || '')
    formData.append('update_transaction_only', '1')

    await axios.post('http://localhost:8000/api/patient-details/update', formData)

    $q.notify({
      type: 'positive',
      message: 'Record updated successfully',
      position: 'top'
    })


    showSaveConfirmDialog.value = false

    // Refresh the data
    await viewDetails(editData.value.glNum)
    
    // Refresh the table
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

    editMode.value = false
  } catch (error) {
    console.error('Save error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update record',
      position: 'top'
    })
  } finally {
    saveLoading.value = false
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

.dialog-edit-btn {
  background: #ff9800 !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-save-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-goback-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-confirm-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

/* Edit Mode Styles */
.edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.edit-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edit-item-full {
  grid-column: 1 / -1;
}

.edit-label {
  font-weight: 600;
  color: #1f8f2e;
  font-size: 13px;
}

.edit-input :deep(.q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

.edit-input :deep(.q-field__control:before),
.edit-input :deep(.q-field__control:after) {
  display: none !important;
}

.edit-input :deep(.q-field__native),
.edit-input :deep(.q-field__input),
.edit-input :deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

.edit-input :deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

.edit-input :deep(input[readonly]),
.edit-input :deep(input:read-only) {
  color: #757575 !important;
}

.edit-input :deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

.edit-input :deep(.q-field--readonly .q-field__native),
.edit-input :deep(.q-field--readonly .q-field__input) {
  color: #757575 !important;
}

/* Checkbox Styles */
.form-checkbox :deep(.q-checkbox__bg) {
  border: 2px solid #000;
  border-radius: 2px;
}

.form-checkbox :deep(.q-checkbox__label) {
  font-weight: 600;
}

.form-checkbox :deep(.q-checkbox--disabled .q-checkbox__label) {
  color: #757575;
}

.form-checkbox :deep(.q-checkbox--disabled .q-checkbox__bg) {
  border-color: #757575;
}
</style>