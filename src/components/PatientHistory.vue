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
            <q-icon name="info" size="sm" class="q-mr-sm" />
            Confirm Patient Information
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
                    <strong>Patient ID:</strong> {{ selectedBrowserPatient.patient_id }} (unchanged)
                  </div>
                </template>

                <!-- Patient is same as client checkbox (view mode - disabled) -->
                <div class="info-item info-item-full">
                  <q-checkbox :model-value="!selectedRecord?.clientName" label="Patient is same as client?" class="form-checkbox" disable />
                </div>
              </div>

            <q-banner class="bg-blue-1 text-blue-9 q-mt-md">
              <template v-slot:avatar>
                <q-icon name="info" color="blue" />
              </template>
              Updating this patient will affect Patient ID {{ selectedBrowserPatient?.patient_id }} for all future records.
            </q-banner>
            </div>
          </div>

          <!-- Show just current info if no changes -->
          <div v-else-if="selectedBrowserPatient && !browserPatientEdited">
            <div class="patient-info-box">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-purple-8">
  <q-icon
    name="person"
    size="sm"
    color="purple-8"
    class="q-mr-xs"
  />
  Patient Information:
</div>


              <div class="info-grid">
                <div class="info-item">
                  <strong>Name:</strong>
                  {{ selectedBrowserPatient.lastname }}, {{ selectedBrowserPatient.firstname }}
                  <span v-if="selectedBrowserPatient.middlename"> {{ selectedBrowserPatient.middlename }}</span>
                  <span v-if="selectedBrowserPatient.suffix"> {{ selectedBrowserPatient.suffix }}</span>
                </div>
                <div class="info-item">
                  <strong>Patient ID:</strong> {{ selectedBrowserPatient.patient_id }}
                </div>
                <div class="info-item">
                  <strong>Birthdate:</strong> {{ selectedBrowserPatient.birthdate ?
                    formatDate(selectedBrowserPatient.birthdate) : 'N/A' }}
                </div>
                <div class="info-item">
                  <strong>Sex:</strong> {{ selectedBrowserPatient.sex || 'N/A' }}
                </div>
                <div class="info-item">
                  <strong>Preference:</strong> {{ selectedBrowserPatient.preference || 'N/A' }}
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

    <!-- CANCEL CONFIRMATION DIALOG -->
    <q-dialog v-model="showCancelDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Close Form?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to close? All unsaved changes will be lost.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-confirm-btn" @click="confirmSave" :loading="saveLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- EXISTING PATIENTS DIALOG (for new patients found during save) -->
    <q-dialog v-model="showExistingDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h6">
            <q-icon name="info" size="sm" class="q-mr-sm" />
            Existing Patients Found
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            One or more patients with the same name already exist in the system.
          </div>

          <q-banner class="bg-blue-1 text-blue-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="help_outline" color="blue" />
            </template>
            Please choose whether to link this record to an existing patient or create a new patient entry.
          </q-banner>

          <div class="text-subtitle2 text-weight-bold q-mb-sm">Existing Patient(s):</div>
          <q-list bordered separator class="q-mb-md">
            <q-item v-for="patient in existingPatients" :key="patient.patient_id" clickable
              @click="selectedExistingPatient = patient"
              :active="selectedExistingPatient && selectedExistingPatient.patient_id === patient.patient_id"
              active-class="bg-blue-1">
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ patient.lastname }}, {{ patient.firstname }}
                  <span v-if="patient.middlename"> {{ patient.middlename }}</span>
                  <span v-if="patient.suffix"> {{ patient.suffix }}</span>
                </q-item-label>
                <q-item-label caption>Patient ID: {{ patient.patient_id }}</q-item-label>
                <q-item-label caption v-if="patient.gl_numbers">
                  GL Numbers: {{ patient.gl_numbers }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon v-if="selectedExistingPatient && selectedExistingPatient.patient_id === patient.patient_id"
                  name="check_circle" color="blue" size="sm" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">Choose an Action:</div>
          <div class="options-grid">
            <!-- Option 1: Use Existing Patient -->
            <div class="option-card" @click="selectedAction = 'existing'"
              :class="{ 'option-selected': selectedAction === 'existing', 'option-disabled': !selectedExistingPatient }">
              <q-icon name="link" size="md" color="blue" />
              <div class="option-title">Use Existing Patient</div>
              <div class="option-description">
                Link this record to the selected patient above. This will add a new GL record under the same Patient ID.
                <span v-if="!selectedExistingPatient" class="text-red"> (Please select a patient first)</span>
              </div>
            </div>

            <!-- Option 2: Create New Patient -->
            <div class="option-card" @click="selectedAction = 'new'"
              :class="{ 'option-selected': selectedAction === 'new' }">
              <q-icon name="person_add" size="md" color="green" />
              <div class="option-title">Create New Patient</div>
              <div class="option-description">
                Create a completely new patient with a new Patient ID. Use this if this is actually a different person.
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md dialog-actions-sticky">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelExistingDialog" />
          <q-btn label="PROCEED" icon="check" unelevated class="dialog-confirm-btn"
            :disable="!selectedAction || (selectedAction === 'existing' && !selectedExistingPatient)"
            @click="proceedWithAction" :loading="actionLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, watch } from 'vue';
import { date, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { toWords } from 'number-to-words'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

const router = useRouter()
const $q = useQuasar()

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const options = [
  ['MALE', 'FEMALE'],
  ['N/A', 'Gay', 'Lesbian'],
  [
    "APOKON", "BINCUNGAN", "BUSAON", "CANOCOTAN", "CUAMBOGAN", "LA FILIPINA", "LIBOGANON", "MADAUM",
    "MAGDUM", "MAGUGPO EAST", "MAGUGPO NORTH", "MAGUGPO POBLACION", "MAGUGPO SOUTH", "MAGUGPO WEST",
    "MANKILAM", "NEW BALAMBAN", "NUEVA FUERZA", "PAGSABANGAN", "PANDAPAN", "SAN AGUSTIN", "SAN ISIDRO",
    "SAN MIGUEL (CAMP 4)", "VISAYAN VILLAGE"
  ]
]

const patientForm = ref(null);

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
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

const filteredSearchResults = computed(() => {
  const searchField = activeSearchField.value
  let searchValue = null

  if (searchField === 'lastname') searchValue = lastNameValue.value
  else if (searchField === 'firstname') searchValue = firstNameValue.value
  else if (searchField === 'middlename') searchValue = middleNameValue.value

  if (!searchValue || searchValue.trim().length < 2) {
    return []
  }

  const query = searchValue.toLowerCase().trim()

  return patientSearchResults.value
    .filter(patient => {
      const lastname = (patient.lastname || '').toLowerCase()
      const firstname = (patient.firstname || '').toLowerCase()
      const middlename = (patient.middlename || '').toLowerCase()

      // Match based on which field is active
      if (searchField === 'lastname') return lastname.startsWith(query)
      if (searchField === 'firstname') return firstname.startsWith(query)
      if (searchField === 'middlename') return middlename.startsWith(query)

      return false
    })
    .sort((a, b) => {
      // Sort eligible patients first
      if (a.eligible && !b.eligible) return -1
      if (!a.eligible && b.eligible) return 1
      // Then by days remaining if both ineligible
      if (!a.eligible && !b.eligible) {
        return (a.days_remaining || 0) - (b.days_remaining || 0)
      }
      // Then alphabetically by last name
      return a.lastname.localeCompare(b.lastname)
    })
})

const showCancelDialog = ref(false)
const showExistingDialog = ref(false)
const showEligibilityWarning = ref(false)
const showAreYouSureDialog = ref(false)
const actionLoading = ref(false)
const areYouSureLoading = ref(false)

const pendingAction = ref(null)

const existingPatients = ref([])
const selectedExistingPatient = ref(null)
const selectedAction = ref(null)
const eligibilityWarningData = ref(null)

// Helper functions for date formatting
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return dayjs(dateString).format('MMMM DD, YYYY')
}

const calculateDaysRemaining = (eligibilityDate) => {
  const today = dayjs()
  const eligible = dayjs(eligibilityDate)
  return eligible.diff(today, 'days')
}

const formatAddress = (patient) => {
  const parts = [
    patient.house_address,
    patient.barangay,
    patient.city,
    patient.province
  ].filter(Boolean)
  return parts.join(', ') || 'N/A'
}

const calculateAge = (birthdate) => {
  if (!birthdate) return null

  const parts = birthdate.split('/')
  if (parts.length !== 3) return null

  const birthDate = new Date(parts[2], parts[1] - 1, parts[0])
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

const calculateAgeFromDate = (dateString) => {
  if (!dateString) return null

  const birthDate = new Date(dateString)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// Convert DD/MM/YYYY to MySQL-safe YYYY-MM-DD format
const convertToMySQLDate = (dateString) => {
  if (!dateString) return null

  // Handle if already in YYYY-MM-DD format
  if (dateString.includes('-') && dateString.split('-').length === 3) {
    return dateString
  }

  const parts = dateString.split('/')
  if (parts.length !== 3) return null

  // parts[0] = day, parts[1] = month, parts[2] = year
  const day = parts[0].padStart(2, '0')
  const month = parts[1].padStart(2, '0')
  const year = parts[2]

  return `${year}-${month}-${day}`
}

// Convert MySQL YYYY-MM-DD to DD/MM/YYYY format
const convertFromMySQLDate = (dateString) => {
  if (!dateString) return null

  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

// Unified search handler
const handleNameSearch = (value) => {
  // Clear previous timer
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  // If less than 2 characters, hide dropdown
  if (!value || value.trim().length < 2) {
    showPatientDropdown.value = false
    patientSearchResults.value = []
    return
  }

  // Debounce the search
  searchDebounceTimer.value = setTimeout(async () => {
    await searchPatients(value)
  }, 300)
}

// Auto-search when last name changes
const onLastNameChange = (value) => {
  activeSearchField.value = 'lastname'
  handleNameSearch(value)
}

// Auto-search when first name changes
const onFirstNameChange = (value) => {
  activeSearchField.value = 'firstname'
  handleNameSearch(value)
  checkForPatientEdits()
}

// Auto-search when middle name changes
const onMiddleNameChange = (value) => {
  activeSearchField.value = 'middlename'
  handleNameSearch(value)
  checkForPatientEdits()
}

const onLastNameBlur = () => {
  // Delay hiding dropdown to allow click events to register
  setTimeout(() => {
    lastNameFocused.value = false
    // Only hide if user didn't click on a patient
    if (!usedBrowserPatient.value) {
      showPatientDropdown.value = false
    }
  }, 200)
}

const onFirstNameBlur = () => {
  setTimeout(() => {
    firstNameFocused.value = false
    if (!usedBrowserPatient.value) {
      showPatientDropdown.value = false
    }
  }, 200)
}

const onMiddleNameBlur = () => {
  setTimeout(() => {
    middleNameFocused.value = false
    if (!usedBrowserPatient.value) {
      showPatientDropdown.value = false
    }
  }, 200)
}

const searchPatients = async (query) => {
  if (!query || query.trim().length < 2) return

  searchingPatients.value = true

  try {
    const res = await axios.get('http://localhost:8000/api/patients/all-with-eligibility')
    patientSearchResults.value = res.data
    showPatientDropdown.value = true
  } catch (err) {
    console.error('Failed to fetch patients', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to search patients',
      position: 'top'
    })
  } finally {
    searchingPatients.value = false
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

const closeEligibilityWarning = () => {
  showEligibilityWarning.value = false
  eligibilityWarningData.value = null
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

const cancelFinalConfirm = () => {
  showFinalConfirmDialog.value = false
  pendingAction.value = null
}

const proceedWithFinalConfirm = () => {
  showFinalConfirmDialog.value = false
  showAreYouSureDialog.value = true
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
      type: 'negative',
      message: 'Operation failed',
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
      message: 'Please fill in all required fields',
      position: 'top'
    })
  }
}

const submitForm = async (shouldPrint, patientId = null, updatePatientInfo = false) => {
  dateToday.value = date.formatDate(new Date(), 'YYYY-MM-DD')

  const mysqlBirthdate = convertToMySQLDate(birthdateValue.value)

  if (!mysqlBirthdate) {
    $q.notify({
      type: 'negative',
      message: 'Invalid birthdate format',
      position: 'top'
    })
    return
  }

  const formData = new FormData()
  formData.append('category', categoryValue.value)
  formData.append('lastname', lastNameValue.value)
  formData.append('firstname', firstNameValue.value)
  formData.append('middlename', middleNameValue.value || '')
  formData.append('suffix', suffixValue.value || '')
  formData.append('birthdate', mysqlBirthdate)
  formData.append('sex', sexValue.value)
  formData.append('preference', preferenceValue.value || '')
  formData.append('is_checked', isChecked.value ? 1 : 0)
  formData.append('issued_at', dateToday.value)
  formData.append('province', provinceValue.value)
  formData.append('city', cityValue.value)
  formData.append('barangay', barangayValue.value)
  formData.append('house_address', houseAddressValue.value)
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', hospitalBillValue.value || 0)
  formData.append('issued_amount', issuedAmountValue.value)
  formData.append('issued_by', issuedByValue.value)
  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')

  if (patientId) {
    formData.append('patient_id', patientId)
    if (updatePatientInfo) {
      formData.append('update_patient_info', '1')
    }
  }

  try {
    const res = await axios.post('http://localhost:8000/api/patients', formData)
    glNum.value = res.data.gl_no

    $q.notify({
      type: 'positive',
      message: 'Patient record saved successfully',
      position: 'top'
    })

    if (shouldPrint) {
      await generatePDF()
    }

    router.push('/patient-records')
  } catch (err) {
    console.error("Failed to save patient:", err)
    $q.notify({
      type: 'negative',
      message: 'Failed to save patient record',
      position: 'top'
    })
  }
}

const formatPatientName = (patient) => {
  const parts = [
    patient.lastname,
    patient.firstname,
    patient.middlename,
    patient.suffix
  ].filter(Boolean)

  if (parts.length === 0) return 'N/A'

  // Format as: LASTNAME, FIRSTNAME MIDDLENAME SUFFIX
  const lastname = parts[0]
  const rest = parts.slice(1).join(' ')
  return `${lastname}, ${rest}`
}

const generatePDF = async () => {
  const pdfMap = {
    MEDICINE: '/med.pdf',
    LABORATORY: '/lab.pdf',
    HOSPITAL: '/hosp.pdf',
  }

  const pdfPath = pdfMap[categoryValue.value]
  const existingPdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer())
  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const amountWords = toWords(parseInt(issuedAmountValue.value)).toUpperCase() + ' PESOS'
  const page = pdfDoc.getPages()[0]
  page.setSize(page.getWidth(), 1200)
  page.translateContent(0, 605)
  const parsedDate = new Date(dateToday.value)
  const dayNum = parsedDate.getDate() + getDaySuffix(parsedDate.getDate())
  const monthName = parsedDate.toLocaleString('default', { month: 'long' })

  const fullNameValue =
    lastNameValue.value + ", " + firstNameValue.value +
    (middleNameValue.value ? " " + middleNameValue.value : "") +
    (suffixValue.value ? " " + suffixValue.value : "");

  const clientValue = ref(null);
  const fullAddressValue = houseAddressValue.value + ", " + barangayValue.value + ", " + cityValue.value + ", " + provinceValue.value

  if (isChecked.value == true) {
    clientValue.value = fullNameValue;
  } else {
    clientValue.value = clientLastNameValue.value + ", " + clientFirstNameValue.value +
      (clientMiddleNameValue.value ? " " + clientMiddleNameValue.value : "") +
      (clientSuffixValue.value ? " " + clientSuffixValue.value : "") + " / " + (relationshipValue.value ? " " + relationshipValue.value : "");
  }

  const age = calculateAge(birthdateValue.value)

  page.drawText(glNum.value + ' / ' + partnerValue.value, {
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
  page.drawText(String(age), {
    x: 400,
    y: 375,
    size: 12,
    color: rgb(0, 0, 0),
    font: boldFont,
  })
  page.drawText(sexValue.value.toUpperCase(), {
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
  page.drawText(clientValue.value.toUpperCase(), {
    x: 70,
    y: 300,
    size: 10,
    color: rgb(0, 0, 0),
    font: boldFont,
  })

  if (categoryValue.value == 'MEDICINE') {
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

  page.drawText(
    Number(issuedAmountValue.value).toFixed(2),
    {
      x: 90,
      y: 248,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    },
  )
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
  page.drawText(issuedByValue.value.toUpperCase(), {
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
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}
</script>

<style scoped>
/* All existing styles remain the same... */
/* =========================
   PAGE & CARD
========================= */

.page-wrapper {
  padding: 24px;
  background: #f5f5f5;
}

.form-card {
  margin: auto;
  background: #ffffff;
  border: 1px solid #989b98;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

/* =========================
   HEADER / TITLE
========================= */

.patient-info-pill {
  font-size: 40px;
  font-weight: 700;
  color: #1f8f2e;
  margin: 0;
  line-height: 0.5;
  margin-top: 15px;
}

/* =========================
   SECTION TITLES
========================= */

.section-title {
  margin: 30px 0 12px;
  font-weight: 600;
}

/* =========================
   CATEGORY
========================= */

div.category {
  margin-top: 30px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

label span {
  color: red;
}

/* =========================
   GRID LAYOUTS
========================= */

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 1px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 14px;
}

.row-1 {
  max-width: 300px;
  margin-bottom: 14px;
}

.field {
  position: relative;
  margin-bottom: 12px;
}

.field.full {
  grid-column: 1 / -1;
}

/* =========================
   PATIENT DROPDOWN (ALL NAME FIELDS)
========================= */

.patient-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #2196f3;
  border-radius: 4px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow: hidden;
}

.dropdown-header {
  background: #e3f2fd;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  border-bottom: 1px solid #bbdefb;
  display: flex;
  align-items: center;
}

.dropdown-patient-item {
  padding: 12px;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-patient-item:hover:not(.patient-ineligible) {
  background-color: #f5f5f5;
}

.dropdown-patient-item.patient-eligible {
  cursor: pointer;
}

.dropdown-patient-item.patient-ineligible {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #fafafa;
}

.patient-name-dropdown {
  font-size: 14px;
  font-weight: 600;
  color: #1f8f2e;
  margin-bottom: 4px;
}

.patient-details-dropdown {
  font-size: 11px;
  color: #666;
}

.detail-row-dropdown {
  display: flex;
  gap: 12px;
  margin-bottom: 2px;
}

.detail-row-dropdown span {
  color: #666;
}

.eligibility-badge-container-dropdown {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.eligibility-badge-dropdown {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.eligibility-info-dropdown {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 9px;
  color: #666;
  margin-top: 2px;
}

/* =========================
   PATIENT INFO BOX
========================= */

.patient-info-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.patient-info-box.highlight-changes {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

.comparison-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comparison-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  font-size: 13px;
  color: #333;
}

.required {
  color: red;
}

.info-item strong {
  color: #1f8f2e;
}

.info-item-full {
  grid-column: 1 / -1;
}

/* =========================
   INPUTS & SELECTS
========================= */

:deep(.q-field--outlined .q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

:deep(.q-field__control:before),
:deep(.q-field__control:after) {
  display: none !important;
}

:deep(.q-field__native),
:deep(.q-field__input),
:deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

:deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

:deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

:deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
  color: #9e9e9e;
}

:deep(.q-checkbox) {
  margin-top: -20px;
}

/* =========================
   ACTION BUTTONS
========================= */

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 24px;
}

.actions .q-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  color: white;
}

.btn-cancel {
  background: #ff3b3b;
}

.btn-save {
  background: #0aa64f;
}

.btn-print {
  background: #0aa64f;
}

.actions .q-btn .q-icon {
  margin-right: 6px;
}

/* =========================
   DIALOG BUTTONS
========================= */

.dialog-confirm-btn {
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

.dialog-confirm-btn .q-icon,
.dialog-goback-btn .q-icon {
  margin-right: 6px;
}

.dialog-actions-sticky {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  z-index: 10;
}

/* =========================
   EXISTING PATIENTS DIALOG
========================= */

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.option-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-card:hover {
  border-color: #0aa64f;
  background-color: #f5f5f5;
}

.option-selected {
  border-color: #0aa64f;
  background-color: #e8f5e9;
  border-width: 3px;
}

.option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-disabled:hover {
  border-color: #e0e0e0;
  background-color: transparent;
}

.option-title {
  font-weight: 700;
  font-size: 16px;
  color: #1f8f2e;
}

.option-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}
</style>