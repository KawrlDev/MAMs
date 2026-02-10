<template>
    <div class="column q-gutter-sm">
        <q-btn v-for="btn in sameNameUserRows" :key="btn.id" :label="btn.label" :color="btn.color" @click="onClick(btn.id)" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
const sameNameUserRows = ref([{ id: 1, label: "Button 1", color: "primary" },
{ id: 2, label: "Button 2", color: "secondary" },
{ id: 3, label: "Button 3", color: "accent" },])

function onClick(id) {
    console.log("Button", id, "clicked")
}
</script>