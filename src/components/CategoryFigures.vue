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
  width: 1000px;
  padding: 10px;
  box-sizing: border-box;
  margin-left: -2.5%;
  margin-bottom: 1%;
}

/* CATEGORY GRID */
.dashboard-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-bottom: 24px;
}

/* CATEGORY CARD */
.enhanced-card {
  border-radius: 14px;
  border: 2px solid grey;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  text-align: center;
  overflow: hidden;
  padding: 0;
}

/* HEADER */
.enhanced-header {
  padding: 10px;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
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
  gap: 8px;
}

/* LABEL */
.label {
  font-size: 13px;
  font-weight: 700;
  background-color: green;
  padding: 4px 4px;
  border-radius: 4px;
  color: white;
  width: 100%;
  max-width: 200px;
  text-align: center;
  box-sizing: border-box;
}

/* VALUE */
.value {
  font-size: 20px;
  font-weight: 600;
  color: #23424b;
}

/* PATIENT VALUE */
.patient-value {
  font-size: 20px;
  font-weight: 600;
}

/* DIVIDER */
.divider {
  border-top: 2px solid #ddd;
  margin: 4px 0;
}

/* REMAINING */
.remaining {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.remaining-label {
  color: #000000;
  font-weight: 700;
  background-color: transparent;
  padding: 0;
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
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  margin-bottom: 24px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
}

.totals-container {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  flex-wrap: wrap;
}

.total-left,
.total-right {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.totals-header {
  padding: 16px;
  font-size: 16px;
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
  padding: 20px;
  flex: 1;
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
}

/* CHART CARD */
.chart-card {
  border-radius: 14px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
  margin-bottom: -10%;
  margin-top: -2%;
}

.chart-header {
  padding: 16px;
  font-size: 16px;
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
  height: 280px;
  position: relative;
  padding: 16px;
}

/* TABLET */
@media (max-width: 1024px) {
  .dashboard-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .totals-container {
    gap: 12px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 24px;
  }

  .chart-container {
    height: 250px;
  }
}

/* MOBILE */
@media (max-width: 600px) {
  .dashboard-container {
    padding: 8px;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .enhanced-header {
    font-size: 14px;
    padding: 12px;
  }

  .totals-header,
  .chart-header {
    font-size: 14px;
    padding: 12px;
  }

  .card-body {
    padding: 12px;
  }

  .totals-container {
    flex-direction: column;
  }

  .vertical-divider {
    display: none;
  }

  .total-left,
  .total-right {
    width: 100%;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 24px;
  }

  .chart-container {
    height: 200px;
    padding: 12px;
  }
}

</style>
