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
      <div class="totals-container">
        <div class="total-left">
          <!-- HEADER -->
          <div class="totals-header">TOTAL PATIENTS CATERED</div>
          <div class="total-item">
            <div class="amount-titles">{{ totalPatients }}</div>
          </div>
        </div>

        <div class="vertical-divider"></div>

        <div class="total-right">
          <!-- HEADER -->
          <div class="totals-header">TOTAL AMOUNT RELEASED</div>
          <div class="total-item">
            <div class="amount-titles2">{{ formatPeso(totalAmount) }}</div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- MONTHLY CHART -->
    <q-card class="chart-card">
      <!-- HEADER -->
      <div class="chart-header">MONTHLY CATERED PATIENTS</div>

      <q-card-section class="text-center">
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
  width: 70%;
  max-width: 500px;
  padding: clamp(8px, 1vw, 10px);
  box-sizing: border-box;
  margin-left: -1%;
  margin-right: auto;
  margin-bottom: 1%;
}

/* CATEGORY GRID */
.dashboard-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(12px, 2vw, 22px);
  margin-bottom: clamp(16px, 2vw, 24px);
}

/* CATEGORY CARD */
.enhanced-card {
  border-radius: clamp(10px, 1.2vw, 14px);
  border: 2px solid grey;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  text-align: center;
  overflow: hidden;
  padding: 0;
  transition: transform 0.2s ease;
}

/* HEADER */
.enhanced-header {
  padding: clamp(8px, 1vw, 10px);
  font-size: clamp(14px, 1.6vw, 18px);
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(6px, 1vw, 10px);
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

/* BODY */
.card-body {
  padding: clamp(12px, 1.5vw, 16px);
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1vw, 12px);
}

/* ROW */
.card-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 0.8vw, 8px);
}

/* LABEL */
.label {
  font-size: clamp(11px, 1.2vw, 13px);
  font-weight: 700;
  background-color: green;
  padding: 4px;
  border-radius: 4px;
  color: white;
  width: 100%;
  max-width: clamp(160px, 80%, 200px);
  text-align: center;
  box-sizing: border-box;
}

/* VALUE */
.value {
  font-size: clamp(16px, 1.8vw, 20px);
  font-weight: 600;
  color: #23424b;
}

/* PATIENT VALUE */
.patient-value {
  font-size: clamp(16px, 1.8vw, 20px);
  font-weight: 600;
}

/* DIVIDER */
.divider {
  border-top: 2px solid #ddd;
  margin: clamp(2px, 0.4vw, 4px) 0;
}

/* REMAINING */
.remaining {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 0.8vw, 8px);
}

.remaining-label {
  color: #000000;
  font-weight: 700;
  background-color: transparent;
  padding: 0;
}

.remaining-value {
  font-size: clamp(15px, 1.6vw, 18px);
  font-weight: 700;
  color: #2e7d32;
}

.negative .remaining-value {
  color: #d32f2f;
}

/* TOTAL CARD */
.totals-card {
  width: 100%;
  background: #ffffff;
  border-radius: clamp(10px, 1.2vw, 14px);
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  margin-bottom: clamp(16px, 2vw, 24px);
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
}

.totals-container {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.total-left,
.total-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.totals-header {
  padding: clamp(12px, 1.5vw, 16px);
  font-size: clamp(13px, 1.5vw, 16px);
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  text-align: center;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 2vw, 20px);
  flex: 1;
}

.amount-titles,
.amount-titles2 {
  font-weight: 700;
  font-size: clamp(20px, 2.8vw, 30px);
  color: rgb(153, 0, 0);
}

.vertical-divider {
  width: 2px;
  background-color: #000;
  align-self: stretch;
}

/* CHART CARD */
.chart-card {
  border-radius: clamp(10px, 1.2vw, 14px);
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
  margin-bottom: -8.5%;
  margin-top: 2%;
}

.chart-header {
  padding: clamp(12px, 1.5vw, 16px);
  font-size: clamp(13px, 1.5vw, 16px);
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  text-align: center;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.chart-container {
  height: clamp(200px, 25vw, 280px);
  position: relative;
  padding: clamp(12px, 1.5vw, 16px);
}

/* SMALL MOBILE (up to 480px) */
@media (max-width: 480px) {
  .dashboard-container {
    margin-left: 0;
    padding: 8px;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .enhanced-header {
    font-size: 14px;
    padding: 10px;
  }

  .card-body {
    padding: 12px;
  }

  .label {
    font-size: 11px;
  }

  .value,
  .patient-value {
    font-size: 16px;
  }

  .remaining-value {
    font-size: 15px;
  }

  .totals-container {
    flex-direction: column;
  }

  .vertical-divider {
    display: none;
  }

  .totals-header,
  .chart-header {
    font-size: 13px;
    padding: 10px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 22px;
  }

  .chart-container {
    height: 200px;
    padding: 12px;
  }
}

/* MOBILE (481px to 600px) */
@media (min-width: 481px) and (max-width: 600px) {
  .dashboard-container {
    margin-left: 0;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .totals-container {
    flex-direction: column;
  }

  .vertical-divider {
    display: none;
  }

  .chart-container {
    height: 220px;
  }
}

/* TABLET PORTRAIT (601px to 768px) */
@media (min-width: 601px) and (max-width: 768px) {
  .dashboard-container {
    max-width: 720px;
  }

  .dashboard-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .chart-container {
    height: 240px;
  }
}

/* TABLET LANDSCAPE (769px to 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard-container {
    max-width: 900px;
  }

  .dashboard-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .chart-container {
    height: 260px;
  }
}

/* DESKTOP SMALL (1025px to 1280px) */
@media (min-width: 1025px) and (max-width: 1280px) {
  .dashboard-container {
    max-width: 1000px;
  }

  .dashboard-row {
    gap: 20px;
  }

  .chart-container {
    height: 270px;
  }
}

/* DESKTOP MEDIUM (1281px to 1440px) */
@media (min-width: 1281px) and (max-width: 1440px) {
  .dashboard-container {
    max-width: 1100px;
  }

  .dashboard-row {
    gap: 22px;
  }

  .chart-container {
    height: 280px;
  }
}

/* DESKTOP LARGE (1441px to 1920px) */
@media (min-width: 1441px) and (max-width: 1920px) {
  .dashboard-container {
    max-width: 1200px;
  }

  .dashboard-row {
    gap: 24px;
  }

  .chart-container {
    height: 300px;
  }
}

/* ULTRA WIDE (1921px and above) */
@media (min-width: 1921px) {
  .dashboard-container {
    max-width: 1400px;
  }

  .dashboard-row {
    gap: 26px;
  }

  .chart-container {
    height: 320px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 34px;
  }
}

</style>