<template>
    <AddSupplementaryBonusField />
</template>
<script setup>
import AddSupplementaryBonusField from 'src/components/AddSupplementaryBonusField.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
const data = JSON.parse(localStorage.getItem('user'))
const role = data.ROLE
const router = useRouter()

onMounted(() => {
    if (role !== 'HEAD' && role !== 'ADMIN') {
        router.push('/error')
    }
})
</script>