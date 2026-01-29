<template>
  <div class="form-card">
    <div class="patient-info-pill">Patient's Info.</div>

    <q-form ref="patientForm" class="form-body">
      <div class="row-1">
        <div class="category">
          <label>Category <span>*</span></label>
          <q-select v-model="categoryValue" :options="categoryOptions" label="Category" placeholder="Category" dense
            outlined :rules="[val => !!val || 'This field is required']" />
        </div>
      </div>

      <h6 class="section-title">Patient Form</h6>

      <div class="grid-4">
        <div class="field lastname-field">
          <label>Last Name <span>*</span></label>
          <q-input 
            v-model="lastNameValue" 
            placeholder="Last Name" 
            dense 
            outlined
            :rules="[val => !!val || 'This field is required']" 
            @update:model-value="onLastNameChange"
            @focus="lastNameFocused = true"
            @blur="onLastNameBlur"
          >
            <template v-slot:append v-if="searchingPatients">
              <q-spinner color="primary" size="20px" />
            </template>
          </q-input>

          <!-- Patient Search Dropdown -->
          <div 
            v-if="showPatientDropdown && filteredSearchResults.length > 0" 
            class="patient-dropdown"
          >
            <div class="dropdown-header">
              <q-icon name="info" size="xs" color="blue" class="q-mr-xs" />
              <span>{{ filteredSearchResults.length }} patient(s) found - Click to select</span>
            </div>
            <q-scroll-area style="height: 300px;">
              <q-list separator>
                <q-item 
                  v-for="patient in filteredSearchResults" 
                  :key="patient.patient_id" 
                  clickable
                  :disable="!patient.eligible"
                  @click="selectPatientFromDropdown(patient)"
                  :class="{
                    'dropdown-patient-item': true,
                    'patient-eligible': patient.eligible,
                    'patient-ineligible': !patient.eligible
                  }"
                >
                  <q-item-section>
                    <q-item-label class="patient-name-dropdown">
                      {{ patient.lastname }}, {{ patient.firstname }}
                      <span v-if="patient.middlename"> {{ patient.middlename }}</span>
                      <span v-if="patient.suffix"> {{ patient.suffix }}</span>
                    </q-item-label>
                    <q-item-label caption class="patient-details-dropdown">
                      <div class="detail-row-dropdown">
                        <span><strong>ID:</strong> {{ patient.patient_id }}</span>
                        <span><strong>Sex:</strong> {{ patient.sex || 'N/A' }}</span>
                        <span><strong>Age:</strong> {{ calculateAgeFromDate(patient.birthdate) || 'N/A' }}</span>
                      </div>
                      <div class="detail-row-dropdown">
                        <span><strong>Address:</strong> {{ formatAddress(patient) }}</span>
                      </div>
                      <div class="detail-row-dropdown" v-if="patient.last_issued_at">
                        <span><strong>Latest GL:</strong> {{ patient.gl_no }}</span>
                        <span><strong>Issued:</strong> {{ formatDate(patient.last_issued_at) }}</span>
                      </div>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <div class="eligibility-badge-container-dropdown">
                      <q-badge v-if="patient.eligible" color="green" class="eligibility-badge-dropdown">
                        <q-icon name="check_circle" size="xs" class="q-mr-xs" />
                        ELIGIBLE
                      </q-badge>
                      <q-badge v-else color="red" class="eligibility-badge-dropdown">
                        <q-icon name="block" size="xs" class="q-mr-xs" />
                        NOT ELIGIBLE
                      </q-badge>
                      <div v-if="!patient.eligible && patient.eligibility_date" class="eligibility-info-dropdown">
                        <small>Eligible: {{ formatDate(patient.eligibility_date) }}</small>
                        <small class="text-red">{{ patient.days_remaining }} days remaining</small>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </div>
        </div>

        <div class="field">
          <label>First Name <span>*</span></label>
          <q-input v-model="firstNameValue" dense outlined placeholder="First Name"
            :rules="[val => !!val || 'This field is required']" @update:model-value="checkForPatientEdits" />
        </div>

        <div class="field">
          <label>Middle Name</label>
          <q-input v-model="middleNameValue" dense outlined placeholder="Middle Name"
            @update:model-value="checkForPatientEdits" />
        </div>

        <div class="field">
          <label>Suffix</label>
          <q-input v-model="suffixValue" dense outlined placeholder="Suffix"
            @update:model-value="checkForPatientEdits" />
        </div>
      </div>

      <q-checkbox v-model="isChecked" class="checkbox" label="Patient is same as client?" />

      <div class="grid-4">
        <div class="field">
          <label>Birthdate <span>*</span></label>
          <q-input v-model="birthdateValue" @change="" dense outlined placeholder="DD/MM/YYYY"
            :rules="[val => !!val || 'This field is required']" @update:model-value="checkForPatientEdits"
            mask="##/##/####">
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="birthdateValue" mask="DD/MM/YYYY" emit-immediately
                    :options="date => date <= new Date().toISOString().split('T')[0].split('-').reverse().join('/')">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="field">
          <label>Age </label>
          <q-input v-model="ageValue" dense outlined placeholder="Auto-calculated" readonly />
        </div>

        <div class="field">
          <label>Sex <span>*</span></label>
          <q-select v-model="sexValue" dense outlined :options="options[0]" label="Sex" placeholder="Sex"
            :rules="[val => !!val || 'This field is required']" @update:model-value="checkForPatientEdits" />
        </div>

        <div class="field">
          <label>Preference</label>
          <q-select v-model="preferenceValue" :options="options[1]" label="Preference" placeholder="Preference" dense
            outlined @update:model-value="checkForPatientEdits" />
        </div>
      </div>

      <div class="grid-4">
        <div class="field">
          <label>Province</label>
          <q-input v-model="provinceValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined disable />
        </div>

        <div class="field">
          <label>City</label>
          <q-input v-model="cityValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined disable />
        </div>

        <div class="field">
          <label>Barangay <span>*</span></label>
          <q-select v-model="barangayValue" :options="options[2]" dense outlined
            :rules="[val => !!val || 'This field is required']" @update:model-value="checkForPatientEdits" />
        </div>

        <div class="field">
          <label>House Address <span>*</span></label>
          <q-input v-model="houseAddressValue" dense outlined :rules="[val => !!val || 'This field is required']"
            @update:model-value="checkForPatientEdits" />
        </div>
      </div>

      <div class="grid-3">
        <div class="field">
          <label>Partner <span>*</span></label>
          <q-select v-model="partnerValue" dense outlined :options="partnerOptions"
            :rules="[val => !!val || 'This field is required']" :disable="categoryValue == null"
            :hint="categoryValue == null ? 'Must select a category before selecting a partner!' : ''"
            :persistent-hint="categoryValue == null" />
        </div>

        <div class="field" v-if="categoryValue == 'HOSPITAL'">
          <label>Hospital Bill <span>*</span></label>
          <q-input type="number" dense v-model="hospitalBillValue" outlined
            :rules="[val => !!val || 'This field is required']" />
        </div>

        <div class="field">
          <label>Issued Amount <span>*</span></label>
          <q-input type="number" dense v-model="issuedAmountValue" outlined
            :rules="[val => !!val || 'This field is required']" />
        </div>
      </div>

      <div v-if="!isChecked">
        <q-separator color="grey-5" size="2px" class="q-my-lg" />
        <h6 class="section-title">Client's Name</h6>

        <div class="grid-4">
          <div class="field">
            <label>Last Name <span>*</span></label>
            <q-input v-model="clientLastNameValue" dense outlined placeholder="Last Name"
              :rules="[val => !!val || 'This field is required']" />
          </div>

          <div class="field">
            <label>First Name <span>*</span></label>
            <q-input v-model="clientFirstNameValue" dense outlined placeholder="First Name"
              :rules="[val => !!val || 'This field is required']" />
          </div>

          <div class="field">
            <label>Middle Name</label>
            <q-input v-model="clientMiddleNameValue" dense outlined placeholder="Middle Name" />
          </div>

          <div class="field">
            <label>Suffix</label>
            <q-input v-model="clientSuffixValue" dense outlined placeholder="Suffix" />
          </div>
        </div>

        <div class="field full">
          <label>Relationship to patient <span>*</span></label>
          <q-input v-model="relationshipValue" dense outlined placeholder="Relationship to patient"
            :rules="[val => !!val || 'This field is required']" />
        </div>
      </div>

      <div class="actions">
        <q-btn class="btn-cancel" icon="close" label="CLOSE" @click="showCancelDialog = true" dense />
        <q-btn class="btn-save" icon="save" label="SAVE" @click="handleSaveClick" dense />
        <q-btn class="btn-print" icon="print" label="SAVE AND PRINT" @click="handleSaveAndPrintClick" dense />
      </div>
    </q-form>

    <!-- All the dialog components remain the same... -->
    <!-- PATIENT EDIT CONFIRMATION DIALOG (when browser patient is edited) -->
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
            You have modified the patient information that was loaded from the dropdown.
          </div>

          <q-banner class="bg-orange-1 text-orange-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="info" color="orange" />
            </template>
            Please choose whether to update the existing patient's information or create a new patient.
          </q-banner>

          <!-- Show original patient info -->
          <div v-if="selectedBrowserPatient" class="patient-info-box q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Original Patient Information:</div>
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
              <div class="info-item info-item-full">
                <strong>Address:</strong> {{ formatAddress(selectedBrowserPatient) }}
              </div>
              <div class="info-item info-item-full">
                <strong>Latest GL:</strong> {{ selectedBrowserPatient.gl_no || 'N/A' }}
                <span v-if="selectedBrowserPatient.last_issued_at">
                  - Issued: {{ formatDate(selectedBrowserPatient.last_issued_at) }}
                </span>
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
                Update Patient ID {{ selectedBrowserPatient?.patient_id }} with the new information.
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

    <!-- PATIENT ID CONFIRMATION DIALOG (when using dropdown-selected patient without edits) -->
    <q-dialog v-model="showPatientIdConfirmDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h6">
            <q-icon name="info" size="sm" class="q-mr-sm" />
            Use Existing Patient?
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            You selected an existing patient from the dropdown.
          </div>

          <!-- Show patient info -->
          <div v-if="selectedBrowserPatient" class="patient-info-box q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Patient Information:</div>
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
              <div class="info-item info-item-full">
                <strong>Address:</strong> {{ formatAddress(selectedBrowserPatient) }}
              </div>
              <div class="info-item info-item-full">
                <strong>Latest GL:</strong> {{ selectedBrowserPatient.gl_no || 'N/A' }}
                <span v-if="selectedBrowserPatient.last_issued_at">
                  - Issued: {{ formatDate(selectedBrowserPatient.last_issued_at) }}
                </span>
              </div>
            </div>
          </div>

          <div class="text-body2 text-grey-8 q-mb-md">
            Would you like to link this new record to the existing patient, or create a new patient entry?
          </div>

          <div class="options-grid">
            <!-- Option 1: Use Existing Patient -->
            <div class="option-card" @click="confirmDialogAction = 'existing'"
              :class="{ 'option-selected': confirmDialogAction === 'existing' }">
              <q-icon name="link" size="md" color="blue" />
              <div class="option-title">Use Existing Patient</div>
              <div class="option-description">
                Link this record to Patient ID {{ selectedBrowserPatient?.patient_id }}. This will add a new GL record
                under the same patient.
              </div>
            </div>

            <!-- Option 2: Create New Patient -->
            <div class="option-card" @click="confirmDialogAction = 'new'"
              :class="{ 'option-selected': confirmDialogAction === 'new' }">
              <q-icon name="person_add" size="md" color="green" />
              <div class="option-title">Create New Patient</div>
              <div class="option-description">
                Create a completely new patient with a new Patient ID. Use this if this is actually a different person
                with the same name.
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelPatientIdConfirm" />
          <q-btn label="PROCEED" icon="check" unelevated class="dialog-cancel-btn" :disable="!confirmDialogAction"
            @click="proceedWithPatientIdConfirm" :loading="confirmActionLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ELIGIBILITY WARNING DIALOG -->
    <q-dialog v-model="showEligibilityWarning" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section class="bg-red-6 text-white">
          <div class="text-h6">
            <q-icon name="warning" size="sm" class="q-mr-sm" />
            Patient Not Yet Eligible
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            This patient is not yet eligible for a new guarantee letter.
          </div>

          <q-banner class="bg-orange-1 text-orange-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="schedule" color="orange" />
            </template>
            <div v-if="eligibilityWarningData">
              <div class="text-weight-bold">Last GL Number: {{ eligibilityWarningData.last_gl_no }}</div>
              <div>Issued: {{ formatDate(eligibilityWarningData.last_issued_at) }}</div>
              <div class="text-weight-bold text-orange-9 q-mt-sm">
                Eligible from: {{ formatDate(eligibilityWarningData.eligibility_date) }}
              </div>
              <div class="text-caption q-mt-xs">
                ({{ calculateDaysRemaining(eligibilityWarningData.eligibility_date) }} days remaining)
              </div>
            </div>
          </q-banner>

          <div class="text-body2 text-grey-8">
            Patients must wait 3 months between guarantee letters.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CLOSE" icon="close" unelevated class="dialog-goback-btn" @click="closeEligibilityWarning" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- SAVE AND PRINT CONFIRMATION DIALOG -->
    <q-dialog v-model="showPrintDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save and Print Form?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to save and print?
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="confirmSaveAndPrint"
            :loading="printLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- SAVE CONFIRMATION DIALOG -->
    <q-dialog v-model="showSaveDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save Form?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to save?
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="confirmSave"
            :loading="saveLoading" />
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
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleCancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- EXISTING PATIENTS DIALOG (automatic detection) -->
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

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelExistingDialog" />
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

