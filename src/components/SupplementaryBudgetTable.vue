<template>
  <div class="budget-card">
    <div class="section-header">
      <h4>Supplemental Budget</h4>

      <div class="header-buttons">
        <!-- TRANSFER BUDGET BUTTON -->
        <q-btn 
          icon="swap_horiz" 
          label="TRANSFER BUDGET" 
          class="transfer-btn" 
          @click="showTransferDialog = true"
        />
        
        <!-- ADD BUDGET BUTTON -->
        <RouterLink to="/add-supplementary-bonus">
          <q-btn icon="add" label="ADD SUPPLEMENTAL BUDGET" class="add-btn" />
        </RouterLink>
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      class="budget-table"
      :rows-per-page-options="[5, 10, 15, 20, 0]"
    />

    <!-- TRANSFER BUDGET DIALOG -->
    <q-dialog v-model="showTransferDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-h5">Transfer Budget</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form ref="transferForm">
            <!-- FROM -->
            <div class="form-group">
              <label>FROM: <span class="required">*</span></label>
              <q-select
                v-model="transferData.from"
                dense
                outlined
                :options="categories"
                placeholder="SELECT SOURCE"
                @update:model-value="validateTransfer"
              />
            </div>

            <!-- TO -->
            <div class="form-group">
              <label>TO: <span class="required">*</span></label>
              <q-select
                v-model="transferData.to"
                dense
                outlined
                :options="filteredCategories"
                placeholder="SELECT DESTINATION"
                @update:model-value="validateTransfer"
              />
            </div>

            <!-- AMOUNT -->
            <div class="form-group">
              <label>TRANSFER AMOUNT: <span class="required">*</span></label>
              <q-input
                v-model="transferData.amount"
                dense
                outlined
                type="text"
                placeholder="AMOUNT"
                @input="transferData.amount = transferData.amount.replace(/[^0-9]/g,'')"
                @update:model-value="validateTransfer"
              />
            </div>

            <!-- VALIDATION MESSAGE -->
            <div v-if="validationMessage" class="validation-message" :class="validationClass">
              <q-icon :name="validationIcon" size="20px" class="q-mr-sm" />
              {{ validationMessage }}
            </div>

            <!-- BUDGET BREAKDOWN (shown when validation successful) -->
            <div v-if="isValid && budgetBreakdown" class="budget-breakdown">
              <h6>Budget Breakdown for {{ transferData.from }}</h6>
              <div class="breakdown-row">
                <span>Annual Budget:</span>
                <span>₱{{ formatCurrency(budgetBreakdown.annual) }}</span>
              </div>
              <div class="breakdown-row">
                <span>Total Supplemental:</span>
                <span>₱{{ formatCurrency(budgetBreakdown.supplemental) }}</span>
              </div>
              <div class="breakdown-row">
                <span>Amount Given:</span>
                <span class="negative">-₱{{ formatCurrency(budgetBreakdown.given) }}</span>
              </div>
              <div class="breakdown-row">
                <span>Transfer Amount:</span>
                <span class="negative">-₱{{ formatCurrency(transferData.amount) }}</span>
              </div>
              <div class="breakdown-row total">
                <span>Remaining Balance:</span>
                <span :class="budgetBreakdown.remaining >= 0 ? 'positive' : 'negative'">
                  ₱{{ formatCurrency(budgetBreakdown.remaining) }}
                </span>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn 
            unelevated 
            icon="close" 
            label="CANCEL" 
            class="dialog-cancel-btn" 
            v-close-popup 
          />
          <q-btn 
            unelevated 
            icon="swap_horiz" 
            label="TRANSFER" 
            class="dialog-confirm-btn" 
            @click="confirmTransfer"
            :disable="!isValid"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const $q = useQuasar()

const rows = ref([])
const showTransferDialog = ref(false)
const transferForm = ref(null)
const validationMessage = ref('')
const isValid = ref(false)
const budgetBreakdown = ref(null)

const transferData = ref({
  year: new Date().getFullYear(),
  from: null,
  to: null,
  amount: ''
})

const categories = ['MEDICINE', 'LABORATORY', 'HOSPITAL']

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'year', label: 'Year', field: 'year', align: 'center', sortable: true },
  { name: 'addedOn', label: 'Added on', field: 'date_added', align: 'center', sortable: true },
  { name: 'medicine', label: 'Supplemental Medicine Bonus', field: 'medicine_supplementary_bonus', align: 'center', sortable: true, format: val => formatCurrency(val) },
  { name: 'lab', label: 'Supplemental Laboratory Bonus', field: 'laboratory_supplementary_bonus', align: 'center', sortable: true, format: val => formatCurrency(val) },
  { name: 'hospital', label: 'Supplemental Hospital Bonus', field: 'hospital_supplementary_bonus', align: 'center', sortable: true, format: val => formatCurrency(val) }
]

