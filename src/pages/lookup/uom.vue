<script setup>
import axiosDW from '@/plugins/dw'
import Swal from 'sweetalert2'

const emits = defineEmits(['uom'])
const isVisible = ref(false)
const uoms = ref([])
const totalUoms = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const sendData = val => {
  emits('uom', val)
  isVisible.value = false
}

const fetchUoms = async find => {
  try {
    const response = await axiosDW.get('/return/unit/of/measure/get', {
     
      params: {
        find: find,
      },
    })

    uoms.value = response.data.data
    totalUoms.value = response.data.meta.total
    last.value = response.data.meta.last
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load Unit Of Measure',
      icon: 'error',
    })
    console.log(error)
  }
}

const findUom = async () => {
  find.value = findText.value
}

watchEffect(() => {
  fetchUoms(find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalUoms.value}`
})
</script>

<template>
  <VDialog
    v-model="isVisible"
    width="1024"
    transition="dialog-bottom-transition"
    persistent
  >
    <template #activator="{props}">
      <VBtn v-bind="props">
        Find
      </VBtn>
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible" />

    <VCard title="Find Uom">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex gap-3">
              <div style="min-width: 80px;">
                <VSelect 
                  v-model="perPage"
                  :items="[10, 20, 30, 50]"
                />
              </div>
              <VTextField
                v-model="findText"
                placeholder="Search Customer"
                @keydown.enter="findUom"
              />
              
              <div class="d-flex justify-end gap-4">
                <VBtn
                  icon="tabler-search"
                  :size="40"
                  variant="outlined"
                  color="warning"
                  @click="findUom"
                />
              </div>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VTable>
          <thead class="text-uppercase">
            <tr>
              <th scope="col">
                Code
              </th>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="uom in uoms"
              :key="uom.id"
            >
              <td>
                <div class="d-flex flex-column">
                  <p>{{ uom.code }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ uom.name }}</p>
                </div>
              </td>
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(uom)"
                >
                  <VIcon
                    size="24"
                    icon="tabler-check"
                  />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
      <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
        <span class="text-sm text-disabled">
          {{ paginationData }}
        </span>

        <VPagination
          v-model="page"
          size="small"
          :total-visible="5"
          :length="last"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
