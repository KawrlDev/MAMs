<template>
  <q-layout view="hHh lpR fFf">

    <Navbar />

    <q-page-container>
      <RouterView />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import Navbar from 'src/components/Navbar.vue'
</script>
