<template>
  <div class="page-bg">
    <div class="form-container settings-block">
      <h4>CREATE ACCOUNT</h4>

      <div class="content">
        <q-input
          v-model="name"
          label="Name / Username"
          outlined
          dense
        />

        <q-input
          v-model="password"
          label="Password"
          type="password"
          outlined
          dense
          class="q-mt-sm"
        />

        <q-select
          v-model="role"
          :options="roles"
          label="Role"
          outlined
          dense
          class="q-mt-sm"
        />

        <div class="actions">
          <q-btn
            label="CREATE ACCOUNT"
            icon="save"
            unelevated
            class="btn-save"
            @click="createAccount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const name = ref('')
const password = ref('')
const role = ref(null)
const roles = ['ADMIN/HEAD','EMPLOYEE']

const createAccount = async () => {
  if(!name.value || !password.value || !role.value){
    $q.notify({
      type:'negative',
      message:'Please complete all fields'
    })
    return
  }

  try {
    await axios.post('http://localhost:8000/api/create-account',{
      name:name.value,
      password:password.value,
      role:role.value
    })

    $q.notify({
      type:'positive',
      message:'Account Created Successfully'
    })

    // reset form
    name.value=''
    password.value=''
    role.value=null

  } catch {
    $q.notify({
      type:'negative',
      message:'Error creating account'
    })
  }
}
</script>

<style scoped>
.page-bg {
  background: #ffffff;
  padding: 30px;
}

.form-container {
  background: #ffffff;
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12), 0 6px 18px rgba(0,0,0,0.08);
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

.q-mt-sm {
  margin-top: 12px;
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
</style>
