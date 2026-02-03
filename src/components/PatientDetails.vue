<template>
  <div class="q-pa-md">
    <q-form ref="patientForm">
      <!-- HEADER ROW -->
      <div class="fieldset-header">
        <div class="fieldset-title">Patient's Info.</div>

        <div class="actions">
          <!-- View Mode Buttons -->
          <template v-if="!edit">
            <q-btn label="DELETE" icon="delete" class="action-btn delete-btn" @click="showDeleteDialog = true" dense />
            <q-btn label="EDIT" icon="edit" class="action-btn edit-btn" dense @click="edit = true" />
            <q-btn icon="picture_as_pdf" class="action-btn pdf-btn" dense round @click="generatePDF" />
          </template>

          <!-- Edit Mode Buttons -->
          <template v-if="edit">
            <q-btn label="Cancel" icon="close" class="action-btn cancel-btn" @click="showCancelDialog = true" dense />
            <q-btn label="Save" icon="save" class="action-btn save-btn" @click="handleSaveClick" dense />
          </template>
        </div>
      </div>

      <div class="patient-ids">
        <h6>Patient ID: {{ patientIDValue }}</h6>
        <h6>GL Number: {{ glNum }}</h6>
      </div>

      <!-- ================= PATIENT DETAILS ================= -->
      <div class="row q-col-gutter-md">

        <div class="col-12">
          <label class="form-label">Category <span class="required">*</span></label>
          <q-select v-model="categoryValue" :options="categoryOptions" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :disable="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-6">
          <label class="form-label">Last Name <span class="required">*</span></label>
          <q-input v-model="lastNameValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-6">
          <label class="form-label">First Name <span class="required">*</span></label>
          <q-input v-model="firstNameValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-6">
          <label class="form-label">Middle Name</label>
          <q-input v-model="middleNameValue" dense outlined class="flat-input" :readonly="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-6">
          <label class="form-label">Suffix</label>
          <q-input v-model="suffixValue" dense outlined class="flat-input" :readonly="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-12">
          <q-checkbox v-model="isChecked" label="Patient is same as client?" class="form-checkbox" :disable="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-3">
          <label class="form-label">Birthdate <span class="required">*</span></label>
          <q-input v-model="birthdateValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit" placeholder="DD/MM/YYYY"
            @update:model-value="checkForChanges">
            <template #append v-if="edit">
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="birthdateValue" mask="DD/MM/YYYY" emit-immediately>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-3">
          <label class="form-label">Age </label>
          <q-input v-model="ageValue" dense outlined placeholder="Auto-calculated" class="flat-input" readonly />
        </div>

        <div class="col-3">
          <label class="form-label">Sex <span class="required">*</span></label>
          <q-select v-model="sexValue" :options="options[0]" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :disable="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-3">
          <label class="form-label">Preference</label>
          <q-select v-model="preferenceValue" :options="options[1]" dense outlined class="flat-input" :disable="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-4">
          <label class="form-label">Province</label>
          <q-input v-model="provinceValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined
            class="flat-input" readonly />
        </div>

        <div class="col-4">
          <label class="form-label">City</label>
          <q-input v-model="cityValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined
            class="flat-input" readonly />
        </div>

        <div class="col-4">
          <label class="form-label">Barangay <span class="required">*</span></label>
          <q-select v-model="barangayValue" :options="options[2]" :rules="[val => !!val || 'This field is required']"
            dense outlined class="flat-input" :disable="!edit" @update:model-value="checkForChanges" />
        </div>

        <div class="col-12">
          <label class="form-label">House Address <span class="required">*</span></label>
          <q-input v-model="houseAddressValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit"
            @update:model-value="checkForChanges" />
        </div>
      </div>

      <q-separator color="grey-5" size="2px" class="q-my-lg" />
      <h4 class="q-mb-md">Transaction Details</h4>
      <!-- ================= ISSUANCE ================= -->
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <label class="form-label">Partner <span class="required">*</span></label>
          <q-select v-model="partnerValue" :options="partnerOptions" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :disable="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-6">
          <label class="form-label">Issued By</label>
          <q-input v-model="issuedByValue" dense outlined class="flat-input" :hint="'Cannot be edited!'"
            :persistent-hint="true" readonly />
        </div>

        <div class="col-6" v-if="categoryValue === 'HOSPITAL'">
          <label class="form-label">Hospital Bill <span class="required">*</span></label>
          <q-input v-model="hospitalBillValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit"
            @update:model-value="checkForChanges" />
        </div>

        <div class="col-6">
          <label class="form-label">Issued Amount <span class="required">*</span></label>
          <q-input v-model="issuedAmountValue" dense outlined type="number" class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit"
            @update:model-value="checkForChanges" />
        </div>
      </div>

      <!-- ================= CLIENT INFO ================= -->
      <div v-if="!isChecked" class="q-mt-lg">
        <q-separator color="grey-5" size="2px" class="q-my-lg" />
        <h4 class="q-mb-md">Client's Name</h4>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <label class="form-label">Last Name <span class="required">*</span></label>
            <q-input v-model="clientLastNameValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">First Name <span class="required">*</span></label>
            <q-input v-model="clientFirstNameValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">Middle Name</label>
            <q-input v-model="clientMiddleNameValue" dense outlined class="flat-input" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">Suffix</label>
            <q-input v-model="clientSuffixValue" dense outlined class="flat-input" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-12">
            <label class="form-label">Relationship to Patient <span class="required">*</span></label>
            <q-input v-model="relationshipValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>
        </div>
      </div>
    </q-form>

    <!-- DELETE CONFIRMATION DIALOG -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Delete Patient Record?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete this patient record? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleDelete"
            :loading="deleteLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CANCEL CONFIRMATION DIALOG -->
    <q-dialog v-model="showCancelDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Cancel Editing?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to cancel? All unsaved changes will be lost.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleCancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- PATIENT EDIT CONFIRMATION DIALOG (when patient info is edited) -->
    <q-dialog v-model="showPatientEditDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-h6">
            <q-icon name="edit" size="sm" class="q-mr-sm" />
            Patient Information Changed
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            You have modified the patient information.
          </div>

          <q-banner class="bg-orange-1 text-orange-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="orange" />
            </template>
            Please choose whether to update the existing patient's information or create a new patient.
          </q-banner>

          <!-- Show original patient info -->
          <div class="patient-info-box q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Original Patient Information:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Name:</strong>
                {{ originalPatientData.lastname }}, {{ originalPatientData.firstname }}
                <span v-if="originalPatientData.middlename"> {{ originalPatientData.middlename }}</span>
                <span v-if="originalPatientData.suffix"> {{ originalPatientData.suffix }}</span>
              </div>
              <div class="info-item">
                <strong>Patient ID:</strong> {{ originalPatientData.patient_id }}
              </div>
              <div class="info-item">
                <strong>Birthdate:</strong> {{ originalPatientData.birthdate }}
              </div>
              <div class="info-item">
                <strong>Sex:</strong> {{ originalPatientData.sex || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Preference:</strong> {{ originalPatientData.preference || 'N/A' }}
              </div>
              <div class="info-item info-item-full">
                <strong>Address:</strong> {{ originalPatientData.house_address }}, {{ originalPatientData.barangay }},
                {{ originalPatientData.city }}, {{ originalPatientData.province }}
              </div>
            </div>
          </div>

          <!-- Show current form values -->
          <div class="patient-info-box">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Current Form Values:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Name:</strong>
                {{ lastNameValue }}, {{ firstNameValue }}
                <span v-if="middleNameValue"> {{ middleNameValue }}</span>
                <span v-if="suffixValue"> {{ suffixValue }}</span>
              </div>
              <div class="info-item">
                <strong>Birthdate:</strong> {{ birthdateValue || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Sex:</strong> {{ sexValue || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Preference:</strong> {{ preferenceValue || 'N/A' }}
              </div>
              <div class="info-item info-item-full">
                <strong>Address:</strong> {{ houseAddressValue }}, {{ barangayValue }}, {{ cityValue }}, {{
                  provinceValue }}
              </div>
            </div>
          </div>

          <div class="options-grid q-mt-md">
            <!-- Option 1: Update Existing Patient -->
            <div class="option-card" @click="editDialogAction = 'update'"
              :class="{ 'option-selected': editDialogAction === 'update' }">
              <q-icon name="update" size="md" color="blue" />
              <div class="option-title">Update Patient Information</div>
              <div class="option-description">
                Update Patient ID {{ originalPatientData.patient_id }} with the new information.
                This will affect ALL future records for this patient.
              </div>
            </div>

            <!-- Option 2: Create New Patient -->
            <div class="option-card" @click="editDialogAction = 'new'"
              :class="{ 'option-selected': editDialogAction === 'new' }">
              <q-icon name="person_add" size="md" color="green" />
              <div class="option-title">Create New Patient</div>
              <div class="option-description">
                Create a completely new patient with the modified information.
                The original patient record will remain unchanged.
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelPatientEdit" />
          <q-btn label="PROCEED" icon="check" unelevated class="dialog-cancel-btn" :disable="!editDialogAction"
            @click="proceedWithEdit" :loading="editActionLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- TRANSACTION/CLIENT DETAILS EDIT CONFIRMATION DIALOG -->
    <q-dialog v-model="showTransactionEditDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h6">
            <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
            Transaction/Client Details Changed
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            You have modified the transaction or client details for this record.
          </div>

          <q-banner class="bg-blue-1 text-blue-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue" />
            </template>
            These changes will only affect this specific GL Number record ({{ glNum }}).
          </q-banner>

          <!-- Show changed fields -->
          <div class="patient-info-box q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Changed Fields:</div>
            <div class="changes-list">
              <div v-if="partnerValue !== originalPatientData.partner" class="change-item">
                <strong>Partner:</strong>
                <span class="old-value">{{ originalPatientData.partner }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ partnerValue }}</span>
              </div>
              <div v-if="hospitalBillValue !== originalPatientData.hospital_bill" class="change-item">
                <strong>Hospital Bill:</strong>
                <span class="old-value">{{ originalPatientData.hospital_bill || 'N/A' }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ hospitalBillValue }}</span>
              </div>
              <div v-if="issuedAmountValue !== originalPatientData.issued_amount" class="change-item">
                <strong>Issued Amount:</strong>
                <span class="old-value">{{ originalPatientData.issued_amount }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ issuedAmountValue }}</span>
              </div>
              <div v-if="clientLastNameValue !== originalPatientData.client_lastname" class="change-item">
                <strong>Client Last Name:</strong>
                <span class="old-value">{{ originalPatientData.client_lastname || 'N/A' }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ clientLastNameValue || 'N/A' }}</span>
              </div>
              <div v-if="clientFirstNameValue !== originalPatientData.client_firstname" class="change-item">
                <strong>Client First Name:</strong>
                <span class="old-value">{{ originalPatientData.client_firstname || 'N/A' }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ clientFirstNameValue || 'N/A' }}</span>
              </div>
              <div v-if="(clientMiddleNameValue || null) !== (originalPatientData.client_middlename || null)"
                class="change-item">
                <strong>Client Middle Name:</strong>
                <span class="old-value">{{ originalPatientData.client_middlename || 'N/A' }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ clientMiddleNameValue || 'N/A' }}</span>
              </div>
              <div v-if="(clientSuffixValue || null) !== (originalPatientData.client_suffix || null)"
                class="change-item">
                <strong>Client Suffix:</strong>
                <span class="old-value">{{ originalPatientData.client_suffix || 'N/A' }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ clientSuffixValue || 'N/A' }}</span>
              </div>
              <div v-if="(relationshipValue || null) !== (originalPatientData.relationship || null)"
                class="change-item">
                <strong>Relationship:</strong>
                <span class="old-value">{{ originalPatientData.relationship || 'N/A' }}</span>
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <span class="new-value">{{ relationshipValue || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <q-banner class="bg-grey-2 text-grey-8">
            <template v-slot:avatar>
              <q-icon name="check_circle" color="green" />
            </template>
            Click "CONFIRM" to save these changes to GL Number {{ glNum }}.
          </q-banner>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelTransactionEdit" />
          <q-btn label="CONFIRM" icon="check" unelevated class="dialog-cancel-btn" @click="proceedWithTransactionUpdate"
            :loading="editActionLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { toWords } from 'number-to-words'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const glNum = computed(() => route.params.glNum)

const edit = ref(false)
const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const options = [['MALE', 'FEMALE'], ['N/A', 'Gay', 'Lesbian'], ["APOKON",
  "BINCUNGAN",
  "BUSAON",
  "CANOCOTAN",
  "CUAMBOGAN",
  "LA FILIPINA",
  "LIBOGANON",
  "MADAUM",
  "MAGDUM",
  "MAGUGPO EAST",
  "MAGUGPO NORTH",
  "MAGUGPO POBLACION",
  "MAGUGPO SOUTH",
  "MAGUGPO WEST",
  "MANKILAM",
  "NEW BALAMBAN",
  "NUEVA FUERZA",
  "PAGSABANGAN",
  "PANDAPAN",
  "SAN AGUSTIN",
  "SAN ISIDRO",
  "SAN MIGUEL (CAMP 4)",
  "VISAYAN VILLAGE"]]
const patientForm = ref(null);
const patientIDValue = ref(null)
const categoryValue = ref(null)
const lastNameValue = ref(null)
const firstNameValue = ref(null)
const middleNameValue = ref(null)
const suffixValue = ref(null)
const birthdateValue = ref(null)
const sexValue = ref(null)
const preferenceValue = ref(null)
const isChecked = ref(false);
const provinceValue = ref('Davao del Norte')
const cityValue = ref("Tagum City")
const barangayValue = ref(null)
const houseAddressValue = ref(null)
const partnerValue = ref(null)
const hospitalBillValue = ref(null)
const issuedAmountValue = ref(null)
const issuedByValue = ref(null)
const clientLastNameValue = ref(null)
const clientFirstNameValue = ref(null)
const clientMiddleNameValue = ref(null)
const clientSuffixValue = ref(null)
const relationshipValue = ref(null)
const dateToday = ref(null)

const showDeleteDialog = ref(false)
const showCancelDialog = ref(false)
const showPatientEditDialog = ref(false)
const showTransactionEditDialog = ref(false)
const deleteLoading = ref(false)
const editActionLoading = ref(false)
const editDialogAction = ref(null)
const hasPatientChanges = ref(false)
const hasTransactionChanges = ref(false)

const originalPatientData = ref({
  lastname: null,
  firstname: null,
  middlename: null,
  suffix: null,
  patient_id: null,
  birthdate: null,
  sex: null,
  preference: null,
  barangay: null,
  house_address: null,
  province: null,
  city: null,
  category: null,
  partner: null,
  hospital_bill: null,
  issued_amount: null,
  is_checked: null,
  client_lastname: null,
  client_firstname: null,
  client_middlename: null,
  client_suffix: null,
  relationship: null
})

const partnerOptions = computed(() => {
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

// Convert DD/MM/YYYY to MySQL-safe YYYY-MM-DD format
const convertToMySQLDate = (dateString) => {
  if (!dateString) return null

  const parts = dateString.split('/')
  if (parts.length !== 3) return null

  // parts[0] = day, parts[1] = month, parts[2] = year
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
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

watch(categoryValue, () => {
  partnerValue.value = null
})

// Check for patient information changes
const checkPatientChanges = () => {
  if (!edit.value) return false

  return lastNameValue.value !== originalPatientData.value.lastname ||
    firstNameValue.value !== originalPatientData.value.firstname ||
    (middleNameValue.value || null) !== (originalPatientData.value.middlename || null) ||
    (suffixValue.value || null) !== (originalPatientData.value.suffix || null) ||
    birthdateValue.value !== originalPatientData.value.birthdate ||
    sexValue.value !== originalPatientData.value.sex ||
    (preferenceValue.value || null) !== (originalPatientData.value.preference || null) ||
    barangayValue.value !== originalPatientData.value.barangay ||
    houseAddressValue.value !== originalPatientData.value.house_address
}

// Check for transaction/client details changes
const checkTransactionChanges = () => {
  if (!edit.value) return false

  return categoryValue.value !== originalPatientData.value.category ||
    partnerValue.value !== originalPatientData.value.partner ||
    (hospitalBillValue.value || 0) !== (originalPatientData.value.hospital_bill || 0) ||
    issuedAmountValue.value !== originalPatientData.value.issued_amount ||
    isChecked.value !== originalPatientData.value.is_checked ||
    (clientLastNameValue.value || null) !== (originalPatientData.value.client_lastname || null) ||
    (clientFirstNameValue.value || null) !== (originalPatientData.value.client_firstname || null) ||
    (clientMiddleNameValue.value || null) !== (originalPatientData.value.client_middlename || null) ||
    (clientSuffixValue.value || null) !== (originalPatientData.value.client_suffix || null) ||
    (relationshipValue.value || null) !== (originalPatientData.value.relationship || null)
}

// Combined check for any changes
const checkForChanges = () => {
  hasPatientChanges.value = checkPatientChanges()
  hasTransactionChanges.value = checkTransactionChanges()
}

const handleDelete = async () => {
  deleteLoading.value = true
  try {
    await axios.delete(`http://localhost:8000/api/patient-details/delete/${glNum.value}`)

    $q.notify({
      type: 'positive',
      message: 'Patient record deleted successfully',
      position: 'top'
    })

    showDeleteDialog.value = false
    router.push('/patient-records')
  } catch (error) {
    console.error("Failed to delete patient:", error)

    $q.notify({
      type: 'negative',
      message: 'Failed to delete patient record',
      position: 'top'
    })
  } finally {
    deleteLoading.value = false
  }
}

const ageValue = computed(() => {
  if (!birthdateValue.value) return null

  const birth = dayjs(birthdateValue.value, 'DD/MM/YYYY', true)

  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null

  return dayjs().diff(birth, 'year')
})

// Helper function to calculate age from birthdate string (DD/MM/YYYY)
const calculateAgeFromDate = (birthdateString) => {
  if (!birthdateString) return null

  const birth = dayjs(birthdateString, 'DD/MM/YYYY', true)

  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null

  return dayjs().diff(birth, 'year')
}

const handleCancel = async () => {
  showCancelDialog.value = false
  edit.value = false
  hasPatientChanges.value = false
  hasTransactionChanges.value = false

  await getPatientDetails(glNum.value)
}

const handleSaveClick = () => {
  if (!patientForm.value.validate()) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }

  // Check which type of changes were made
  const patientChanged = checkPatientChanges()
  const transactionChanged = checkTransactionChanges()

  if (patientChanged && transactionChanged) {
    // Both changed - show patient dialog first
    $q.notify({
      type: 'warning',
      message: 'Both patient and transaction details changed. Please handle patient changes first.',
      position: 'top'
    })
    editDialogAction.value = null
    showPatientEditDialog.value = true
  } else if (patientChanged) {
    // Only patient info changed
    editDialogAction.value = null
    showPatientEditDialog.value = true
  } else if (transactionChanged) {
    // Only transaction/client details changed
    showTransactionEditDialog.value = true
  } else {
    $q.notify({
      type: 'info',
      message: 'No changes detected',
      position: 'top'
    })
    edit.value = false
  }
}

const cancelPatientEdit = () => {
  showPatientEditDialog.value = false
  editDialogAction.value = null
}

const cancelTransactionEdit = () => {
  showTransactionEditDialog.value = false
}

const proceedWithEdit = async () => {
  if (!editDialogAction.value) return

  editActionLoading.value = true

  try {
    if (editDialogAction.value === 'update') {
      // Update existing patient
      await updatePatientInfo()
    } else {
      // Create new patient
      await createNewPatient()
    }

    showPatientEditDialog.value = false
    editDialogAction.value = null

    // If there are also transaction changes, show that dialog next
    if (checkTransactionChanges()) {
      showTransactionEditDialog.value = true
    } else {
      edit.value = false
      hasPatientChanges.value = false
      hasTransactionChanges.value = false
      await getPatientDetails(glNum.value)
    }
  } catch (error) {
    console.error('Action failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Operation failed',
      position: 'top'
    })
  } finally {
    editActionLoading.value = false
  }
}

const proceedWithTransactionUpdate = async () => {
  editActionLoading.value = true

  try {
    await updateTransactionDetails()

    showTransactionEditDialog.value = false
    edit.value = false
    hasPatientChanges.value = false
    hasTransactionChanges.value = false
    await getPatientDetails(glNum.value)
  } catch (error) {
    console.error('Transaction update failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update transaction details',
      position: 'top'
    })
  } finally {
    editActionLoading.value = false
  }
}

const updatePatientInfo = async () => {
  const formData = new FormData()
  formData.append('glNum', glNum.value)
  formData.append('update_patient_info', '1')
  formData.append('category', categoryValue.value)
  formData.append('lastname', lastNameValue.value)
  formData.append('firstname', firstNameValue.value)
  formData.append('middlename', middleNameValue.value || '')
  formData.append('suffix', suffixValue.value || '')

  // Convert DD/MM/YYYY to YYYY-MM-DD for MySQL
  const mysqlBirthdate = convertToMySQLDate(birthdateValue.value)
  formData.append('birthdate', mysqlBirthdate)

  formData.append('sex', sexValue.value)
  formData.append('preference', preferenceValue.value || '')
  formData.append('is_checked', isChecked.value ? 1 : 0)
  formData.append('province', provinceValue.value)
  formData.append('city', cityValue.value)
  formData.append('barangay', barangayValue.value)
  formData.append('house_address', houseAddressValue.value)
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', hospitalBillValue.value || 0)
  formData.append('issued_amount', issuedAmountValue.value)
  const user = JSON.parse(localStorage.getItem('user'))
  formData.append('issued_by', user.USERNAME)
  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')

  await axios.post('http://localhost:8000/api/patient-details/update', formData)

  $q.notify({
    type: 'positive',
    message: 'Patient information updated successfully',
    position: 'top'
  })
}

const createNewPatient = async () => {
  const formData = new FormData()
  formData.append('glNum', glNum.value)
  formData.append('force_new_patient', '1')
  formData.append('category', categoryValue.value)
  formData.append('lastname', lastNameValue.value)
  formData.append('firstname', firstNameValue.value)
  formData.append('middlename', middleNameValue.value || '')
  formData.append('suffix', suffixValue.value || '')

  // Convert DD/MM/YYYY to YYYY-MM-DD for MySQL
  const mysqlBirthdate = convertToMySQLDate(birthdateValue.value)
  formData.append('birthdate', mysqlBirthdate)

  formData.append('sex', sexValue.value)
  formData.append('preference', preferenceValue.value || '')
  formData.append('is_checked', isChecked.value ? 1 : 0)
  formData.append('province', provinceValue.value)
  formData.append('city', cityValue.value)
  formData.append('barangay', barangayValue.value)
  formData.append('house_address', houseAddressValue.value)
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', hospitalBillValue.value || 0)
  formData.append('issued_amount', issuedAmountValue.value)
  const user = JSON.parse(localStorage.getItem('user'))
  formData.append('issued_by', user.USERNAME)
  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')

  await axios.post('http://localhost:8000/api/patient-details/update', formData)

  $q.notify({
    type: 'positive',
    message: 'New patient created successfully',
    position: 'top'
  })
}

const updateTransactionDetails = async () => {
  const formData = new FormData()
  formData.append('glNum', glNum.value)
  formData.append('update_transaction_only', '1')
  formData.append('category', categoryValue.value)
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', hospitalBillValue.value || 0)
  formData.append('issued_amount', issuedAmountValue.value)
  formData.append('is_checked', isChecked.value ? 1 : 0)
  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')

  await axios.post('http://localhost:8000/api/patient-details/update', formData)

  $q.notify({
    type: 'positive',
    message: 'Transaction details updated successfully',
    position: 'top'
  })
}

onMounted(() => {
  if (!glNum.value) return
  getPatientDetails(glNum.value)
})

watch(
  () => route.params.glNum,
  (newGlNum) => {
    if (newGlNum) {
      getPatientDetails(newGlNum)
    }
  }
)

const getPatientDetails = async (id) => {
  const res = await axios.get(
    `http://localhost:8000/api/patient-details/${id}`
  )
  const patientDetails = res.data
  if (!patientDetails) return

  patientIDValue.value = patientDetails.patient_id
  categoryValue.value = patientDetails.category
  lastNameValue.value = patientDetails.patient_lastname
  firstNameValue.value = patientDetails.patient_firstname
  middleNameValue.value = patientDetails.patient_middlename
  suffixValue.value = patientDetails.patient_suffix

  // Convert birthdate from YYYY-MM-DD to DD/MM/YYYY
  birthdateValue.value = convertFromMySQLDate(patientDetails.birthdate)

  sexValue.value = patientDetails.sex
  preferenceValue.value = patientDetails.preference
  provinceValue.value = patientDetails.province
  cityValue.value = patientDetails.city
  barangayValue.value = patientDetails.barangay
  houseAddressValue.value = patientDetails.house_address

  // Store original data for comparison
  originalPatientData.value = {
    lastname: patientDetails.patient_lastname,
    firstname: patientDetails.patient_firstname,
    middlename: patientDetails.patient_middlename,
    suffix: patientDetails.patient_suffix,
    patient_id: patientDetails.patient_id,
    birthdate: convertFromMySQLDate(patientDetails.birthdate),
    sex: patientDetails.sex,
    preference: patientDetails.preference,
    barangay: patientDetails.barangay,
    house_address: patientDetails.house_address,
    province: patientDetails.province,
    city: patientDetails.city,
    category: patientDetails.category,
    partner: patientDetails.partner,
    hospital_bill: patientDetails.hospital_bill,
    issued_amount: patientDetails.issued_amount,
    is_checked: patientDetails.client_lastname == null,
    client_lastname: patientDetails.client_lastname,
    client_firstname: patientDetails.client_firstname,
    client_middlename: patientDetails.client_middlename,
    client_suffix: patientDetails.client_suffix,
    relationship: patientDetails.relationship
  }

  await nextTick()

  partnerValue.value = patientDetails.partner
  hospitalBillValue.value = patientDetails.hospital_bill
  issuedAmountValue.value = patientDetails.issued_amount
  issuedByValue.value = patientDetails.issued_by
  dateToday.value = patientDetails.date_issued

  if (patientDetails.client_lastname != null) {
    isChecked.value = false
    clientLastNameValue.value = patientDetails.client_lastname
    clientFirstNameValue.value = patientDetails.client_firstname
    clientMiddleNameValue.value = patientDetails.client_middlename
    clientSuffixValue.value = patientDetails.client_suffix
    relationshipValue.value = patientDetails.relationship
  } else {
    isChecked.value = true
    clientLastNameValue.value = null
    clientFirstNameValue.value = null
    clientMiddleNameValue.value = null
    clientSuffixValue.value = null
    relationshipValue.value = null
  }

  hasPatientChanges.value = false
  hasTransactionChanges.value = false
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

  // Calculate age from birthdate
  const age = calculateAgeFromDate(birthdateValue.value)

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

  // Only draw age if it's valid
  if (age !== null) {
    page.drawText(String(age), {
      x: 400,
      y: 375,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
  }
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
</script>

<style scoped>
/* TITLE */
.fieldset-title {
  font-size: 40px;
  font-weight: 700;
  color: #1f8f2e;
  margin: 0;
  line-height: 0.5;
  margin-top: 15px;
}

.fieldset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.patient-ids {
  margin-bottom: 20px;
}

.patient-ids h6 {
  margin: 4px 0;
  font-weight: 600;
}

.q-card-section {
  border: 2px solid #b5b5b5;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.12),
    0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #ffffff;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* BUTTON BASE */
.action-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
}

/* =========================
   FORM LAYOUT
========================= */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.required {
  color: red;
}

/* =========================
   INPUTS & SELECTS (FIXED)
========================= */
.flat-input :deep(.q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

.flat-input :deep(.q-field__control:before),
.flat-input :deep(.q-field__control:after) {
  display: none !important;
}

.flat-input :deep(.q-field__native),
.flat-input :deep(.q-field__input),
.flat-input :deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

.flat-input :deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

.flat-input :deep(input[readonly]),
.flat-input :deep(input:read-only) {
  color: #757575 !important;
}

.flat-input :deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

.flat-input :deep(.q-field--readonly .q-field__native),
.flat-input :deep(.q-field--readonly .q-field__input) {
  color: #757575 !important;
}

.flat-input :deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
}

.flat-input :deep(.q-field--disabled .q-field__native),
.flat-input :deep(.q-field--disabled .q-field__input),
.flat-input :deep(.q-field--disabled input),
.flat-input :deep(.q-field--disabled .q-field__label) {
  color: #757575 !important;
}

/* =========================
   CHECKBOX
========================= */
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

/* BUTTON COLORS */
.delete-btn {
  background: #ff3b3b;
  border-radius: 5%;
}

.cancel-btn {
  background: #ff3b3b;
  color: white;
  font-weight: bold;
  border-radius: 5%;
}

.edit-btn {
  background: #0aa64f;
  color: white;
  font-weight: bold;
  border-radius: 5%;
}

.save-btn {
  background: #0aa64f;
  color: white;
  font-weight: bold;
  border-radius: 5%;
}

.pdf-btn {
  background: #e53935;
  color: white;
  border-radius: 5%;
}

.cancel-btn,
.save-btn {
  gap: 10px;
}

.dialog-cancel-btn {
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

.dialog-warning-btn {
  background: #ff9800 !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-cancel-btn .q-icon,
.dialog-goback-btn .q-icon,
.dialog-warning-btn .q-icon {
  margin-right: 6px;
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  font-size: 13px;
  color: #333;
}

.info-item strong {
  color: #1f8f2e;
}

.info-item-full {
  grid-column: 1 / -1;
}

/* =========================
   CHANGES LIST (for transaction dialog)
========================= */
.changes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-item {
  font-size: 13px;
  color: #333;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.change-item strong {
  color: #1976d2;
  min-width: 140px;
}

.old-value {
  color: #d32f2f;
  font-weight: 500;
}

.new-value {
  color: #388e3c;
  font-weight: 600;
}

/* =========================
   OPTIONS GRID
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