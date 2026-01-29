<template>
  <div class="page-bg">
    <q-form ref="budgetForm" @submit.prevent="createYearlyBudget" class="form-container">
      <h4>CREATE NEW YEARLY BUDGET</h4>

      <div class="content">
        <h2 class="section-header">WHOLE YEAR BUDGET</h2>
        <div class="budget-block">
          <h3>YEAR</h3>
          <q-input v-model="yearValue" dense outlined type="number" placeholder="AMOUNT" disable />
        </div>
        <div class="budget-block">
          <h3>MEDICINE</h3>
          <label>BUDGET: <span>*</span></label>
          <q-input v-model="medicineBudget" dense outlined type="number" placeholder="AMOUNT"
            :rules="[val => !!val || 'Required']" class="amount-input" />
        </div>

        <div class="budget-block">
          <h3>LABORATORY</h3>
          <label>BUDGET: <span>*</span></label>
          <q-input v-model="laboratoryBudget" dense outlined type="number" placeholder="AMOUNT"
            :rules="[val => !!val || 'Required']" class="amount-input" />
        </div>

        <div class="budget-block">
          <h3>HOSPITAL</h3>
          <label>BUDGET: <span>*</span></label>
          <q-input v-model="hospitalBudget" dense outlined type="number" placeholder="AMOUNT"
            :rules="[val => !!val || 'Required']" class="amount-input" />
        </div>

        <div class="divider"></div>

        <div class="actions">
          <RouterLink to="/budget-table">
            <q-btn class="btn-cancel" icon="close">CANCEL</q-btn>
          </RouterLink>
          <q-btn type="submit" class="btn-save" icon="add">SAVE</q-btn>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const router = useRouter()
const budgetForm = ref(null)
const medicineBudget = ref(null)
const laboratoryBudget = ref(null)
const hospitalBudget = ref(null)
const currentYear = new Date().getFullYear()
const yearValue = ref(currentYear)

const createYearlyBudget = async () => {
  const formData = new FormData()
  formData.append('year', yearValue.value)
  formData.append('medicine_budget', medicineBudget.value)
  formData.append('laboratory_budget', laboratoryBudget.value)
  formData.append('hospital_budget', hospitalBudget.value)
  try {
    const res = await axios.post('http://localhost:8000/api/create-yearly-budget', formData)
    router.push('/budget-table')
  } catch {
    console.log("error")
  }
}
</script>

<style scoped>
.page-bg {
  background: #ffffff;
  padding: 30px;
}

.form-container {
  background: #ffffff;
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #ffffff;
  padding: 25px 30px 35px;
}

.page-bg h4 {
  font-weight: 700;
  margin: 5px;
  color: #1f8f2e;
}

.content {
  padding: 0px 20px;
}

.content h2 {
  margin-bottom: 0px;
  margin-top: 0px;
}

.section-header {
  font-size: 25px;
  font-weight: 700;
}

.budget-block h3 {
  font-size: 19px;
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 0px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 6px;
  margin-left: 30px;
}

label span {
  color: red;
}

.amount-input :deep(.q-field__control) {
  background: #f0f0f0;
}

.divider {
  height: 2px;
  background: #dcdcdc;
  margin: 15px 0 8px;
}
</style>