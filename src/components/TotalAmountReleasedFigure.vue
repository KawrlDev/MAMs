<template>
  <div class="total-released-inner">
    <div class="text-h6 text-grey-8">Total Amount Released</div>
    <div class="text-h5 text-green-6 q-mt-sm">{{ releasedAmount.toLocaleString() }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const releasedAmount = ref(3000000);
</script>

<style scoped>
.total-released-inner {
  padding-top: 5px;
  border-top: 1px solid #e0e0e0;
  
}
</style>
