<template>
  <q-card class="dashboard-card">
    <q-card-section class="text-center">
      <div class="text-h5 text-green-8 q-mb-sm amount-title">
        DISTRIBUTION SUMMARY
      </div>

      <div class="charts-container">
        <div class="chart-itemss">
          <p>PER CATEGORY</p>
          <canvas ref="perCategoryChart"></canvas>
        </div>

        <div class="chart-item">
          <p>PER SEX</p>
          <canvas ref="perSexChart"></canvas>
        </div>

        <div class="chart-items">
          <p>PER AGE BRACKET</p>
          <canvas ref="perAgeBracketChart"></canvas>
        </div>
      </div>

      <!-- Barangay Records Table Section -->
      <div class="text-h5 text-green-8 q-mb-sm barangay-title">PER BARANGAY</div>
      <div class="table-container">
        <q-table class="budget-table" :rows="rows" row-key="num" flat bordered dense :pagination="{ rowsPerPage: 0 }"
          style="height: 230px" virtual-scroll :virtual-scroll-sticky-size-start="48">
          <template v-slot:header>
            <tr class="sticky-header">
              <th rowspan="2">#</th>
              <th rowspan="2">Barangay</th>

              <th colspan="2">Medicine</th>
              <th colspan="2">Laboratory</th>
              <th colspan="2">Hospital</th>

              <th rowspan="2">Total Patients</th>
              <th rowspan="2">Total Amount</th>
            </tr>
            <tr class="sticky-header second-row">
              <th>Patients</th>
              <th>Amount</th>

              <th>Patients</th>
              <th>Amount</th>

              <th>Patients</th>
              <th>Amount</th>
            </tr>
          </template>

          <template v-slot:body="props">
            <tr>
              <td>{{ props.row.num }}</td>
              <td>{{ props.row.barangay }}</td>

              <td align="right">{{ props.row.medicinePatients }}</td>
              <td align="right">{{ formatPeso(props.row.medicineAmount) }}</td>

              <td align="right">{{ props.row.laboratoryPatients }}</td>
              <td align="right">{{ formatPeso(props.row.laboratoryAmount) }}</td>

              <td align="right">{{ props.row.hospitalPatients }}</td>
              <td align="right">{{ formatPeso(props.row.hospitalAmount) }}</td>

              <td align="right">{{ props.row.totalPatients }}</td>
              <td align="right">{{ formatPeso(props.row.totalAmount) }}</td>
            </tr>
          </template>
        </q-table>
      </div>

    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import axios from 'axios'

Chart.register(ChartDataLabels)
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const perCategoryChart = ref(null)
const perSexChart = ref(null)
const perAgeBracketChart = ref(null)
const rows = ref([])

