<!-- pages\DashboardPage.vue -->
<template>
  <!-- FIRST ROW: Cards -->
  <div class="dashboard-row">
    <CategoryFigures />
    <AmountGiven />
  </div>

  <!-- SECOND ROW: Total Patients figure -->
  <div class="dashboard-row">
    <TotalPatientsFigure />
  </div>

  <!-- THIRD ROW: Monthly Patients chart + Barangay table -->
  <div class="dashboard-row">
    <MonthlyPatients />
  </div>
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
  flex-wrap: nowrap;
  gap: 10px;
  padding: 10px 0;
  margin-top: -30px;
  position: relative;
}

/* Scale everything based on 1535px baseline */
@media (min-width: 1000px) {
  .dashboard-row {
    zoom: calc(100vw / 1535);
  }
}
@media (min-width: 1500px) and (max-width: 1600px) {
  .dashboard-row {
    zoom: 1;
  }
}

/* For larger screens, keep it at 100% or scale up slightly */
@media (min-width: 1601px) {
  .dashboard-row {
    zoom: calc(100vw / 1535);
  }
}
</style>