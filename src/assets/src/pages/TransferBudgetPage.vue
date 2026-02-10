<template>
  <div class="relative-position">

    <q-btn to="/budget-table" icon="close" flat round text-color="red" size="large" class="absolute-top-right"
      style="z-index: 1; margin-top: -20px; margin-right: -20px;" />

    <TransferBudget />

  </div>
</template>

<script setup>
import TransferBudget from 'src/components/TransferBudget.vue';
</script>
