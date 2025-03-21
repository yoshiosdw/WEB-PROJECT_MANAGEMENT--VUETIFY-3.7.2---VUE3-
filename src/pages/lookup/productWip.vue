<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"

const props = defineProps({
  itemWip: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['itemWip'])
const isVisible = ref(false)
const isLoading = ref(false)
const soItems = ref()
const totalItem = ref(0)
const last = ref(0)
const page = ref(1)
const perPage = ref(10)
const find = ref('')
const findText = ref('')

const sendData = val => {
  emits('itemWip', val)
  isVisible.value = false
}

const findItem = async() => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const fetchItemWip = async (page, perPage, find, itemWipId) => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/datawarehouse/bom/${itemWipId}`, {
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    } )

    isLoading.value = false
    soItems.value = ret.data.data
    totalItem.value = ret.data.meta.total 
    last.value = ret.data.meta.last
  } catch(error) {
    isLoading.value = false
    Swal.fire({
      title: 'Item WIP',
      text: 'Get data Item WIP failed.',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchItemWip(page.value, perPage.value, find.value, props.itemWip)
})

const paginationData = computed(() => {
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalItem.value}`
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
    <VCard title="Find Item WIP">
      <!-- {{ props }} -->
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
                placeholder="Search Item"
                @keydown.enter="findItem"
              />
              
              <div class="d-flex justify-end gap-4">
                <VBtn
                  icon="tabler-search"
                  :size="40"
                  variant="outlined"
                  color="warning"
                  @click="findItem"
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
                Item Code
              </th>
              <th scope="col">
                Item Name
              </th>
              <th scope="col">
                Item Ukuran
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in soItems"
              :key="item.BOMID"
            >
              <td>
                <div class="d-flex flex-column">
                  <p>{{ item.BOMID }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ item.NAME }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ item.SIZE }}</p>
                </div>
              </td>
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(item)"
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
