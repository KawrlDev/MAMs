<script setup>
import PatientDetails from 'src/components/PatientDetails.vue'
import PatientHistory from 'src/components/PatientHistory.vue'
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- LEFT: PATIENT DETAILS -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="full-height">
          <PatientDetails />
        </q-card>
      </div>

      <!-- RIGHT: PATIENT HISTORY -->
      <div class="col-12 col-md-6">
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
.full-height {
  height: 100%;
}

.absolute-top-right {
  position: absolute;
  top: -45px;
  right: -10px;
}
</style>