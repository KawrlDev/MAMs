<template>
  <div class="records-wrapper">
    <PatientTable />
  </div>
</template>

<script setup>
import PatientTable from 'src/components/PatientTable.vue'
</script>

<style scoped>
.records-wrapper {
  width: 100%;
  max-width: 1200px;   /* 👈 same width for toolbar & table */
  margin: 0 auto;     /* center it */
}
</style>
