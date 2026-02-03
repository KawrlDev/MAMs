<template>
  <div class="page-bg">
    <q-form ref="budgetForm" @submit.prevent="addSupplementaryBonus" class="form-container">
      <h4>ADD SUPPLEMENTARY BONUS</h4>

      <div class="content">
        <div class="budget-block">
          <h3>YEAR</h3>
          <q-input v-model="yearValue" dense outlined type="number" placeholder="AMOUNT" disable />
        </div>
        <div class="budget-block">
          <h3>MEDICINE</h3>
          <label>SUPPLEMENTARY BONUS: <span>*</span></label>
          <q-input v-model="medicineSupplementaryBudget" dense outlined type="number" placeholder="AMOUNT"
            :rules="[val => !!val || 'Required']" class="amount-input" />
        </div>

        <div class="budget-block">
          <h3>LABORATORY</h3>
          <label>SUPPLEMENTARY BONUS: <span>*</span></label>
          <q-input v-model="laboratorySupplementaryBudget" dense outlined type="number" placeholder="AMOUNT"
            :rules="[val => !!val || 'Required']" class="amount-input" />
        </div>

        <div class="budget-block">
          <h3>HOSPITAL</h3>
          <label>SUPPLEMENTARY BONUS: <span>*</span></label>
          <q-input v-model="hospitalSupplementaryBudget" dense outlined type="number" placeholder="AMOUNT"
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
import { RouterLink, useRouter } from 'vue-router';
const router = useRouter()
import { ref } from 'vue';
import axios from 'axios';
const budgetForm = ref(null)

const currentYear = new Date().getFullYear()
const yearValue = ref(currentYear)

const currentDate = new Date()
const dateValue = ref(currentDate.toISOString().slice(0, 10))

const medicineSupplementaryBudget = ref(null)
const laboratorySupplementaryBudget = ref(null)
const hospitalSupplementaryBudget = ref(null)

const addSupplementaryBonus = async () => {
  try {
    const formData = new FormData()
    formData.append('year', yearValue.value)
    formData.append('date_added', dateValue.value)
    formData.append('medicine_supplementary_bonus', medicineSupplementaryBudget.value)
    formData.append('laboratory_supplementary_bonus', laboratorySupplementaryBudget.value)
    formData.append('hospital_supplementary_bonus', hospitalSupplementaryBudget.value)
    const res = await axios.post('http://localhost:8000/api/add-supplementary-bonus', formData)
    router.push('/budget-table')
  } catch (err) {
    console.log(err)
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