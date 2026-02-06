<template>
  <q-card class="dashboard-card">
    <div class="amount-title">DISTRIBUTION SUMMARY</div>
    
    <q-card-section class="text-center card-content">
      <div class="charts-container">
        <div class="chart-item chart-medium">
          <p>PER CATEGORY</p>
          <canvas ref="perCategoryChart" />
        </div>

        <div class="chart-item chart-small">
          <p>PER SEX</p>
          <canvas ref="perSexChart" />
        </div>

        <div class="chart-item chart-large">
          <p>PER AGE BRACKET</p>
          <canvas ref="perAgeBracketChart" />
        </div>
      </div>

      <div class="barangay-title">PER BARANGAY</div>

      <div class="table-container">
        <q-table 
          class="budget-table" 
          :rows="rows" 
          row-key="num" 
          flat 
          bordered 
          dense 
          :pagination="pagination"
          @update:pagination="updatePagination"
          :rows-per-page-options="[5, 10, 15, 20]"
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import axios from 'axios'

Chart.register(ChartDataLabels, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const perCategoryChart = ref(null)
const perSexChart = ref(null)
const perAgeBracketChart = ref(null)
const rows = ref([])
const pagination = ref({ rowsPerPage: 5, page: 1 })

// Format PHP currency
const formatPeso = (amount) =>
  amount == null
    ? '₱0.00'
    : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)

const updatePagination = (newPagination) => {
  pagination.value = newPagination
}

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
      ['#4CAF50', '#2196F3', '#FF9800']
    )

    createDoughnut(
      perSexChart,
      ['Male', 'Female'],
      [
        parseFloat(chartData.perMale) || 0,
        parseFloat(chartData.perFemale) || 0
      ],
      ['#42A5F5', '#EC407A']
    )

    createDoughnut(
      perAgeBracketChart,
      ['0-1', '2-5', '6-12', '13-19', '20-39', '40-64', '65+'],
      [
        parseFloat(chartData['0to1']) || 0,
        parseFloat(chartData['2to5']) || 0,
        parseFloat(chartData['6to12']) || 0,
        parseFloat(chartData['13to19']) || 0,
        parseFloat(chartData['20to39']) || 0,
        parseFloat(chartData['40to64']) || 0,
        parseFloat(chartData['65AndAbove']) || 0
      ],
      ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCF7F', '#4ECDC4', '#45B7D1', '#9B59B6']
    )
  } catch (err) {
    console.error('Error loading data:', err)
  }
})
</script>

<style scoped>
.dashboard-card {
  width: 100%;
  padding: 0;
  background: #fff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.33);
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  margin-top: 10px;
  margin-bottom: -2.5%;
  margin-right: -2%;
  overflow: hidden;
  
}

.amount-title {
  font-weight: 900;
  font-size: 22px;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  padding: 8px 20px;
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.card-content {
  padding: 20px;
}

.barangay-title {
  font-weight: 900;
  font-size: 22px;
  color: #2e7d32;
  margin-top: 50px;
  margin-bottom: 30px;
}

/* Charts Container */
.charts-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3px;
  margin-bottom: 40px;
  padding: 0 10px;
  margin-top: 30px;
  margin-left: -4%;
}

.chart-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-item p {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 15px;
  letter-spacing: 0.3px;
}

/* Chart Sizes */
.chart-small {
  flex: 0 0 180px;
}

.chart-small canvas {
  width: 180px !important;
  height: 180px !important;
}

.chart-medium {
  flex: 0 0 220px;
}

.chart-medium canvas {
  width: 190px !important;
  height: 220px !important;
}

.chart-large {
  flex: 0 0 280px;
}

.chart-large canvas {
  width: 280px !important;
  height: 280px !important;
}

/* Table */
.table-container {
  width: 100%;
  border-radius: 8px;
  overflow-x: hidden;
}
.q-table__container {
  overflow-x: hidden !important;
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
  padding: 10px 8px;
  font-size: 13px;
}

.budget-table {
  width: 100%;
}

.budget-table td {
  padding: 8px;
  font-size: 13px;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .charts-container {
    flex-direction: column;
    gap: 30px;
  }

  .chart-small,
  .chart-medium,
  .chart-large {
    flex: 0 0 auto;
  }

  .chart-small canvas {
    width: 200px !important;
    height: 200px !important;
  }

  .chart-medium canvas {
    width: 240px !important;
    height: 240px !important;
  }

  .chart-large canvas {
    width: 280px !important;
    height: 280px !important;
  }
}

@media (min-width: 901px) and (max-width: 1200px) {
  .charts-container {
    gap: 20px;
    padding: 0 10px;
  }

  .chart-small {
    flex: 0 0 160px;
  }

  .chart-small canvas {
    width: 160px !important;
    height: 160px !important;
  }

  .chart-medium {
    flex: 0 0 200px;
  }

  .chart-medium canvas {
    width: 200px !important;
    height: 200px !important;
  }

  .chart-large {
    flex: 0 0 240px;
  }

  .chart-large canvas {
    width: 240px !important;
    height: 240px !important;
  }
}

@media (min-width: 1400px) {
  .chart-small {
    flex: 0 0 200px;
  }

  .chart-small canvas {
    width: 200px !important;
    height: 200px !important;
  }

  .chart-medium {
    flex: 0 0 250px;
  }

  .chart-medium canvas {
    width: 250px !important;
    height: 250px !important;
  }

  .chart-large {
    flex: 0 0 320px;
  }

  .chart-large canvas {
    width: 320px !important;
    height: 320px !important;
  }
}

@media (min-width: 1601px) {
  .dashboard-card {
    max-width: 1400px;
    margin: 86px auto 0;
  }

  .card-content {
    padding: 30px;
  }

  .chart-small {
    flex: 0 0 220px;
  }

  .chart-small canvas {
    width: 220px !important;
    height: 220px !important;
  }

  .chart-medium {
    flex: 0 0 280px;
  }

  .chart-medium canvas {
    width: 280px !important;
    height: 280px !important;
  }

  .chart-large {
    flex: 0 0 360px;
  }

  .chart-large canvas {
    width: 360px !important;
    height: 360px !important;
  }
}
</style>