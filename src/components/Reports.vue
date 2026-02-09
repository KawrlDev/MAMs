<template>
  <div
    class="toolbar-wrapper"
    :class="currentViewClass"
  >
    <div class="head">
      <span class="title">{{ titleText }}</span>

      <div class="tabs">
        <q-btn
          label="GENERAL SUMMARY"
          color="green"
          class="q-ml-lg tab-btn"
          @click="setView(GeneralSummary, 'GENERAL SUMMARY', 'general-summary-view')"
        />
        <q-btn
          label="BUDGET SUMMARY"
          color="green"
          class="q-ml-sm tab-btn"
          @click="setView(BudgetSummary, 'BUDGET SUMMARY', 'budget-summary-view')"
        />
      </div>
    </div>

    <br />

    <component :is="currentComponent" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import GeneralSummary from './GeneralSummary.vue'
import BudgetSummary from './BudgetSummary.vue'

// defaults
const currentComponent = ref(GeneralSummary)
const titleText = ref('GENERAL SUMMARY')
const currentViewClass = ref('general-summary-view')

function setView(component, title, viewClass) {
  currentComponent.value = component
  titleText.value = title
  currentViewClass.value = viewClass
}
</script>

<style scoped>
/* ===============================
   SHARED STYLES
================================ */
.toolbar-wrapper {
  width: 100%;
}

.head {
  font-size: 33px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: right;
  background-color: #0f601a;
  width: 100%;
  padding: 5px 10px;

  margin-bottom: -50px;

}

.title {
  width: 400px;
}

.tabs {
  display: flex;
  margin-left: auto;
   padding: 10px 5px;

}

.tab-btn {
  padding: 4px 12px !important;
  min-height: 32px !important;
   padding: 5px 10px;
}

/* ===============================
   GENERAL SUMMARY STYLES
   (edit freely)
================================ */
.general-summary-view {
  background-color: #f0fdf4;
}

.general-summary-view .head {
  background-color: #0f601a;
}

/* ===============================
   BUDGET SUMMARY STYLES
   (edit freely)
================================ */
.budget-summary-view {
  background-color: #fff7ed;
}

.budget-summary-view .head {
  background-color: #0f601a;
}
</style>