// Filtered TO options, excluding the FROM selection
const filteredCategories = computed(() => {
  return categories.filter(cat => cat !== transferData.value.from)
})

// Validation class for styling
const validationClass = computed(() => {
  return isValid.value ? 'success' : 'error'
})

// Validation icon
const validationIcon = computed(() => {
  return isValid.value ? 'check_circle' : 'error'
})

// Format currency helper
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0.00'
  return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Validate transfer
const validateTransfer = async () => {
  // Reset validation
  validationMessage.value = ''
  isValid.value = false
  budgetBreakdown.value = null

  // Check if all fields are filled
  if (!transferData.value.from || !transferData.value.to || !transferData.value.amount) {
    validationMessage.value = 'Please complete all required fields'
    return
  }

  const amount = parseInt(transferData.value.amount)
  if (amount <= 0) {
    validationMessage.value = 'Transfer amount must be greater than zero'
    return
  }

  try {
    // Fetch budget data for validation
    const response = await axios.post('http://localhost:8000/api/validate-transfer', {
      year: transferData.value.year,
      category: transferData.value.from,
      amount: amount
    })

    const data = response.data

    if (data.success) {
      isValid.value = true
      budgetBreakdown.value = data.breakdown
      validationMessage.value = 'Transfer is valid. Budget will remain positive.'
    } else {
      isValid.value = false
      budgetBreakdown.value = data.breakdown
      validationMessage.value = data.message
    }
  } catch (err) {
    console.error('Validation error:', err)
    validationMessage.value = 'Error validating transfer. Please try again.'
    isValid.value = false
  }
}

// Confirm transfer
const confirmTransfer = async () => {
  if (!isValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Cannot transfer. Budget validation failed.',
      position: 'top'
    })
    return
  }

  try {
    // Create supplemental budget entry for transfer
    const fromAmount = transferData.value.from === 'MEDICINE' ? -parseInt(transferData.value.amount) :
                       transferData.value.from === 'LABORATORY' ? 0 : 0
    const toAmount = transferData.value.to === 'MEDICINE' ? parseInt(transferData.value.amount) : 0
    
    const labFrom = transferData.value.from === 'LABORATORY' ? -parseInt(transferData.value.amount) : 0
    const labTo = transferData.value.to === 'LABORATORY' ? parseInt(transferData.value.amount) : 0
    
    const hospFrom = transferData.value.from === 'HOSPITAL' ? -parseInt(transferData.value.amount) : 0
    const hospTo = transferData.value.to === 'HOSPITAL' ? parseInt(transferData.value.amount) : 0

    await axios.post('http://localhost:8000/api/add-supplementary-bonus', {
      year: transferData.value.year,
      date_added: new Date().toISOString().split('T')[0],
      medicine_supplementary_bonus: fromAmount + toAmount,
      laboratory_supplementary_bonus: labFrom + labTo,
      hospital_supplementary_bonus: hospFrom + hospTo
    })

    $q.notify({
      type: 'positive',
      message: `Successfully transferred ₱${formatCurrency(transferData.value.amount)} from ${transferData.value.from} to ${transferData.value.to}`,
      position: 'top'
    })

    // Reset form and close dialog
    transferData.value = {
      year: new Date().getFullYear(),
      from: null,
      to: null,
      amount: ''
    }
    showTransferDialog.value = false
    
    // Refresh table
    await getSupplementaryBudget()
  } catch (err) {
    console.error('Transfer error:', err)
    $q.notify({
      type: 'negative',
      message: 'Error transferring budget. Please try again.',
      position: 'top'
    })
  }
}

// Fetch supplementary budget
const getSupplementaryBudget = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/supplementary-bonus')
    rows.value = res.data
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  getSupplementaryBudget()
})
</script>

<style scoped>
.budget-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  font-weight: 700;
  margin: 5px;
  color: #1f8f2e;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.transfer-btn {
  background: #ff9800;
  color: #ffffff;
  font-weight: 600;
}

.add-btn {
  background: #0aa64f;
  color: #ffffff;
  font-weight: 600;
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

/* Dialog Styles */
.dialog-header {
  background: #1f8f2e;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.dialog-header .q-btn {
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.required {
  color: #ff3b3b;
}

.validation-message {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.validation-message.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.validation-message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.budget-breakdown {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin-top: 16px;
}

.budget-breakdown h6 {
  margin: 0 0 12px 0;
  font-weight: 700;
  color: #1f8f2e;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.breakdown-row:last-child {
  border-bottom: none;
}

.breakdown-row.total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #1f8f2e;
  font-weight: 700;
  font-size: 16px;
}

.breakdown-row .negative {
  color: #c62828;
}

.breakdown-row .positive {
  color: #2e7d32;
}

.dialog-cancel-btn {
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

.dialog-confirm-btn:disabled {
  background: #ccc !important;
  cursor: not-allowed;
}
</style>