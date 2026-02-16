<template>
  <div class="action-cell">
    <q-btn
      :to="`/patient-details/${row.uuid}`"
      flat
      round
      dense
      icon="visibility"
      color="green-8"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  row: {
    type: Object,
    required: true
  }
})

const { row } = props
</script>

<style scoped>
.link-icon {
  color: black;
}
.link-icon:hover {
  color: #145c1f;
}
</style>