<template>
  <div class="page-bg">
    <div class="form-container settings-block">
      <h4>ELIGIBILITY PERIOD</h4>

      <!-- DAYS INPUT -->
      <q-input
        v-model="days"
        type="text"
        outlined
        dense
        class="q-mb-sm"
        placeholder="Enter number of days"
        @input="days = days.replace(/[^0-9]/g, '')"
      />

      <!-- ACTION BUTTONS -->
      <div class="actions">
        <q-btn
          label="CANCEL"
          icon="close"
          unelevated
          class="btn-cancel"
          @click="showCancelDialog = true"
        />
        <q-btn
          label="SAVE"
          icon="save"
          unelevated
          class="btn-save"
          @click="showSaveDialog = true"
        />
      </div>

      <!-- CANCEL CONFIRMATION DIALOG -->
      <q-dialog v-model="showCancelDialog">
        <q-card style="min-width: 360px; border-radius: 8px;">
          <q-card-section>
            <div class="text-h6">Cancel Changes?</div>
          </q-card-section>
          <q-card-section class="q-pt-none q-pb-md">
            Are you sure you want to cancel? All unsaved changes will be lost.
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
              class="dialog-cancel-btn"
              @click="handleCancelConfirm"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- SAVE CONFIRMATION DIALOG -->
      <q-dialog v-model="showSaveDialog">
        <q-card style="min-width: 360px; border-radius: 8px;">
          <q-card-section>
            <div class="text-h6">Save Changes?</div>
          </q-card-section>
          <q-card-section class="q-pt-none q-pb-md">
            Are you sure you want to save the eligibility period?
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
              class="dialog-cancel-btn"
              @click="updatePeriod"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const days = ref('')

const showCancelDialog = ref(false)
const showSaveDialog = ref(false)

// Cancel confirmation
const handleCancelConfirm = () => {
  days.value = ''
  showCancelDialog.value = false
  $q.notify({ type: 'info', message: 'Changes canceled' })
}

// Save confirmation
const updatePeriod = async () => {
  showSaveDialog.value = false

  if (!days.value) {
    $q.notify({ type: 'negative', message: 'Please enter a value' })
    return
  }

  try {
    await axios.post('http://localhost:8000/api/update-eligibility', {
      days: parseInt(days.value)
    })

    $q.notify({ type: 'positive', message: 'Eligibility Updated Successfully' })

  } catch {
    $q.notify({ type: 'negative', message: 'Error updating eligibility' })
  }
}
</script>

<style scoped>
.page-bg {
  background: #ffffff;
  padding: 30px;
}

.form-container {
  background: #ffffff;
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 25px 30px 35px;
}

.form-container h4 {
  font-weight: 700;
  margin: 5px 0 20px 0;
  color: #1f8f2e;
}

.q-mb-sm {
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.actions .q-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  color: white;
}

.actions .q-btn:hover {
  filter: brightness(110%);
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
  min-width: 80px;
}

.dialog-goback-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
  min-width: 80px;
}

.dialog-cancel-btn .q-icon,
.dialog-goback-btn .q-icon {
  margin-right: 6px;
}
</style>
