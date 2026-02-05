<template>
  <q-card class="dashboard-card">
    <q-card-section class="text-center">
      <div class="amount-title">DISTRIBUTION SUMMARY</div>

      <div class="charts-container">
        <div class="chart-item">
          <p>PER CATEGORY</p>
          <canvas ref="perCategoryChart" />
        </div>

        <div class="chart-item">
          <p>PER SEX</p>
          <canvas ref="perSexChart" />
        </div>

        <div class="chart-item">
          <p>PER AGE BRACKET</p>
          <canvas ref="perAgeBracketChart" />
        </div>
      </div>

      <div class="amount-title barangay-title">PER BARANGAY</div>

      <div class="table-container">
        <q-table
          class="budget-table"
          :rows="rows"
          row-key="num"
          flat
          bordered
          dense
          :pagination="{ rowsPerPage: 0 }"
          virtual-scroll
          :virtual-scroll-sticky-size-start="48"
        >
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
import { ref, onMounted, nextTick } from 'vue'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import axios from 'axios'

Chart.register(ChartDataLabels, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const perCategoryChart = ref(null)
const perSexChart = ref(null)
const perAgeBracketChart = ref(null)
const rows = ref([])

// Format PHP currency
const formatPeso = (amount) =>
  amount == null
    ? '₱0.00'
    : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)

onMounted(async () => {
  try {
    // Fetch barangay table
    const resBarangay = await axios.get('http://localhost:8000/api/barangay-records')
    rows.value = resBarangay.data.map((item, index) => ({
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

    // Fetch chart data
    const resChart = await axios.get('http://localhost:8000/api/amount-given')
    const chartData = resChart.data

    // Wait for DOM update
    await nextTick()

    const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

    const createDoughnut = (refEl, labels, data, colors) => {
      new Chart(refEl.value, {
        type: 'doughnut',
        data: { labels, datasets: [{ label: 'Amount Given', data, backgroundColor: colors }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${pesoFormatter.format(ctx.raw)}` } },
            legend: { display: true, position: 'top' },
            datalabels: {
              color: '#000',
              formatter: (v, c) =>
                ((v / c.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%',
              font: { size: 12 }
            }
          }
        },
        plugins: [ChartDataLabels]
      })
    }

    createDoughnut(
      perCategoryChart,
      ['Medicine', 'Laboratory', 'Hospital'],
      [
        parseFloat(chartData.medicine) || 0, 
        parseFloat(chartData.laboratory) || 0, 
        parseFloat(chartData.hospital) || 0
      ],
      ['#b5d6d6', '#b5d6b5', '#d6b5b5']
    )

    createDoughnut(
      perSexChart,
      ['Male', 'Female'],
      [
        parseFloat(chartData.perMale) || 0, 
        parseFloat(chartData.perFemale) || 0
      ],
      ['#B5EAD7', '#FFDAC1']
    )

    createDoughnut(
      perAgeBracketChart,
      ['0-1','2-5','6-12','13-19','20-39','40-64','65+'],
      [
        parseFloat(chartData['0to1']) || 0,
        parseFloat(chartData['2to5']) || 0,
        parseFloat(chartData['6to12']) || 0,
        parseFloat(chartData['13to19']) || 0,
        parseFloat(chartData['20to39']) || 0,
        parseFloat(chartData['40to64']) || 0,
        parseFloat(chartData['65AndAbove']) || 0
      ],
      ['#A8E6CF','#FFD3B6','#FFAAA5','#FFDAC1','#E0BBE4','#B5EAD7','#C7CEEA']
    )
  } catch (err) {
    console.error('Error loading data:', err)
  }
})
</script>

<style scoped>
.dashboard-card {
  width: 100%;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.33);
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  margin-top: 105px;
  margin-bottom: -20px;
}

.amount-title {
  font-weight: 700;
  font-size: 20px;
  color: #2e7d32;
  margin-bottom: 60px;
}

.barangay-title {
  font-weight: 700;
  font-size: 18px;
  color: #2e7d32;
  margin-top: 60px;
  margin-bottom: 40px;
}

/* Charts */
.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.chart-item {
  text-align: center;
}

.chart-item p {
  font-size: 15px;
  font-weight: 700;
  color: green;
  margin-bottom: 8px;
}

/* Make canvas responsive */
canvas {
  width: 100% !important;
  height: 200px !important;
}

/* Table */
.table-container {
  width: 100%;
  max-height: 350px;
  overflow-y: auto;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.sticky-header.second-row {
  top: 28px;
}

.sticky-header th {
  background: #1f8f2e;
  color: white;
  font-weight: 700;
  border-bottom: 1px solid #1b5e20;
  text-align: center;
  padding: 8px;
}

.budget-table {
  overflow-y: auto;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .charts-container {
    grid-template-columns: 1fr;
  }

  canvas {
    height: 220px !important;
  }
}

@media (min-width: 901px) and (max-width: 1200px) {
  .charts-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1400px) {
  canvas {
    height: 240px !important;
  }
}
</style>