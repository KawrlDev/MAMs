<template>
  <br />

  <div class="budget-table table-scroll">
    <q-btn
      label="Export as CSV"
      color="green"
      class="q-mb-md"
      icon="download"
      style="margin-left: 1200px"
      @click="exportCombinedCSV"
    />
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

function exportCombinedCSV() {
  // Prepare summary table CSV part
  const headers1 = columns.map((col) => col.label || col.name);
  const rows1 = summaryRows.value;
  const csvSummary = [
    headers1.join(","),
    ...rows1.map((row) =>
      columns
        .map((col) => {
          let cell = row[col.name];
          if (cell === null || cell === undefined) cell = "";
          else cell = cell.toString().replace(/"/g, '""');
          if (cell.includes(",") || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  // Prepare tabang table CSV part
  const headers2 = columns2.map((col) => col.label || col.name);
  const rows2 = tabangRows.value;
  const csvTabang = [
    "\n", // Add blank line for separation
    headers2.join(","),
    ...rows2.map((row) =>
      columns2
        .map((col) => {
          let cell = row[col.name];
          if (cell === null || cell === undefined) cell = "";
          else cell = cell.toString().replace(/"/g, '""');
          if (cell.includes(",") || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  // Combine both CSV parts
  const combinedCSV = csvSummary + csvTabang;

  // Trigger download
  const blob = new Blob([combinedCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "combined-budget-tables.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


const pagination = ref({
  page: 1,
  rowsPerPage: 6, // default rows per page
});

const allPatients = ref([]);
const issuedAmounts = ref([]);
const yearlyBudgets = ref([]);
const supplementaryBonuses = ref([]);

const currentYear = new Date().getFullYear().toString();

onMounted(async () => {
  try {
    const year = currentYear;

    // Fetch all patients
    const resPatients = await axios.get("http://localhost:8000/api/patients");
    allPatients.value = resPatients.data;

    // Fetch issued amounts
    const resIssued = await axios.get(
      "http://localhost:8000/api/issued-amounts-by-year",
      { params: { year } },
    );
    issuedAmounts.value = resIssued.data;

    // Fetch yearly budgets
    const resBudget = await axios.get(
      "http://localhost:8000/api/yearly-budget",
    );
    yearlyBudgets.value = resBudget.data;

    // Fetch supplementary bonuses
    const resSB = await axios.get(
      "http://localhost:8000/api/supplementary-bonus",
    );
    supplementaryBonuses.value = resSB.data;
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
  { name: "category", label: "TABANG MEDICAL", field: "category", align: "left" },

  { name: "budget", label: "2026 BUDGET", field: "budget", align: "center" },
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
  const year = currentYear;

  allPatients.value.forEach((p) => {
    const issuedYear = new Date(p.date_issued).getFullYear();
    if (issuedYear != year) return;

    const month = new Date(p.date_issued)
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase();

    const category = (p.category || "").toUpperCase();
    if (!summary[category]) return;

    summary[category].bene[month]++;
  });

  // Fill amounts from issuedAmounts API data
  for (const cat of ["MEDICINE", "LABORATORY", "HOSPITAL"]) {
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

const tabangRows = computed(() => {
  const year = currentYear;

  const budget = yearlyBudgets.value.find((b) => b.year == year) || {};

  // Sum all supplementary bonuses for the year
  const sb = supplementaryBonuses.value
    .filter((s) => s.year == year)
    .reduce(
      (acc, s) => {
        acc.medicine += Number(s.medicine_supplementary_bonus || 0);
        acc.laboratory += Number(s.laboratory_supplementary_bonus || 0);
        acc.hospital += Number(s.hospital_supplementary_bonus || 0);
        return acc;
      },
      { medicine: 0, laboratory: 0, hospital: 0 },
    );

  // Helper: total released from issuedAmounts
  const getTotalReleased = (cat) => {
    const data = issuedAmounts.value[cat];
    if (!data) return 0;
    return Object.values(data).reduce((a, b) => a + Number(b), 0);
  };

  // Helper: pax count
  const getPax = (cat) => {
    return allPatients.value.filter(
      (p) =>
        (p.category || "").toUpperCase() === cat &&
        new Date(p.date_issued).getFullYear() == year,
    ).length;
  };

  const medReleased = getTotalReleased("MEDICINE");
  const labReleased = getTotalReleased("LABORATORY");
  const hosReleased = getTotalReleased("HOSPITAL");

  return [
    {
      category: "Medicine",
      budget: Number(budget.medicine_budget || 0),
      sb: sb.medicine,
      totRel: medReleased,
      remBal: Number(budget.medicine_budget || 0) + sb.medicine - medReleased,
      pax: getPax("MEDICINE"),
    },
    {
      category: "Laboratory",
      budget: Number(budget.laboratory_budget || 0),
      sb: sb.laboratory,
      totRel: labReleased,
      remBal:
        Number(budget.laboratory_budget || 0) + sb.laboratory - labReleased,
      pax: getPax("LABORATORY"),
    },
    {
      category: "Hospital Bill",
      budget: Number(budget.hospital_budget || 0),
      sb: sb.hospital,
      totRel: hosReleased,
      remBal: Number(budget.hospital_budget || 0) + sb.hospital - hosReleased,
      pax: getPax("HOSPITAL"),
    },
  ];
});
</script>

<style scoped>
.budget-table {
  margin-left: 0px;
  width: 100%;
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
