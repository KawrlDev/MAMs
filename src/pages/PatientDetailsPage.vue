<template>
  <q-page class="q-pa-md">
    <!-- MAIN LAYOUT -->
    <div class="row q-col-gutter-md">

  <!-- LEFT: PATIENT DETAILS -->
  <div class="col-12 col-md-6">
    <q-card flat bordered>
      <PatientDetails />
    </q-card>
  </div>

  <!-- RIGHT: PATIENT HISTORY (WIDER) -->
  <div class="col-12 col-md-6">
    <q-card flat bordered>
      <PatientHistory />
    </q-card>
  </div>

</div>


  </q-page>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import PatientDetails from 'src/components/PatientDetails.vue'
import PatientHistory from 'src/components/PatientHistory.vue'
</script>
