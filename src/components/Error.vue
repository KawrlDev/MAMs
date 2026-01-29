<template>
    <q-layout>
        <q-page-container>
            <q-layout>
                <q-page class="flex flex-center column text-center">
                    <h1 class="text-h1 text-bold error-title">404</h1>

                    <p class="text-h6 q-mb-md error-subtitle">
                        Error Not Found
                    </p>

                    <p class="text-grey-6 q-mb-lg">
                        The page you are trying to access does not exist.
                    </p>

                    <q-btn 
                        class="go-back-btn" 
                        icon="arrow_back" 
                        label="Go Back" 
                        @click="goBack" 
                        unelevated
                    />
                </q-page>
            </q-layout>
        </q-page-container>
    </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    router.push('/')
}
</script>

<style scoped>
.error-title {
    color: #1f8f2e;
}

.error-subtitle {
    color: #1f8f2e;
    font-weight: 600;
}

.go-back-btn {
    background: #0aa64f;
    color: white;
    font-weight: 600;
    padding: 8px 24px;
}

.go-back-btn:hover {
    background: #1f8f2e;
}
</style>