onMounted(() => {
  const getAmountGiven = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/amount-given')
      const amountGivenPerMedicine = Number(res.data.medicine ?? 0)
      const amountGivenPerLaboratory = Number(res.data.laboratory ?? 0)
      const amountGivenPerHospital = Number(res.data.hospital ?? 0)
      const amountGivenPerMale = Number(res.data.perMale ?? 0)
      const amountGivenPerFemale = Number(res.data.perFemale ?? 0)
      const amountGiven0to1 = Number(res.data['0to1'] ?? 0)
      const amountGiven2to5 = Number(res.data['2to5'] ?? 0)
      const amountGiven6to12 = Number(res.data['6to12'] ?? 0)
      const amountGiven13to19 = Number(res.data['13to19'] ?? 0)
      const amountGiven20to39 = Number(res.data['20to39'] ?? 0)
      const amountGiven40to64 = Number(res.data['40to64'] ?? 0)
      const amountGiven65AndAbove = Number(res.data['65AndAbove'] ?? 0)
      
      const createDoughnut = (refEl, labels, data, colors) => {
        new Chart(refEl.value, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              label: 'Amount Given',
              data,
              backgroundColor: colors
            }]
          },
          options: {
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: ctx =>
                    `${ctx.dataset.label}: ${pesoFormatter.format(ctx.raw)}`
                }
              },
              legend: {
                display: true,
                position: 'top'
              },
              datalabels: {
                color: '#000',
                formatter: (v, c) =>
                  ((v / c.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%',
                font: {
                  weight: 'bold',
                  size: 14
                }
              }
            }
          },
          plugins: [ChartDataLabels]
        })
      }

      createDoughnut(
        perCategoryChart,
        ['Medicine', 'Laboratory', 'Hospital'],
        [amountGivenPerMedicine, amountGivenPerLaboratory, amountGivenPerHospital],
        ['#b5d6d6', '#b5d6b5', '#d6b5b5']
      )

      createDoughnut(
        perSexChart,
        ['Male', 'Female'],
        [amountGivenPerMale, amountGivenPerFemale],
        ['#B5EAD7', '#FFDAC1']
      )

      createDoughnut(
        perAgeBracketChart,
        ['0-1', '2-5', '6-12', '13-19', '20-39', '40-64', '65+'],
        [amountGiven0to1, amountGiven2to5, amountGiven6to12, amountGiven13to19, amountGiven20to39, amountGiven40to64, amountGiven65AndAbove],
        ['#A8E6CF', '#FFD3B6', '#FFAAA5', '#FFDAC1', '#E0BBE4', '#B5EAD7', '#C7CEEA']
      )
    } catch (err) {
      console.log(err)
    }
  }

  const getBarangayData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/barangay-records')
      rows.value = res.data.map((item, index) => ({
        num: index + 1,
        barangay: item.barangay,
        medicinePatients: item.medicinePatients,
        medicineAmount: item.medicineAmount,
        laboratoryPatients: item.laboratoryPatients,
        laboratoryAmount: item.laboratoryAmount,
        hospitalPatients: item.hospitalPatients,
        hospitalAmount: item.hospitalAmount,
        totalPatients: item.totalPatients,
        totalAmount: item.totalAmount
      }))
    } catch (err) {
      console.error('Failed to fetch barangay data:', err)
    }
  }

  const pesoFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  })
  
  getAmountGiven()
  getBarangayData()
})

const formatPeso = (amount) => {
  if (amount == null) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};
</script>

<style scoped>
.dashboard-card {
  flex: 0 0 800px;
  height: auto;
  padding: 15px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: Arial, sans-serif;
  margin-right: 40%;
  border: 2px solid grey;
  margin-left: 5px;
  margin-top: 86px;
  gap: 50%;
  position: relative;
  z-index: 1;
  margin-bottom: -7%;
}

.charts-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1%;
  flex-wrap: nowrap;
}

.chart-item {
  flex: 0 0 230px;
  text-align: center;
  margin-top: -35%;
  margin-bottom: 5%;
}

.chart-items {
  flex: 0 0 290px;
  text-align: center;
  margin-top: -4%;
  margin-bottom: 20%;
}

.chart-itemss {
  flex: 0 0 250px;
  text-align: center;
  margin-top: -15%;
  margin-bottom: 20%;
}

.chart-item p {
  font-size: 15px;
  margin-top: 60%;
  margin-bottom: 55px;
  font-weight: 700;
  color: green
}

.chart-items p {
  font-size: 15px;
  margin-top: 10%;
  margin-bottom: 1px;
  font-weight: 700;
  color: green
}

.chart-itemss p {
  font-size: 15px;
  margin-top: 40%;
  margin-bottom: 30px;
  font-weight: 700;
  color: green
}

.amount-title {
  font-weight: 700;
  margin-top: 1%;
  margin-bottom: 3%;
  color: black;
}

.barangay-title {
  font-weight: 700;
  margin-top: -80px;
  margin-bottom: 20px;
  color: black;
}

canvas {
  max-width: 1000%;
  height: 90px;
  margin-top: 10px;
}

.table-container {
  max-height: 320px;
  overflow-y: auto;
  margin-top: 5px;

}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
}

.sticky-header.second-row {
  top: 28px;
}

.sticky-header th {
  border-bottom: 1px solid #ccc;
}

:deep(thead tr) {
  display: table-row;
}

:deep(.sticky-header) {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

:deep(.sticky-header.second-row) {
  top: 28px;
}

:deep(.sticky-header th) {
  background: #1f8f2e;
  color: white;
  font-weight: 700;
  border-bottom: 1px solid #1b5e20;
  text-align: center;
}

.budget-table {
  overflow-y: auto;
}
</style>