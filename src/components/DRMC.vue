<template>
    <q-btn
            to="/reports"
            icon="close"
            flat
            round
            text-color="red"
            size="large"
            class="absolute-top-right"
            style="z-index: 1; margin-top: 20px;"
          />
  <fieldset class="q-fieldset" style="margin-top: 30px; width: 95%; margin-left: 30px;">
    <!-- HEADER ROW -->
    <div class="row items-center justify-between q-mb-md" >
      <div class="header">File Explorer</div>

      <!-- Right side: dropdown + upload -->
      <div class="row items-center q-gutter-sm">
        <div style="width: 220px;">
          <q-select
            v-model="drmcValue"
            :options="drmcOptions"
            label="DRMC FILES"
            dense
            outlined
          />
        </div>

        <q-btn
          label="Upload File"
          color="green"
          icon="upload"
          @click="$refs.fileInput.click()"
        />
        <input
          ref="fileInput"
          type="file"
          hidden
          @change="uploadFile"
        />
      </div>
    </div>

    <!-- FILE LIST -->
    <q-card bordered>
      <q-separator />

      <q-list bordered>
        <q-item
          v-for="file in filteredFiles"
          :key="file.name"
          clickable
        >
          <q-item-section avatar>
            <q-icon :name="getIcon(file.type)" />
          </q-item-section>

          <q-item-section>
            <a :href="file.url" target="_blank">
              {{ file.name }}
            </a>
          </q-item-section>

          <q-item-section side>
            <q-btn
              icon="delete"
              color="negative"
              flat
              @click.stop="deleteFile(file.name)"
            />
          </q-item-section>
        </q-item>

        <q-item v-if="filteredFiles.length === 0">
          <q-item-section class="text-grey">
            No files found
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </fieldset>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const files = ref([])
const drmcValue = ref(null)

const drmcOptions = [
  'DRMC GL',
  'DRMC SUMMARY',
  'OPD DRMC'
]

// Filter files by selected dropdown
const filteredFiles = computed(() => {
  if (!drmcValue.value) return files.value
  return files.value.filter(file =>
    file.name.toUpperCase().includes(drmcValue.value.replace(' ', ''))
  )
})

const fetchFiles = async () => {
  const res = await axios.get('http://localhost:8000/api/files')
  files.value = res.data
}

const uploadFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  await axios.post('http://localhost:8000/api/files/upload', formData)
  fetchFiles()
}

const deleteFile = async (filename) => {
  await axios.delete(`http://localhost:8000/api/files/${filename}`)
  fetchFiles()
}

const getIcon = (type) => {
  if (type === 'xlsx' || type === 'xls') return 'table_chart'
  if (type === 'pdf') return 'picture_as_pdf'
  return 'insert_drive_file'
}

onMounted(fetchFiles)
</script>
<style scoped>
    .header {
        font-size: 33px;
  font-weight: 700;
  color: #1f8f2e;
    }
</style>