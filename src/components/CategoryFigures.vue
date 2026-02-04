<template>
  <div class="dashboard-container">
    <div class="dashboard-title">DASHBOARD</div>

    <div class="dashboard-row">
      <div class="dashboard-card" v-for="item in categories" :key="item.name">
        <!-- HEADER -->
        <div class="card-header">
          <q-icon :name="item.icon" size="22px" />
          <span>{{ item.name }}</span>
        </div>

        <!-- BODY -->
        <div class="card-body">
          <div class="label">BUDGET</div>
          <div class="value">{{ formatPeso(item.totalBudget) }}</div>

          <div class="label">NO. OF PATIENTS</div>
          <div class="value">{{ item.totalPatients }}</div>

          <div class="label">AMOUNT RELEASED</div>
          <div class="value">{{ formatPeso(item.totalReleased) }}</div>

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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const categories = ref([
  {
    name: 'MEDICINE',
    icon: 'medication',
    totalBudget: 0,
    totalPatients: 0,
    totalReleased: 0,
    remaining: 0
  },
  {
    name: 'LABORATORY',
    icon: 'science',
    totalBudget: 0,
    totalPatients: 0,
    totalReleased: 0,
    remaining: 0
  },
  {
    name: 'HOSPITAL',
    icon: 'local_hospital',
    totalBudget: 0,
    totalPatients: 0,
    totalReleased: 0,
    remaining: 0
  }
])

const formatPeso = (amount) => {
  if (amount == null) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};

onMounted(() => {
  const getCategoryData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/category-cards')
      categories.value[0] = { ...categories.value[0], ...res.data.medicineData };
      categories.value[1] = { ...categories.value[1], ...res.data.laboratoryData };
      categories.value[2] = { ...categories.value[2], ...res.data.hospitalData };
    } catch (err) {
      console.log(err)
    }
  }
  getCategoryData()
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.dashboard-title {
  font-size: 40px;
  font-weight: 700;
  margin: 25px 0 1px 5px;
  color: green;
}

.dashboard-row {
  display: flex;
  gap: 30px;
  padding: 10px;
  overflow-x: auto;
}

/* CARD */
.dashboard-card {
  width: 174px;
  padding: 15px;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  text-align: center;
  height: 301px;
  background: #ffffff;
  border: 2px solid grey;
  margin-top: -9px;
}

/* HEADER */
.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 2px;
}

/* ✅ DIFFERENT COLORS PER CATEGORY */
.dashboard-card:nth-child(1) .card-header {
  color: #2e7d32;
  /* Medicine - green */
}

.dashboard-card:nth-child(2) .card-header {
  color: #2e7d32;
  /* Laboratory - blue */
}

.dashboard-card:nth-child(3) .card-header {
  color: #2e7d32;
  /* Hospital - red */
}

/* BODY */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* LABELS */
.label {
  font-size: 15px;
  color: rgb(103, 103, 103);
  text-transform: uppercase;
  font-weight: 1000;
}

/* VALUES */
.value {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

/* DIVIDER */
.divider {
  border-top: 1px solid #ddd;
  margin: 6px 0;
}

/* REMAINING */
.remaining-label {
  color: green;
  font-weight: 700;
}

.remaining-value {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #2e7d32; /* green by default */
}

.negative .remaining-value {
  color: #d32f2f; /* red if negative */
}
</style>
