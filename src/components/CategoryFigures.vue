<template>
  <div class="dashboard-container">
    <div class="dashboard-title">DASHBOARD</div>

    <!-- CATEGORY CARDS -->
    <div class="dashboard-row">
      <div
        class="dashboard-card"
        v-for="item in categories"
        :key="item.name"
      >
        <!-- HEADER -->
        <div class="card-header">
          <q-icon :name="item.icon" size="22px" />
          <span>{{ item.name }}</span>
        </div>

        <!-- BODY -->
        <div class="card-body">
          <div class="card-row">
            <div class="label">BUDGET</div>
            <div class="value">{{ formatPeso(item.totalBudget) }}</div>
          </div>

          <div class="card-row">
            <div class="label">NO. OF PATIENTS</div>
            <div class="value">{{ item.totalPatients }}</div>
          </div>

          <div class="card-row">
            <div class="label">AMOUNT RELEASED</div>
            <div class="value">{{ formatPeso(item.totalReleased) }}</div>
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
          <!-- Total Patients (Left) -->
          <div class="total-left">
            <div class="total-item">
              <div class="amount-title">TOTAL PATIENTS</div>
              <div class="amount-titles">{{ totalPatients }}</div>
            </div>
          </div>

          <!-- Divider (Center) -->
          <div class="vertical-divider"></div>

          <!-- Total Amount Released (Right) -->
          <div class="total-right">
            <div class="total-item">
              <div class="amount-title2">TOTAL AMOUNT RELEASED</div>
              <div class="amount-titles2">{{ formatPeso(totalAmount) }}</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- MONTHLY CATERED PATIENTS CHART -->
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
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js/auto'

Chart.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

// Category Cards Data
const categories = ref([
  { name: 'MEDICINE', icon: 'medication', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 },
  { name: 'LABORATORY', icon: 'science', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 },
  { name: 'HOSPITAL', icon: 'local_hospital', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 }
])

// Total Patients & Amount Data
const totalPatients = ref(0)
const totalAmount = ref(0)

// Monthly Chart Reference
const monthlyCateredPatients = ref(null)

// Format Currency
const formatPeso = (amount) => {
  if (amount == null) return '₱0.00'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

// Fetch All Data on Mount
onMounted(async () => {
  try {
    // Fetch Category Cards Data
    const categoryRes = await axios.get('http://localhost:8000/api/category-cards')
    categories.value[0] = { ...categories.value[0], ...categoryRes.data.medicineData }
    categories.value[1] = { ...categories.value[1], ...categoryRes.data.laboratoryData }
    categories.value[2] = { ...categories.value[2], ...categoryRes.data.hospitalData }

    // Fetch Total Patients & Amount
    const totalsRes = await axios.get('http://localhost:8000/api/total-patients-and-amount')
    totalPatients.value = totalsRes.data.totalPatients
    totalAmount.value = totalsRes.data.totalAmount

    // Fetch Monthly Patients Data
    const monthlyRes = await axios.get('http://localhost:8000/api/monthly-patients')

    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    const dataMedicine = months.map(m => monthlyRes.data.monthlyCounts.Medicine[m] ?? 0)
    const dataLaboratory = months.map(m => monthlyRes.data.monthlyCounts.Laboratory[m] ?? 0)
    const dataHospital = months.map(m => monthlyRes.data.monthlyCounts.Hospital[m] ?? 0)

    // Create Chart
    new Chart(monthlyCateredPatients.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          { label: 'Medicine', data: dataMedicine, borderColor: '#0318fc', pointBackgroundColor: '#0318fc', borderWidth: 2 },
          { label: 'Laboratory', data: dataLaboratory, borderColor: '#fbff00', pointBackgroundColor: '#fbff00', borderWidth: 2 },
          { label: 'Hospital', data: dataHospital, borderColor: '#ff0000', pointBackgroundColor: '#ff0000', borderWidth: 2 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
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

/* TITLE */
.dashboard-title {
  font-size: 36px;
  font-weight: 700;
  margin: 20px 0;
  color: green;
}

/* CATEGORY CARDS GRID */
.dashboard-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

/* CATEGORY CARD */
.dashboard-card {
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  background: #ffffff;
  border: 2px solid grey;
  text-align: center;
  height: 100%;
  box-sizing: border-box;
}

/* CARD HEADER */
.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2e7d32;
  height: 28px;
}

/* CARD BODY */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* CARD ROW */
.card-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* LABEL */
.label {
  font-size: 13px;
  color: rgb(103, 103, 103);
  text-transform: uppercase;
  font-weight: 700;
  line-height: 1.2;
}

/* VALUE */
.value {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

/* DIVIDER */
.divider {
  border-top: 2px solid #ddd;
  margin: 4px 0;
  width: 100%;
}

/* REMAINING */
.remaining {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.remaining-label {
  color: green;
  font-weight: 700;
}

.remaining-value {
  font-size: 18px;
  font-weight: 700;
  color: #2e7d32;
  line-height: 1.2;
}

.negative .remaining-value {
  color: #d32f2f;
}

/* TOTALS CARD */
.totals-card {
  width: 100%;
  max-width: 100%;
  padding: 10px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: sans-serif;
  margin-bottom: 24px;
  box-sizing: border-box;
}

.totals-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  position: relative;
}

.total-left,
.total-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.total-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
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

/* Vertical Divider */
.vertical-divider {
  width: 2px;
  background-color: #000;
  align-self: stretch;
  margin: 0 10px;
}

/* CHART CARD */
.chart-card {
  width: 100%;
  max-width: 100%;
  margin-bottom: 24px;
  padding: 8px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: Arial, sans-serif;
  margin-bottom: -30px;
}

/* CHART TITLE */
.chart-title {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 10px;
}

/* CHART WRAPPER */
.chart-container {
  position: relative;
  width: 100%;
  height: 280px;
}

/* CANVAS */
canvas {
  width: 100% !important;
  height: 100% !important;
}

/* 📱 MOBILE */
@media (max-width: 600px) {
  .dashboard-title {
    font-size: 28px;
    text-align: center;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
  }

  .value {
    font-size: 15px;
  }

  .remaining-value {
    font-size: 16px;
  }

  .totals-container {
    flex-direction: column;
  }

  .vertical-divider {
    width: 80%;
    height: 2px;
    margin: 10px 0;
  }

  .total-left,
  .total-right {
    flex: 1 1 100%;
  }

  .chart-title {
    font-size: 16px;
  }

  .chart-container {
    height: 220px;
  }
}

/* 💻 LARGE SCREENS */
@media (min-width: 1400px) {
  .dashboard-row {
    grid-template-columns: repeat(3, 1fr);
  }

  .chart-container {
    height: 340px;
  }
}
</style>