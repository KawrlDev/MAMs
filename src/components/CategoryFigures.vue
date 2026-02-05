<template>
  <div class="dashboard-container">

    <!-- CATEGORY CARDS -->
    <div class="dashboard-row">
      <div
        class="dashboard-card enhanced-card"
        v-for="item in categories"
        :key="item.name"
      >

        <!-- HEADER -->
        <div class="card-header enhanced-header">
          <q-icon :name="item.icon" size="22px" />
          <span>{{ item.name }}</span>
        </div>

        <!-- BODY -->
        <div class="card-body">

          <div class="card-row">
            <div class="label">BUDGET</div>
            <div class="value highlight-value">
              {{ formatPeso(item.totalBudget) }}
            </div>
          </div>
          <div class="divider"></div>

          <div class="card-row">
            <div class="label">NO. OF PATIENTS</div>
            <div class="value patient-value">
              {{ item.totalPatients }}
            </div>
          </div>
          <div class="divider"></div>

          <div class="card-row">
            <div class="label">AMOUNT RELEASED</div>
            <div class="value highlight-value">
              {{ formatPeso(item.totalReleased) }}
            </div>
          </div>
          <div class="divider"></div>

          <div class="remaining" :class="{ negative: item.remaining < 0 }">
            <div class="label remaining-label">REMAINING BALANCE</div>
            <div class="value remaining-value">
              {{ formatPeso(item.remaining) }}
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- TOTAL PATIENTS & AMOUNT CARD -->
    <q-card class="totals-card">
      <q-card-section>
        <div class="totals-container">
          <div class="total-left">
            <div class="total-item">
              <div class="amount-title">TOTAL PATIENTS</div>
              <div class="amount-titles">{{ totalPatients }}</div>
            </div>
          </div>

          <div class="vertical-divider"></div>

          <div class="total-right">
            <div class="total-item">
              <div class="amount-title2">TOTAL AMOUNT RELEASED</div>
              <div class="amount-titles2">{{ formatPeso(totalAmount) }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- MONTHLY CHART -->
    <q-card class="chart-card">
      <q-card-section class="text-center">
        <div class="chart-title">MONTHLY CATERED PATIENTS</div>
        <div class="chart-container">
          <canvas ref="monthlyCateredPatients"></canvas>
        </div>
      </q-card-section>
    </q-card>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Chart } from 'chart.js/auto'

const categories = ref([
  { name: 'MEDICINE', icon: 'medication', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 },
  { name: 'LABORATORY', icon: 'science', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 },
  { name: 'HOSPITAL', icon: 'local_hospital', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 }
])

const totalPatients = ref(0)
const totalAmount = ref(0)
const monthlyCateredPatients = ref(null)

const formatPeso = (amount) => {
  if (amount == null) return '₱0.00'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

onMounted(async () => {
  try {

    const categoryRes = await axios.get('http://localhost:8000/api/category-cards')
    categories.value[0] = { ...categories.value[0], ...categoryRes.data.medicineData }
    categories.value[1] = { ...categories.value[1], ...categoryRes.data.laboratoryData }
    categories.value[2] = { ...categories.value[2], ...categoryRes.data.hospitalData }

    const totalsRes = await axios.get('http://localhost:8000/api/total-patients-and-amount')
    totalPatients.value = totalsRes.data.totalPatients
    totalAmount.value = totalsRes.data.totalAmount

    const monthlyRes = await axios.get('http://localhost:8000/api/monthly-patients')

    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    const dataMedicine = months.map(m => monthlyRes.data.monthlyCounts.Medicine[m] ?? 0)
    const dataLaboratory = months.map(m => monthlyRes.data.monthlyCounts.Laboratory[m] ?? 0)
    const dataHospital = months.map(m => monthlyRes.data.monthlyCounts.Hospital[m] ?? 0)

    new Chart(monthlyCateredPatients.value, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [
          { label: 'Medicine', data: dataMedicine, borderColor: '#0318fc', borderWidth: 2 },
          { label: 'Laboratory', data: dataLaboratory, borderColor: '#fbff00', borderWidth: 2 },
          { label: 'Hospital', data: dataHospital, borderColor: '#ff0000', borderWidth: 2 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })

  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>

/* CONTAINER */
.dashboard-container {
  width: 100%;
  padding: 10px;
}

/* CATEGORY GRID */
.dashboard-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

/* CATEGORY CARD */
.enhanced-card {
  border-radius: 14px;
  border: 2px solid grey;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  text-align: center;
}

/* HEADER */
.enhanced-header {
  padding: 14px;
  font-size: 15px;
  font-weight: 700;
  color: #2e7d32;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

/* BODY */
.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ROW */
.card-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* LABEL */
.label {
  font-size: 13px;
  color: rgb(103, 103, 103);
  font-weight: 700;
}

/* VALUE */
.value {
  font-size: 16px;
  font-weight: 600;
  color: #23424b;
}

/* PATIENT VALUE */
.patient-value {
  font-size: 16px;
  font-weight: 600;
}

/* DIVIDER */
.divider {
  border-top: 2px solid #ddd;
  margin: 4px 0;
}

/* REMAINING */
.remaining-label {
  color: green;
  font-weight: 700;
}

.remaining-value {
  font-size: 18px;
  font-weight: 700;
  color: #2e7d32;
}

.negative .remaining-value {
  color: #d32f2f;
}

/* TOTAL CARD */
.totals-card {
  width: 100%;
  padding: 10px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  margin-bottom: 24px;
}

.totals-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.amount-title,
.amount-title2 {
  font-weight: 700;
  font-size: 15px;
  color: green;
}

.amount-titles,
.amount-titles2 {
  font-weight: 700;
  font-size: 30px;
  color: rgb(153, 0, 0);
}

.vertical-divider {
  width: 2px;
  background-color: #000;
  align-self: stretch;
  margin: 0 10px;
}

/* CHART CARD */
.chart-card {
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
}

.chart-container {
  height: 280px;
}

/* MOBILE */
@media (max-width: 600px) {
  .dashboard-row {
    grid-template-columns: 1fr;
  }
}

</style>
