<template>
  <q-card class="dashboard-card">
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
        <div class="divider"></div>

        <!-- Total Amount Released (Right) -->
        <div class="total-right">
          <div class="total-item">
            <div class="amount-title">TOTAL AMOUNT RELEASED</div>
            <div class="amount-titles">{{ formatPeso(totalAmount) }}</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue'

const totalPatients = ref(0)
const totalAmount = ref(0)

const formatPeso = (amount) => {
  if (amount == null) return '₱0.00';
  return new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP', 
    minimumFractionDigits: 2 
  }).format(amount);
};

onMounted(() => {
  const getTotalPatientsAndAmount = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/total-patients-and-amount')
      totalPatients.value = res.data.totalPatients
      totalAmount.value = res.data.totalAmount
    } catch (err) {
      console.log(err)
    }
  }
  getTotalPatientsAndAmount()
})
</script>

<style scoped>
.dashboard-card {
  flex: 0 0 580px;
  height: 128px;
  width: 500px;
  padding: 10px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: sans-serif;
  margin-left: 10px;
  margin-bottom: 10px;
  margin-top: -26%;
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
}

.total-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.amount-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 5px;
  color: green;
}

.amount-titles {
  font-weight: 700;
  font-size: 30px;
  margin-top: 5%;
  color: rgb(153, 0, 0);
}

.divider {
  width: 1.5px;
  height: 90%;
  background-color: #000;
  position: absolute;
  left: 50%;
  top: 10%;
  transform: translateX(-50%);
}
</style>