const categoryValue = ref(null)
const lastNameValue = ref(null)
const firstNameValue = ref(null)
const middleNameValue = ref(null)
const suffixValue = ref(null)
const birthdateValue = ref(null)
const ageValue = ref(null)
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
const issuedByValue = ref(JSON.parse(localStorage.getItem('user')).USERNAME)
const glNum = ref(null)

const clientLastNameValue = ref(null)
const clientFirstNameValue = ref(null)
const clientMiddleNameValue = ref(null)
const clientSuffixValue = ref(null)
const relationshipValue = ref(null)

const dateToday = ref(null)

// Auto-search related refs
const showPatientDropdown = ref(false)
const searchingPatients = ref(false)
const patientSearchResults = ref([])
const lastNameFocused = ref(false)
const searchDebounceTimer = ref(null)

const selectedBrowserPatient = ref(null)
const originalBrowserPatient = ref(null)
const showPatientIdConfirmDialog = ref(false)
const showPatientEditDialog = ref(false)
const confirmDialogAction = ref(null)
const editDialogAction = ref(null)
const confirmActionLoading = ref(false)
const editActionLoading = ref(false)
const usedBrowserPatient = ref(false)
const browserPatientEdited = ref(false)

const partnerOptions = computed(() => {
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

const filteredSearchResults = computed(() => {
  if (!lastNameValue.value || lastNameValue.value.trim().length < 2) {
    return []
  }

  const query = lastNameValue.value.toLowerCase().trim()
  
  return patientSearchResults.value
    .filter(patient => patient.lastname.toLowerCase().startsWith(query))
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
const showSaveDialog = ref(false)
const showPrintDialog = ref(false)
const showExistingDialog = ref(false)
const showEligibilityWarning = ref(false)
const saveLoading = ref(false)
const printLoading = ref(false)
const actionLoading = ref(false)

const pendingAction = ref(null)

const existingPatients = ref([])
const selectedExistingPatient = ref(null)
const selectedAction = ref(null)
const eligibilityWarningData = ref(null)

// AUTOMATIC AGE CALCULATION - Watch birthdate changes
watch(birthdateValue, (newBirthdate) => {
  if (newBirthdate) {
    const age = calculateAge(newBirthdate)
    ageValue.value = age !== null ? String(age) : null
  } else {
    ageValue.value = null
  }
})

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

// Calculate age from MySQL date format (YYYY-MM-DD)
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

// Auto-search when last name changes
const onLastNameChange = (value) => {
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
  }, 300) // Wait 300ms after user stops typing
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

const selectPatientFromDropdown = (patient) => {
  if (!patient.eligible) {
    eligibilityWarningData.value = {
      last_gl_no: patient.gl_no,
      last_issued_at: patient.last_issued_at,
      eligibility_date: patient.eligibility_date,
      days_remaining: patient.days_remaining
    }
    showEligibilityWarning.value = true
    showPatientDropdown.value = false
    return
  }

  selectedBrowserPatient.value = patient
  originalBrowserPatient.value = { ...patient }
  showPatientDropdown.value = false
  usedBrowserPatient.value = true
  browserPatientEdited.value = false

  // Fill form with patient data
  lastNameValue.value = patient.lastname
  firstNameValue.value = patient.firstname
  middleNameValue.value = patient.middlename
  suffixValue.value = patient.suffix
  birthdateValue.value = convertFromMySQLDate(patient.birthdate)
  sexValue.value = patient.sex
  preferenceValue.value = patient.preference
  provinceValue.value = patient.province || 'Davao del Norte'
  cityValue.value = patient.city || 'Tagum City'
  barangayValue.value = patient.barangay
  houseAddressValue.value = patient.house_address

  $q.notify({
    type: 'positive',
    message: 'Patient information loaded. Fill in the remaining details.',
    position: 'top'
  })
}

const closeEligibilityWarning = () => {
  showEligibilityWarning.value = false
  eligibilityWarningData.value = null
}

// Check if browser patient details have been edited
const checkForPatientEdits = () => {
  if (!usedBrowserPatient.value || !originalBrowserPatient.value) return

  const edited =
    lastNameValue.value !== originalBrowserPatient.value.lastname ||
    firstNameValue.value !== originalBrowserPatient.value.firstname ||
    (middleNameValue.value || null) !== (originalBrowserPatient.value.middlename || null) ||
    (suffixValue.value || null) !== (originalBrowserPatient.value.suffix || null) ||
    birthdateValue.value !== convertFromMySQLDate(originalBrowserPatient.value.birthdate) ||
    sexValue.value !== originalBrowserPatient.value.sex ||
    (preferenceValue.value || null) !== (originalBrowserPatient.value.preference || null) ||
    barangayValue.value !== originalBrowserPatient.value.barangay ||
    houseAddressValue.value !== originalBrowserPatient.value.house_address

  browserPatientEdited.value = edited
}

const cancelPatientIdConfirm = () => {
  showPatientIdConfirmDialog.value = false
  confirmDialogAction.value = null
  usedBrowserPatient.value = false
  selectedBrowserPatient.value = null
  originalBrowserPatient.value = null
  browserPatientEdited.value = false
}

const cancelPatientEdit = () => {
  showPatientEditDialog.value = false
  editDialogAction.value = null
}

const proceedWithEdit = async () => {
  if (!editDialogAction.value) return

  editActionLoading.value = true

  try {
    if (editDialogAction.value === 'update') {
      await submitForm(pendingAction.value === 'print', selectedBrowserPatient.value.patient_id, true)
    } else {
      await submitForm(pendingAction.value === 'print', null)
    }

    showPatientEditDialog.value = false
    editDialogAction.value = null
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

const proceedWithPatientIdConfirm = async () => {
  if (!confirmDialogAction.value) return

  confirmActionLoading.value = true

  try {
    if (confirmDialogAction.value === 'existing') {
      await submitForm(pendingAction.value === 'print', selectedBrowserPatient.value.patient_id)
    } else {
      await submitForm(pendingAction.value === 'print', null)
    }

    showPatientIdConfirmDialog.value = false
    confirmDialogAction.value = null
  } catch (error) {
    console.error('Action failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Operation failed',
      position: 'top'
    })
  } finally {
    confirmActionLoading.value = false
  }
}

// Check eligibility function
const checkEligibility = async () => {
  if (!lastNameValue.value || !firstNameValue.value) return { eligible: true };

  try {
    const res = await axios.post('http://localhost:8000/api/patients/check-eligibility', {
      lastname: lastNameValue.value,
      firstname: firstNameValue.value,
      middlename: middleNameValue.value,
      suffix: suffixValue.value
    })

    return res.data;
  } catch (err) {
    console.error('Failed checking eligibility', err)
    return { eligible: true };
  }
}

const checkExistingPatients = async (isPrint = false) => {
  if (!lastNameValue.value || !firstNameValue.value) return;

  pendingAction.value = isPrint ? 'print' : 'save'

  // If user selected from dropdown and edited the info
  if (usedBrowserPatient.value && selectedBrowserPatient.value && browserPatientEdited.value) {
    editDialogAction.value = null
    showPatientEditDialog.value = true
    return
  }

  // If user selected from dropdown without edits
  if (usedBrowserPatient.value && selectedBrowserPatient.value && !browserPatientEdited.value) {
    confirmDialogAction.value = null
    showPatientIdConfirmDialog.value = true
    return
  }

  try {
    const res = await axios.post('http://localhost:8000/api/patients/existing', {
      lastname: lastNameValue.value,
      firstname: firstNameValue.value,
      middlename: middleNameValue.value,
      suffix: suffixValue.value
    })

    existingPatients.value = res.data;

    if (existingPatients.value.length > 0) {
      showExistingDialog.value = true;
      selectedAction.value = null;
      selectedExistingPatient.value = null;
    } else {
      const eligibilityCheck = await checkEligibility()

      if (!eligibilityCheck.eligible) {
        eligibilityWarningData.value = eligibilityCheck
        showEligibilityWarning.value = true
        return
      }

      await submitForm(isPrint, null)
    }
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
    if (selectedAction.value === 'existing') {
      await checkEligibilityAndProceed(selectedExistingPatient.value.patient_id)
    } else if (selectedAction.value === 'new') {
      const eligibilityCheck = await checkEligibility()

      if (!eligibilityCheck.eligible) {
        showExistingDialog.value = false
        eligibilityWarningData.value = eligibilityCheck
        showEligibilityWarning.value = true
        actionLoading.value = false
        return
      }

      await createNewPatient()
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

const checkEligibilityAndProceed = async (patientId) => {
  try {
    const res = await axios.post('http://localhost:8000/api/patients/check-eligibility-by-id', {
      patient_id: patientId
    })

    if (!res.data.eligible) {
      showExistingDialog.value = false
      eligibilityWarningData.value = res.data
      showEligibilityWarning.value = true
      return
    }

    await useExistingPatient()
  } catch (err) {
    console.error('Failed checking eligibility', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to check eligibility',
      position: 'top'
    })
  }
}

const useExistingPatient = async () => {
  const patientId = selectedExistingPatient.value.patient_id
  showExistingDialog.value = false
  await submitForm(pendingAction.value === 'print', patientId)
}

const createNewPatient = async () => {
  showExistingDialog.value = false
  await submitForm(pendingAction.value === 'print', null)
}

const cancelExistingDialog = () => {
  showExistingDialog.value = false
  selectedExistingPatient.value = null
  selectedAction.value = null
  pendingAction.value = null
}

const handleCancel = () => {
  showCancelDialog.value = false
  router.push('/patient-records')
}

const handleSaveClick = () => {
  if (patientForm.value.validate()) {
    showSaveDialog.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
  }
}

const handleSaveAndPrintClick = () => {
  if (patientForm.value.validate()) {
    showPrintDialog.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
  }
}

const confirmSave = async () => {
  showSaveDialog.value = false
  saveLoading.value = true
  try {
    await checkExistingPatients(false)
  } finally {
    saveLoading.value = false
  }
}

const confirmSaveAndPrint = async () => {
  showPrintDialog.value = false
  printLoading.value = true
  try {
    await checkExistingPatients(true)
  } finally {
    printLoading.value = false
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

  const age = calculateAge(birthdateValue.value)

  page.drawText(glNum.value + ' / ' + partnerValue.value, {
    x: 600, y: 489, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(fullNameValue.toUpperCase(), {
    x: 140, y: 375, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(String(age), {
    x: 400, y: 375, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(sexValue.value.toUpperCase(), {
    x: 455, y: 375, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(fullAddressValue.toUpperCase(), {
    x: 95, y: 350, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(clientValue.value.toUpperCase(), {
    x: 70, y: 300, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })

  if (categoryValue.value == 'MEDICINE') {
    page.drawText(amountWords, {
      x: 245, y: 273, size: 12, color: rgb(0, 0, 0), font: boldFont,
    })
  } else {
    page.drawText(amountWords, {
      x: 260, y: 273, size: 12, color: rgb(0, 0, 0), font: boldFont,
    })
  }

  page.drawText(Number(issuedAmountValue.value).toFixed(2), {
    x: 90, y: 248, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(dayNum, {
    x: 137, y: 197, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(monthName.toUpperCase(), {
    x: 225, y: 197, size: 14, color: rgb(0, 0, 0), font: boldFont,
  })
  page.drawText(issuedByValue.value.toUpperCase(), {
    x: 350, y: 65, size: 12, color: rgb(0, 0, 0), font: boldFont,
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

.field.full {
  grid-column: 1 / -1;
}

/* =========================
   LASTNAME FIELD & DROPDOWN
========================= */

.lastname-field {
  position: relative;
}

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
  border-radius: 20px;
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

.dialog-cancel-btn .q-icon,
.dialog-goback-btn .q-icon {
  margin-right: 6px;
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