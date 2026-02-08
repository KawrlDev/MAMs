<template>
  <q-card
    flat
    bordered
    class="filter-card"
    style="margin-top: 20px; width: 85%; margin-left: 90px"
  >
    <q-card-section>
      <div class="row items-center" style="gap: 16px">
        <!-- DATE SEARCH -->
        <div class="row items-center" style="gap: 8px">
          <span
            class="text-body2 text-weight-medium"
            style="white-space: nowrap; margin-left: 20px"
          >
            Filter by Period:
          </span>

          <q-input
            style="width: 250px"
            :model-value="formattedDate"
            outlined
            dense
            placeholder="dd/mm/yyyy - dd/mm/yyyy"
            @clear="onClearDate"
            readonly
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover>
                  <q-date
                    v-model="dateRange"
                    range
                    emit-immediately
                    mask="DD/MM/YYYY"
                  >
                    <div class="row items-center justify-end q-pa-sm">
                      <q-btn label="Close" color="primary" flat v-close-popup />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- CATEGORY -->
        <div style="width: 200px">
          <q-select
            v-model="categoryValue"
            :options="categoryOptions"
            label="Category"
            placeholder="Category"
            dense
            outlined
            @clear="onClearCategory"
          />
        </div>

        <!-- PARTNER -->
        <div style="width: 200px">
          <q-select
            v-model="partnerValue"
            dense
            outlined
            :options="partnerOptions"
            label="Partner"
            placeholder="Partner"
            @clear="onClearPartner"
            :disable="categoryValue == null"
          />
        </div>

        <!-- BARANGAY -->
        <div style="width: 200px">
          <q-select
            v-model="barangayValue"
            :options="barangayOptions"
            label="Barangay"
            placeholder="Barangay"
            dense
            outlined
            @clear="onClearBarangay"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>

  <div class="budget-table table-scroll">
    <q-table
      :rows="summaryRows"
      :columns="columns"
      row-key="type"
      flat
      bordered
      :pagination.sync="pagination"
    >
      <template v-slot:body-cell-category="props">
        <td>
          <!-- Only show category on first row of the group -->
          <span v-if="props.row.category">{{ props.row.category }}</span>
        </td>
      </template>
    </q-table>

    <br />

    <q-table
      :rows="tabangRows"
      :columns="columns2"
      row-key="type"
      flat
      bordered
      :pagination.sync="pagination"
    >
      <template #body-cell-action="props">
        <ActionBtn :row="props.row" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted } from "vue";

const pagination = ref({
  page: 1,
  rowsPerPage: 6, // default rows per page
});

const dateRange = ref(null);

const allPatients = ref([]);

const issuedAmounts = ref([])

onMounted(async () => {
  try {
    // Fetch all patients (for Total Bene)
    const resPatients = await axios.get("http://localhost:8000/api/patients");
    allPatients.value = resPatients.data;

    // Fetch aggregated issued amounts per category/month (for Amount rows)
    const year = '2026'; // or from your date picker/filter
    const resIssued = await axios.get("http://localhost:8000/api/issued-amounts-by-year", {
      params: { year }
    });

    // Store the aggregated issued amounts
    issuedAmounts.value = resIssued.data;

  } catch (err) {
    console.error("Error fetching data:", err);
  }
});



const columns = [
  { name: "category", label: "CATEGORY", field: "category", align: "left" },
  { name: "type", label: "", field: "type", align: "left" },

  { name: "jan", label: "Jan", field: "jan", align: "center" },
  { name: "feb", label: "Feb", field: "feb", align: "center" },
  { name: "mar", label: "Mar", field: "mar", align: "center" },
  { name: "apr", label: "Apr", field: "apr", align: "center" },
  { name: "may", label: "May", field: "may", align: "center" },
  { name: "jun", label: "Jun", field: "jun", align: "center" },
  { name: "jul", label: "Jul", field: "jul", align: "center" },
  { name: "aug", label: "Aug", field: "aug", align: "center" },
  { name: "sep", label: "Sep", field: "sep", align: "center" },
  { name: "oct", label: "Oct", field: "oct", align: "center" },
  { name: "nov", label: "Nov", field: "nov", align: "center" },
  { name: "dec", label: "Dec", field: "dec", align: "center" },
];

const columns2 = [
  { name: "title", label: "TABANG MEDICAL", field: "category", align: "left" },

  { name: "budget", label: "2025 BUDGET", field: "budget", align: "center" },
  { name: "sb", label: "SB#2", field: "sb", align: "center" },
  { name: "totRel", label: "TOTAL RELEASED", field: "totRel", align: "center" },
  { name: "remBal", label: "REMAINING BAL.", field: "remBal", align: "center" },
  { name: "pax", label: "PAX", field: "pax", align: "center" },
];

const summaryRows = computed(() => {
  const initMonths = () => ({
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
  });

  // Start with zeroed counts and amounts
  const summary = {
    MEDICINE: { bene: initMonths(), amount: initMonths() },
    LABORATORY: { bene: initMonths(), amount: initMonths() },
    HOSPITAL: { bene: initMonths(), amount: initMonths() },
  };

  // Count beneficiaries from allPatients
  allPatients.value.forEach((p) => {
    const month = new Date(p.date_issued)
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase();

    const category = (p.category || "").toUpperCase();
    if (!summary[category]) return;

    summary[category].bene[month]++;
  });

  // Fill amounts from issuedAmounts API data
  for (const cat of ['MEDICINE', 'LABORATORY', 'HOSPITAL']) {
    if (!issuedAmounts.value[cat]) continue;
    for (const month in issuedAmounts.value[cat]) {
      summary[cat].amount[month] = issuedAmounts.value[cat][month];
    }
  }

  return [
    { category: "Medicine", type: "Total Bene", ...summary.MEDICINE.bene },
    { category: "", type: "Amount", ...summary.MEDICINE.amount },

    { category: "Laboratory", type: "Total Bene", ...summary.LABORATORY.bene },
    { category: "", type: "Amount", ...summary.LABORATORY.amount },

    { category: "Hospital Bill", type: "Total Bene", ...summary.HOSPITAL.bene },
    { category: "", type: "Amount", ...summary.HOSPITAL.amount },
  ];
});


const tabangRows = ref([
  {
    category: "Medicine",
    budget: 100000,
    sb: 2,
    totRel: 50000,
    remBal: 50000,
    pax: 120,
  },
  {
    category: "Laboratory",
    budget: 50000,
    sb: 1,
    totRel: 20000,
    remBal: 30000,
    pax: 80,
  },
  {
    category: "Hospital Bill",
    budget: 150000,
    sb: 3,
    totRel: 90000,
    remBal: 60000,
    pax: 200,
  },
]);
</script>

<style scoped>
.budget-table {
  margin-left: 90px;
  width: 85%;
  overflow-x: auto;
}

.budget-table :deep(thead tr) {
  background: #1f8f2e;
}

.budget-table :deep(thead th) {
  color: #ffffff;
  font-weight: 600;
  text-align: center !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  font-size: 12px;
}

.budget-table :deep(td) {
  text-align: center;
  vertical-align: middle;
}

.budget-table :deep(td:first-child) {
  font-weight: 600;
}
</style>
