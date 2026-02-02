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
            <q-btn label="Save" icon="save" class="action-btn save-btn" @click="showSaveDialog = true" dense />
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
            :rules="[val => !!val || 'This field is required']" :disable="!edit" />
        </div>

        <div class="col-6">
          <label class="form-label">Last Name <span class="required">*</span></label>
          <q-input v-model="lastNameValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
        </div>

        <div class="col-6">
          <label class="form-label">First Name <span class="required">*</span></label>
          <q-input v-model="firstNameValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
        </div>

        <div class="col-6">
          <label class="form-label">Middle Name</label>
          <q-input v-model="middleNameValue" dense outlined class="flat-input" :readonly="!edit" />
        </div>

        <div class="col-6">
          <label class="form-label">Suffix</label>
          <q-input v-model="suffixValue" dense outlined class="flat-input" :readonly="!edit" />
        </div>

        <div class="col-12">
          <q-checkbox v-model="isChecked" label="Patient is same as client?" class="form-checkbox" :disable="!edit" />
        </div>

        <div class="col-3">
          <label class="form-label">Birthdate <span class="required">*</span></label>
          <q-input v-model="birthdateValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit" placeholder="DD/MM/YYYY">
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
            :rules="[val => !!val || 'This field is required']" :disable="!edit" />
        </div>

        <div class="col-3">
          <label class="form-label">Preference</label>
          <q-select v-model="preferenceValue" :options="options[1]" dense outlined class="flat-input"
            :disable="!edit" />
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
            dense outlined class="flat-input" :disable="!edit" />
        </div>

        <div class="col-12">
          <label class="form-label">House Address <span class="required">*</span></label>
          <q-input v-model="houseAddressValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
        </div>
      </div>

      <!-- ================= ISSUANCE ================= -->
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <label class="form-label">Partner <span class="required">*</span></label>
          <q-select v-model="partnerValue" :options="partnerOptions" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :disable="!edit" />
        </div>

        <div class="col-6">
          <label class="form-label">Issued By</label>
          <q-input v-model="issuedByValue" dense outlined class="flat-input" :hint="'Cannot be edited!'"
            :persistent-hint="true" readonly />
        </div>

        <div class="col-6" v-if="categoryValue === 'HOSPITAL'">
          <label class="form-label">Hospital Bill <span class="required">*</span></label>
          <q-input v-model="hospitalBillValue" dense outlined class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
        </div>

        <div class="col-6">
          <label class="form-label">Issued Amount <span class="required">*</span></label>
          <q-input v-model="issuedAmountValue" dense outlined type="number" class="flat-input"
            :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
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
              :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
          </div>

          <div class="col-6">
            <label class="form-label">First Name <span class="required">*</span></label>
            <q-input v-model="clientFirstNameValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
          </div>

          <div class="col-6">
            <label class="form-label">Middle Name</label>
            <q-input v-model="clientMiddleNameValue" dense outlined class="flat-input" :readonly="!edit" />
          </div>

          <div class="col-6">
            <label class="form-label">Suffix</label>
            <q-input v-model="clientSuffixValue" dense outlined class="flat-input" :readonly="!edit" />
          </div>

          <div class="col-12">
            <label class="form-label">Relationship to Patient <span class="required">*</span></label>
            <q-input v-model="relationshipValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit" />
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

    <!-- SAVE CONFIRMATION DIALOG -->
    <q-dialog v-model="showSaveDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save Changes?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to save your changes?
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleSave"
            :loading="saveLoading" />
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

    <!-- EXISTING PATIENTS DIALOG (NAME CONFLICT) -->
    <q-dialog v-model="showExistingDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-h6">
            <q-icon name="warning" size="sm" class="q-mr-sm" />
            Name Change Detected
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            You are changing the patient's name from:
          </div>
          <div class="name-change-display q-mb-md q-pa-md bg-grey-2 rounded-borders">
            <div class="row items-center">
              <div class="col-5 text-center">
                <div class="text-caption text-grey-7">OLD NAME</div>
                <div class="text-bold text-h6">
                  {{ originalPatientData.lastname }}, {{ originalPatientData.firstname }}
                  <span v-if="originalPatientData.middlename"> {{ originalPatientData.middlename }}</span>
                  <span v-if="originalPatientData.suffix"> {{ originalPatientData.suffix }}</span>
                </div>
              </div>
              <div class="col-2 text-center">
                <q-icon name="arrow_forward" size="md" color="orange" />
              </div>
              <div class="col-5 text-center">
                <div class="text-caption text-grey-7">NEW NAME</div>
                <div class="text-bold text-h6 text-orange">
                  {{ lastNameValue }}, {{ firstNameValue }}
                  <span v-if="middleNameValue"> {{ middleNameValue }}</span>
                  <span v-if="suffixValue"> {{ suffixValue }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            What would you like to do?
          </div>

          <div v-if="existingPatients.length > 0" class="q-mb-md">
            <q-banner class="bg-blue-1 text-blue-9 q-mb-md">
              <template v-slot:avatar>
                <q-icon name="info" color="blue" />
              </template>
              A patient with this new name already exists in the system.
            </q-banner>

            <div class="text-subtitle2 q-mb-sm">Existing Patient(s) Found:</div>
            <q-list bordered separator>
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
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">Available Actions:</div>
          <div class="options-grid">
            <!-- Option 1: Replace All Names -->
            <div class="option-card" @click="selectedAction = 'replace'"
              :class="{ 'option-selected': selectedAction === 'replace' }">
              <q-icon name="sync_alt" size="md" color="orange" />
              <div class="option-title">Replace All Names</div>
              <div class="option-description">
                Update the name for Patient ID {{ originalPatientData.patient_id }} across ALL GL records.
                This affects all past and future records.
              </div>
            </div>

            <!-- Option 2: Create New Patient -->
            <div class="option-card" @click="selectedAction = 'new'"
              :class="{ 'option-selected': selectedAction === 'new' }">
              <q-icon name="person_add" size="md" color="green" />
              <div class="option-title">Create New Patient</div>
              <div class="option-description">
                Create a new patient with a new Patient ID. This GL record will be separated from previous records.
              </div>
            </div>

            <!-- Option 3: Use Existing Patient (only if matches found) -->
            <div v-if="existingPatients.length > 0" class="option-card" @click="selectedAction = 'existing'"
              :class="{ 'option-selected': selectedAction === 'existing', 'option-disabled': !selectedExistingPatient }">
              <q-icon name="link" size="md" color="blue" />
              <div class="option-title">Link to Existing Patient</div>
              <div class="option-description">
                Link this GL record to the selected existing patient.
                <span v-if="!selectedExistingPatient" class="text-red">Please select a patient above first.</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelNameChange" />
          <q-btn label="PROCEED" icon="check" unelevated class="dialog-cancel-btn"
            :disable="!selectedAction || (selectedAction === 'existing' && !selectedExistingPatient)"
            @click="proceedWithAction" :loading="actionLoading" />
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
const showSaveDialog = ref(false)
const showCancelDialog = ref(false)
const showExistingDialog = ref(false)
const deleteLoading = ref(false)
const saveLoading = ref(false)
const actionLoading = ref(false)

const existingPatients = ref([])
const selectedExistingPatient = ref(null)
const selectedAction = ref(null)

const originalPatientData = ref({
  lastname: null,
  firstname: null,
  middlename: null,
  suffix: null,
  patient_id: null
})

const partnerOptions = computed(() => {
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

// Calculate age from birthdate
const calculateAge = (birthdate) => {
  if (!birthdate) return null

  // Parse DD/MM/YYYY format
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


const handleCancel = async () => {
  showCancelDialog.value = false
  edit.value = false

  await getPatientDetails(glNum.value)
}

const handleSave = async () => {
  if (!patientForm.value.validate()) {
    showSaveDialog.value = false
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }

  showSaveDialog.value = false

  const nameChanged =
    lastNameValue.value !== originalPatientData.value.lastname ||
    firstNameValue.value !== originalPatientData.value.firstname ||
    middleNameValue.value !== originalPatientData.value.middlename ||
    suffixValue.value !== originalPatientData.value.suffix

  if (nameChanged) {
    await checkExistingPatients()
  } else {
    await performUpdate()
  }
}

const checkExistingPatients = async () => {
  try {
    const res = await axios.post('http://localhost:8000/api/patients/existing', {
      lastname: lastNameValue.value,
      firstname: firstNameValue.value,
      middlename: middleNameValue.value,
      suffix: suffixValue.value
    })

    existingPatients.value = res.data

    existingPatients.value = existingPatients.value.filter(
      p => p.patient_id !== originalPatientData.value.patient_id
    )

    showExistingDialog.value = true
    selectedAction.value = null
    selectedExistingPatient.value = null

  } catch (err) {
    console.error('Failed checking existing patients', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to check for existing patients',
      position: 'top'
    })
  }
}

const proceedWithAction = async () => {
  if (!selectedAction.value) return

  actionLoading.value = true

  try {
    if (selectedAction.value === 'replace') {
      await replaceAllNames()
    } else if (selectedAction.value === 'new') {
      await createNewPatient()
    } else if (selectedAction.value === 'existing') {
      await useExistingPatient()
    }
  } catch (error) {
    console.error('Action failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Operation failed',
      position: 'top'
    })
  } finally {
    actionLoading.value = false
  }
}

const performUpdate = async () => {
  saveLoading.value = true
  try {
    await updateDetails()

    $q.notify({
      type: 'positive',
      message: 'Changes saved successfully',
      position: 'top'
    })

    edit.value = false
    await getPatientDetails(glNum.value)
  } catch (error) {
    console.error("Failed to save changes:", error)

    $q.notify({
      type: 'negative',
      message: 'Failed to save changes',
      position: 'top'
    })
  } finally {
    saveLoading.value = false
  }
}

const cancelNameChange = () => {
  lastNameValue.value = originalPatientData.value.lastname
  firstNameValue.value = originalPatientData.value.firstname
  middleNameValue.value = originalPatientData.value.middlename
  suffixValue.value = originalPatientData.value.suffix
  showExistingDialog.value = false
  selectedExistingPatient.value = null
  selectedAction.value = null
}

const replaceAllNames = async () => {
  try {
    await axios.post('http://localhost:8000/api/patient-name/update', {
      patient_id: originalPatientData.value.patient_id,
      lastname: lastNameValue.value,
      firstname: firstNameValue.value,
      middlename: middleNameValue.value,
      suffix: suffixValue.value
    })

    // Update other GL-specific details
    await updateDetails()

    $q.notify({
      type: 'positive',
      message: 'Name replaced successfully across all records',
      position: 'top'
    })

    showExistingDialog.value = false
    edit.value = false
    selectedExistingPatient.value = null
    selectedAction.value = null
    await getPatientDetails(glNum.value)
  } catch (error) {
    console.error("Failed to replace names:", error)
    throw error
  }
}

// Create a new patient record (new patient_id)
const createNewPatient = async () => {
  try {
    // Update with force_new_patient flag
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

    showExistingDialog.value = false
    edit.value = false
    selectedAction.value = null
    await getPatientDetails(glNum.value)
  } catch (error) {
    console.error("Failed to create new patient:", error)
    throw error
  }
}

// Link this GL to an existing patient_id
const useExistingPatient = async () => {
  if (!selectedExistingPatient.value) return

  try {
    // Update with the selected existing patient_id
    const formData = new FormData()
    formData.append('glNum', glNum.value)
    formData.append('use_existing_patient_id', selectedExistingPatient.value.patient_id)
    formData.append('category', categoryValue.value)

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
      message: 'Record linked to existing patient successfully',
      position: 'top'
    })

    showExistingDialog.value = false
    edit.value = false
    selectedAction.value = null
    await getPatientDetails(glNum.value)
  } catch (error) {
    console.error("Failed to link to existing patient:", error)
    throw error
  }
}

