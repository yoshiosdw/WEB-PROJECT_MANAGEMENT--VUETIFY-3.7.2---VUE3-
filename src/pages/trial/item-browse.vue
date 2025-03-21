<script setup>
import axiosIns from "@/plugins/axios";


const isVisible = ref(false);
const products = ref(null);
const totalProduct = ref(0);
const rowPerPage = ref(10);
const currentPage = ref(1);
const totalPage = ref(0);
const find = ref("");
const findText = ref("");

const prodType = ref("");
const itemGroup = ref("");
const familyCode = ref("");

const fetchItemStatus = ref(true);

const emits = defineEmits(["data", "statusFetchingData"]);
const sendData = (val) => {
  emits("data", val);
  isVisible.value = false;
};

const sendFetchDataStatus = (val) => {
  emits("statusFetchingData", val);
  isVisible.value = false;
};

const fetchProducts = async (
  page,
  perPage,
  find,
  prodType,
  itemGroup,
  familyCode
) => {
  try {
    const ret = await axiosIns.get("/datawarehouse/product", {
      params: {
        page: page,
        perPage: perPage,
        find: find,
        prod_type: prodType,
        item_group: itemGroup,
        product_family_code: familyCode,
      },
    });
    fetchItemStatus.value = false;
    products.value = ret.data.data;
    totalProduct.value = ret.data.meta.total;
    totalPage.value = ret.data.meta.last;
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: error,
      icon: "error",
    });
  }
};

const findItem = async () => {
  find.value = findText.value;
};

const paginationData = computed(() => {
  const lastIndex = rowPerPage.value;
  return `Showing ${rowPerPage.value} to ${lastIndex} of ${totalProduct.value} entries`;
});

watchEffect(() => {
  fetchProducts(
    currentPage.value,
    rowPerPage.value,
    find.value
    // prodType.value,
    // itemGroup.value,
    // familyCode.value
  );
  // sendFetchDataStatus(fetchItemStatus);
});

</script>

<template>
  <VDialog v-model="isVisible" persistent width="1024">
    <template #activator="{ props }">
      <VBtn v-bind="props" :loading="fetchItemStatus">Find</VBtn>
    </template>
    <DialogCloseBtn @click="isVisible = !isVisible"/>
    <VCard>
      <VCardText class="d-flex flex-wrap py-4 gap-4">
        <div style="width: 80px">
          <VSelect
            v-model="rowPerPage"
            density="compact"
            variant="outlined"
            :items="[10, 20, 30, 50]"
          />
        </div>
        <VSpacer />
        <div class="d-flex flex-wrap gap-4">
          <div style="width: 34.55rem">
            <VTextField
              v-model="findText"
              placeholder="Search by item code / item name"
              density="compact"
              @keydown.enter="findItem"
            />
          </div>
        </div>
      </VCardText>
      <VDivider />
      <VCardText>
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Name</th>
              <th scope="col">Family Product</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in products"
              :key="product.ItemNumber"
              style="height: 3rem"
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    {{ product.ItemNumber }}
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                      {{ product.ProductName }}
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                      {{ product.ProductCategory }}
                  </div>
                </div>
              </td>
              <td class="text-center" style="width: 5rem">
                <VBtn icon="" size="x-small" color="default" variant="text">
                  <VIcon
                    size="22"
                    icon="tabler-check"
                    @click="sendData(product)"
                  />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>

      <VDivider />
      <VCardText
        class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
      >
        <span class="text-sm text-disabled">
          {{ paginationData }}
        </span>

        <VPagination
          v-model="currentPage"
          size="small"
          :total-visible="5"
          :length="totalPage"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>
