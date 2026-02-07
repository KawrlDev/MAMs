<template>
  <div class="page-bg">
    <div class="form-container settings-block">
      <h4>Create Account</h4>

      <div class="content">
        <q-form ref="accountForm">
          <div class="grid-3">
            <div class="field">
              <label>Name / Username <span>*</span></label>
              <q-input v-model="name" outlined dense :rules="[val => !!val || 'This field is required']" />
            </div>

            <div class="field">
              <label>Password <span>*</span></label>
              <q-input v-model="password" type="password" outlined dense
                :rules="[val => !!val || 'This field is required']" />
            </div>

            <div class="field">
              <label>Role <span>*</span></label>
              <q-select v-model="role" :options="roles" outlined dense
                :rules="[val => !!val || 'This field is required']" />
            </div>
          </div>

          <div class="actions">
            <q-btn label="CREATE ACCOUNT" icon="save" unelevated class="btn-save" @click="showCreateDialog" />
          </div>
        </q-form>
      </div>
    </div>

    <!-- Accounts Table -->
    <div class="budget-table table-scroll q-mt-lg">
      <q-table title="Accounts" :rows="accountRows" :columns="accountColumns" row-key="id">
        <template #body-cell-action="props">
          <q-td :props="props">
            <q-btn icon="delete" label="DELETE" color="red" size="sm" unelevated @click="showDeleteDialog(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- CREATE ACCOUNT CONFIRMATION DIALOG -->
    <q-dialog v-model="createDialogVisible">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Create Account?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle1 q-mb-md">
            Are you sure you want to create an account with these details?
          </div>

          <div class="account-info-box">
            <div class="info-item">
              <strong>Username:</strong> {{ name }}
            </div>
            <div class="info-item">
              <strong>Role:</strong> {{ role }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="createAccount"
            :loading="createLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DELETE ACCOUNT CONFIRMATION DIALOG -->
    <q-dialog v-model="deleteDialogVisible">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Delete Account?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle1 q-mb-md">
            Are you sure you want to delete this account?
          </div>

          <div class="account-info-box" v-if="accountToDelete">
            <div class="info-item">
              <strong>ID:</strong> {{ accountToDelete.id }}
            </div>
            <div class="info-item">
              <strong>Username:</strong> {{ accountToDelete.username }}
            </div>
            <div class="info-item">
              <strong>Role:</strong> {{ accountToDelete.role }}
            </div>
          </div>

          <q-banner class="bg-red-1 text-red-9 q-mt-md">
            <template v-slot:avatar>
              <q-icon name="warning" color="red" />
            </template>
            This action cannot be undone.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="deleteAccount"
            :loading="deleteLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const accountForm = ref(null)

const name = ref('')
const password = ref('')
const role = ref(null)
const roles = ['ADMIN', 'EMPLOYEE']

const createDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const createLoading = ref(false)
const deleteLoading = ref(false)
const accountToDelete = ref(null)

const accountRows = ref([])
const accountColumns = [
  { name: 'id', label: 'ID', field: 'ID', align: 'center', sortable: true },
  { name: 'username', label: 'Username', field: 'USERNAME', align: 'center', sortable: true },
  { name: 'role', label: 'Role', field: 'ROLE', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const showCreateDialog = async () => {
  // Use Quasar's built-in form validation
  const isValid = await accountForm.value.validate()

  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }

  createDialogVisible.value = true
}

const showDeleteDialog = (account) => {
  accountToDelete.value = account
  deleteDialogVisible.value = true
}

const createAccount = async () => {
  createLoading.value = true

  try {
    await axios.post('http://localhost:8000/api/new-account', {
      username: name.value,
      password: password.value,
      role: role.value
    })

    $q.notify({
      type: 'positive',
      message: 'Account Created Successfully'
    })

    // reset form
    name.value = ''
    password.value = ''
    role.value = null
    createDialogVisible.value = false

    // refresh accounts list
    await fetchAccounts()

  } catch (error) {
    console.error('Error creating account:', error)
    $q.notify({
      type: 'negative',
      message: 'Error creating account'
    })
  } finally {
    createLoading.value = false
  }
}

const deleteAccount = async () => {
  if (!accountToDelete.value) return

  deleteLoading.value = true

  try {
    await axios.post('http://localhost:8000/api/delete-account', {
      id: accountToDelete.value.id
    })

    $q.notify({
      type: 'positive',
      message: 'Account Deleted Successfully'
    })

    deleteDialogVisible.value = false
    accountToDelete.value = null

    // refresh accounts list
    await fetchAccounts()

  } catch (error) {
    console.error('Error deleting account:', error)
    $q.notify({
      type: 'negative',
      message: 'Error deleting account'
    })
  } finally {
    deleteLoading.value = false
  }
}

const fetchAccounts = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/accounts')
    accountRows.value = res.data[0]
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load accounts'
    })
  }
}

onMounted(() => {
  fetchAccounts()
})
</script>

<style scoped>
.page-bg {
  background: #ffffff;
  padding: 30px;
}

.form-container {
  background: #ffffff;
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 25px 30px 35px;
}

.form-container h4 {
  font-weight: 700;
  margin: 5px 0 20px 0;
  color: #1f8f2e;
}

.content {
  padding: 0 10px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.field label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.field label span {
  color: red;
}

/* =========================
   INPUTS & SELECTS
========================= */
:deep(.q-field--outlined .q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

:deep(.q-field__control:before),
:deep(.q-field__control:after) {
  display: none !important;
}

:deep(.q-field__native),
:deep(.q-field__input),
:deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

:deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

:deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

:deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
  color: #9e9e9e;
}

.q-mt-sm {
  margin-top: 12px;
}

.q-mt-lg {
  margin-top: 24px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.actions .q-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  color: white;
}

.actions .q-btn:hover {
  filter: brightness(110%);
}

.btn-save {
  background: #0aa64f;
}

/* Table Styles */
.budget-table {
  width: 100%;
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

.budget-table :deep(thead th .q-table__sort-icon) {
  margin-left: 4px;
}

.budget-table :deep(td) {
  text-align: center;
  vertical-align: middle;
}

.budget-table :deep(.q-table__title) {
  font-size: 24px;
  font-weight: 700;
  color: #1f8f2e;
}

/* Dialog Styles */
.dialog-cancel-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-goback-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-cancel-btn .q-icon,
.dialog-goback-btn .q-icon {
  margin-right: 6px;
}

/* Account Info Box */
.account-info-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.info-item {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item strong {
  color: #1f8f2e;
  margin-right: 8px;
}
</style>