<template>
  <q-card class="dashboard-card">
    <q-card-section class="text-center">
      <div class="text-h5 text-green-8 q-mb-sm amount-title">MONTHLY CATERED PATIENTS</div>
      <div class="chart-container">
        <canvas ref="monthlyCateredPatients"></canvas>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineController, LineElement, PointElement } from 'chart.js/auto'
import axios from 'axios'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineController, LineElement, PointElement)

const monthlyCateredPatients = ref(null)

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/monthly-patients')

    // Extract data per category for months 1–12
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    const dataMedicine = months.map(m => res.data.monthlyCounts.Medicine[m] ?? 0)
    const dataLaboratory = months.map(m => res.data.monthlyCounts.Laboratory[m] ?? 0)
    const dataHospital = months.map(m => res.data.monthlyCounts.Hospital[m] ?? 0)
    const dataTotal = months.map(m => res.data.totalCounts[m] ?? 0)

    new Chart(monthlyCateredPatients.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          { label: 'Medicine', data: dataMedicine, borderColor: '#0318fc', pointBackgroundColor: '#0318fc', borderWidth: 1.5, fill: false },
          { label: 'Laboratory', data: dataLaboratory, borderColor: '#fbff00', pointBackgroundColor: '#fbff00', borderWidth: 1.5, fill: false },
          { label: 'Hospital', data: dataHospital, borderColor: '#ff0000', pointBackgroundColor: '#ff0000', borderWidth: 1.5, fill: false },
          { label: 'Total', data: dataTotal, borderColor: '#00ff11', pointBackgroundColor: '#00ff11', borderWidth: 1.5, fill: false },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw}`
            }
          },
          datalabels: {
            display: false
          }
        },
        scales: { 
          y: { 
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
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
.dashboard-card {
  flex: 0 0 40%;
  padding: 4px;
  text-align: center;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: Arial, sans-serif;
  height: 375px;
  margin-top: 2%;
  border: 2px solid grey;
  margin-left: 10px;
}

.amount-title {
  font-weight: 700;
}

/* Wrapper for the canvas to control sizing properly */
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

/* Remove !important and fixed dimensions - let Chart.js handle it */
canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>