const updateDetails = async () => {
  const formData = new FormData()
  formData.append('glNum', glNum.value)
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

  if (hospitalBillValue.value == null || hospitalBillValue.value == '') {
    hospitalBillValue.value = 0;
  }
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', Number(hospitalBillValue.value))
  formData.append('issued_amount', issuedAmountValue.value)
  const user = JSON.parse(localStorage.getItem('user'))
  const username = user.USERNAME
  formData.append('issued_by', username)

  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')

  await axios.post('http://localhost:8000/api/patient-details/update', formData)
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

  originalPatientData.value = {
    lastname: patientDetails.patient_lastname,
    firstname: patientDetails.patient_firstname,
    middlename: patientDetails.patient_middlename,
    suffix: patientDetails.patient_suffix,
    patient_id: patientDetails.patient_id
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
    size: 12,
    color: rgb(0, 0, 0),
    font: boldFont,
  })
  page.drawText(String(age), {
    x: 400,
    y: 375,
    size: 14,
    color: rgb(0, 0, 0),
    font: boldFont,
  })
  page.drawText(sexValue.value.toUpperCase(), {
    x: 455,
    y: 375,
    size: 14,
    color: rgb(0, 0, 0),
    font: boldFont,
  })
  page.drawText(fullAddressValue.toUpperCase(), {
    x: 95,
    y: 350,
    size: 14,
    color: rgb(0, 0, 0),
    font: boldFont,
  })
  page.drawText(clientValue.value.toUpperCase(), {
    x: 70,
    y: 300,
    size: 14,
    color: rgb(0, 0, 0),
    font: boldFont,
  })

  if (categoryValue.value == 'MEDICINE') {
    page.drawText(amountWords, {
      x: 245,
      y: 273,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
  } else {
    page.drawText(amountWords, {
      x: 260,
      y: 273,
      size: 12,
      color: rgb(0, 0, 0),
      font: boldFont,
    })
  }

  page.drawText(
    Number(issuedAmountValue.value).toFixed(2),
    {
      x: 90,
      y: 248,
      size: 14,
      color: rgb(0, 0, 0),
      font: boldFont,
    },
  )
  page.drawText(dayNum, {
    x: 137,
    y: 197,
    size: 14,
    color: rgb(0, 0, 0),
    font: boldFont,
  })
  page.drawText(monthName.toUpperCase(), {
    x: 225,
    y: 197,
    size: 14,
    color: rgb(0, 0, 0),
    font: boldFont,
  })
  page.drawText(issuedByValue.value.toUpperCase(), {
    x: 350,
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
   NAME CHANGE DIALOG STYLES
========================= */
.name-change-display {
  border: 2px solid #e0e0e0;
}

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