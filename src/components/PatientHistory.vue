<template>
  <div class="budget-table">
    <q-table :rows="rows" :columns="columns" row-key="glNum">
      <!-- TOP BAR -->
      <template #top>
        <div class="row items-center full-width">
          <div class="text-h4 text-weight-bold text-green">
            Patient's History
          </div>
          <q-space />
          
        </div>
      </template>

      <!-- ELIGIBILITY DATE -->
      <template #body-cell-eligibilityDate="props">
        <q-td :class="props.row.eligibilityClass">
          {{ props.row.eligibilityDate }}

          <q-tooltip anchor="top middle" self="bottom middle" class="text-subtitle2 q-pa-xs" disable-reposition>
            <span v-if="props.row.daysRemaining > 0">
              Eligible in {{ props.row.daysRemaining }} day<span v-if="props.row.daysRemaining > 1">s</span>
            </span>
            <span v-else>
              Eligible
            </span>
          </q-tooltip>

        </q-td>
      </template>


      <!-- ACTION COLUMN -->
      <template #body-cell-action="props">
        <ActionBtn :row="props.row" />
      </template>
    </q-table>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ActionBtn from './ActionBtn.vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(isSameOrAfter)

const route = useRoute()
const glNum = computed(() => route.params.glNum)

const rows = ref([])
const columns = [
  { name: 'GL No.', label: 'GL No.', field: 'glNum', align: 'right' },
  { name: 'Category', label: 'Category', field: 'category' },
  { name: 'Issued At', label: 'Date Issued', field: 'issuedAt' },
  { name: 'eligibilityDate', label: 'Eligibility Date', field: 'eligibilityDate' },
  { name: 'Issued By', label: 'Issued By', field: 'issuedBy' },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

onMounted(() => {
  const getPatientHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/patient-history/${glNum.value}`)
      const today = dayjs().startOf('day') 
      rows.value = res.data.history.map(item => {
        const eligibilityDate = dayjs(item.date_issued).add(3, 'month')
        const diff = eligibilityDate.diff(today, 'day')
        const isEligible = diff <= 0

        return {
          glNum: item.gl_no,
          category: item.category,
          issuedAt: item.date_issued,
          eligibilityDate: eligibilityDate.format('YYYY-MM-DD'),
          eligibilityClass: isEligible ? 'text-positive' : 'text-negative',
          daysRemaining: diff > 0 ? diff : 0,
          issuedBy: item.issued_by
        }
      })
    } catch (err) {
      console.log(err)
    }
  }
  getPatientHistory()
})
</script>
<style scoped>
.cancel-btn {
  background: #ff3b3b;
  color: white;
  font-weight: bold;
}

.budget-table :deep(thead tr) {
  background: #1f8f2e;
}

.budget-table :deep(thead th) {
  color: #ffffff;
  font-weight: 600;
  text-align: center;
}

.budget-table :deep(td) {
  text-align: center;
}

.budget-table :deep(.q-table__title) {
  font-size: 40px;
  font-weight: 600;
  color: #1f8f2e;
}

.budget-table :deep(td) {
  vertical-align: middle;
}

.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  /* matches q-table row height */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>