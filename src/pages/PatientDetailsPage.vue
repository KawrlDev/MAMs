<script setup>
import PatientDetails from 'src/components/PatientDetails.vue'
import PatientHistory from 'src/components/PatientHistory.vue'
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- LEFT: PATIENT DETAILS -->
      <div class="col-12 col-md-6 details-col">
        <q-card flat bordered class="full-height">
          <PatientDetails />
        </q-card>
      </div>

      <!-- RIGHT: PATIENT HISTORY -->
      <div class="col-12 col-md-6 history-col">
        <div class="relative-position">
          <q-btn to="/patient-records" icon="close" flat round text-color="red" size="large" class="absolute-top-right"
            style="z-index: 1;" />
          <q-card flat bordered class="full-height">
            <PatientHistory />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
}

.close-btn-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 4px 8px 0 8px;
  background: #1f8f2e;
}

@media screen and (max-width: 1023px) {
  .history-col {
    order: -1;
  }

  .details-col {
    order: 1;
  }
}
@media screen and (max-width: 768px) {
  .history-col {
    order: -1;
  }

  .details-col {
    order: 1;
  }
}
@media screen and (max-width: 480px) {
  .history-col {
    order: -1;
  }

  .details-col {
    order: 1;
  }
}
</style>