<template>
  <div class="page-bg">
    <q-form ref="transferForm" class="form-container">
      <h4>TRANSFER BUDGET</h4>

      <div class="content">

        <!-- FROM -->
        <div class="budget-block">
          <h3>FROM</h3>
          <label>SELECT SOURCE: <span>*</span></label>
          <q-select v-model="fromSource" dense outlined :options="categories" placeholder="SELECT SOURCE"
            class="amount-input" />
        </div>

        <!-- TO -->
        <div class="budget-block">
          <h3>TO</h3>
          <label>SELECT DESTINATION: <span>*</span></label>
          <q-select v-model="toDestination" dense outlined :options="filteredCategories"
            placeholder="SELECT DESTINATION" class="amount-input" />
        </div>

        <!-- AMOUNT -->
        <div class="budget-block">
          <h3>AMOUNT</h3>
          <label>TRANSFER AMOUNT: <span>*</span></label>
          <q-input v-model="transferAmount" dense outlined type="text" placeholder="AMOUNT" class="amount-input"
            @input="transferAmount = transferAmount.replace(/[^0-9]/g, '')" />
        </div>

        <div class="divider"></div>

        <div class="actions">
          <q-btn class="btn-cancel" icon="close" label="CANCEL" @click="showCancelDialog = true" dense />
          <q-btn class="btn-save" icon="swap_horiz" label="TRANSFER" @click="handleSaveClick" dense />
        </div>

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

        <!-- TRANSFER CONFIRMATION DIALOG -->
        <q-dialog v-model="showSaveDialog">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Transfer Budget?</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              Are you sure you want to transfer this amount?
            </q-card-section>

            <q-card-actions align="right" class="q-px-md q-pb-md">
              <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
              <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="confirmSave" />
            </q-card-actions>
          </q-card>
        </q-dialog>

      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const router = useRouter()
const $q = useQuasar()

const transferForm = ref(null)
const fromSource = ref(null)
const toDestination = ref(null)
const transferAmount = ref(null)
const showCancelDialog = ref(false)
const showSaveDialog = ref(false)

// The categories we can transfer between
const categories = ['MEDICINE', 'LABORATORY', 'HOSPITAL']

// Filtered TO options, disabling the same as FROM
const filteredCategories = computed(() => {
  return categories.filter(cat => cat !== fromSource.value)
})

const handleSaveClick = () => {
  if (fromSource.value && toDestination.value && transferAmount.value) {
    showSaveDialog.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Please complete all required fields before transferring',
      position: 'top'
    })
  }
}

const confirmSave = async () => {
  showSaveDialog.value = false

  try {
    // POST request to save the transfer record
    await axios.post('http://localhost:8000/api/transfer-budget', {
      year: new Date().getFullYear(),
      from: fromSource.value,
      to: toDestination.value,
      amount: parseInt(transferAmount.value),
      date_added: new Date().toISOString().split('T')[0] // yyyy-mm-dd
    })

    $q.notify({
      type: 'positive',
      message: 'Budget successfully transferred',
      position: 'top'
    })

    // Redirect to TransferBudgetTable page
    router.push('/transfer-budget-table')

  } catch (err) {
    console.log(err)
    $q.notify({
      type: 'negative',
      message: 'Error transferring budget. Try again.',
      position: 'top'
    })
  }
}

const handleCancel = () => {
  showCancelDialog.value = false
  router.push('/budget-table')
}
</script>

<style scoped>
.page-bg {
  background: #ffffff;
  padding: 30px;
}

.form-container {
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #ffffff;
  padding: 25px 30px 35px;
}

.page-bg h4 {
  font-weight: 700;
  margin: 5px;
  color: #1f8f2e;
}

.content {
  padding: 0px 20px;
}

.budget-block h3 {
  font-size: 19px;
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 0px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 6px;
  margin-left: 30px;
}

label span {
  color: red;
}

.amount-input :deep(.q-field__control) {
  background: #f0f0f0;
}

.divider {
  height: 2px;
  background: #dcdcdc;
  margin: 15px 0 8px;
}

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

/* Dialog Button Styling */
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
</style>
