<template>
  <!-- FIRST ROW: Cards -->
  <div class="dashboard-row">
    <CategoryFigures />
    <AmountGiven />
  </div>

  <!-- SECOND ROW: Total Patients figure -->
 

  <!-- THIRD ROW: Monthly Patients chart + Barangay table -->

  
</template>

<script setup>
import CategoryFigures from 'src/components/CategoryFigures.vue'
import TotalPatientsFigure from 'src/components/TotalPatientsFigure.vue'
import AmountGiven from 'src/components/AmountGiven.vue'
import MonthlyPatients from 'src/components/MonthlyPatients.vue'
</script>

<style scoped>
.dashboard-row {
  display: flex;
  flex-wrap: nowrap;    /* keep items in one row */
  gap: 10px;   /* horizontal scroll if needed */
  padding: 10px 0;

  margin-top: -30px;    /* ✅ allow overlap with previous row */
  position: relative;   /* required for proper stacking */
}
</style>