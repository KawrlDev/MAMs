<template>
    <div class="col-12 col-md-6">
        <div class="relative-position">
          <q-btn
            to="/patient-records"
            icon="close"
            flat
            round
            text-color="red"
            size="large"
            class="absolute-top-right"
            style="z-index: 1;"
          />
          <q-card flat bordered class="full-height">
            <PatientHistory />
          </q-card>
        </div>
      </div>
    <div>
        <AddPatientForm />
    </div>
</template>
<script setup>
import AddPatientForm from 'src/components/AddPatientForm.vue';
</script>
