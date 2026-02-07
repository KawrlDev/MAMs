<template>
    <div class="toolbar-wrapper">
        <div class="head" style="margin-left: 30px;">
            <span class="title">{{ titleText }}</span>

            <div class="tabs">
                <q-btn label="GENERAL SUMMARY" color="green" style="margin-left: 500px;"
                    @click="setView(GeneralSummary, 'General Summary')" />
                <q-btn label="DRMC FILES" color="green" style="margin-left: 10px;"
                    @click="setView(DrmcFiles, 'DRMC Files')" />
                <q-btn label="BUDGET SUMMARY" color="green" style="margin-left: 10px;"
                    @click="setView(BudgetSummary, 'Budget Summary')" />
            </div>
        </div>

        <br />

        <component :is="currentComponent" />
    </div>
</template>

<script setup>
import { ref } from 'vue'

import GeneralSummary from './GeneralSummary.vue'
import DrmcFiles from './DrmcFiles.vue'
import BudgetSummary from './BudgetSummary.vue'

// defaults
const currentComponent = ref(GeneralSummary)
const titleText = ref('GENERAL SUMMARY')

function setView(component, title) {
    currentComponent.value = component
    titleText.value = title
}
</script>

<style scoped>
.head {
    font-size: 33px;
    font-weight: 700;
    color: #1f8f2e;
    display: flex;
}

.title {
    width:400px;
}

.tabs {
    display: flex;
    align-items:flex-end;
}
</style>
