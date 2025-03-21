<script setup>
import { useCheckoutStore } from '@/pages/checkout/useCheckoutStore';
import { VNodeRenderer } from '@layouts/components/VNodeRenderer';
import { themeConfig } from '@themeConfig';
import InvoiceProductEdit from './InvoiceProductEdit.vue';
import { useInvoiceStore } from './useInvoiceStore';

const props = defineProps({
  data: {
    type: null,
    required: true,
  },
})

const checkoutStore = useCheckoutStore()
const invoiceListStore = useInvoiceStore()
const today = new Date()
const clients = ref([])

invoiceListStore.fetchClients().then(response => {
  clients.value = response.data
}).catch(err => {
  console.log(err)
})

const addItem = () => {
  props.data.purchasedProducts.push({
    title: 'App Design',
    cost: 24,
    hours: 1,
    description: 'Designed UI kit & app pages.',
  })
}

const removeProduct = id => {
  props.data.purchasedProducts.splice(id, 1)
}
</script>

<template>
  <VCard>
    <!-- SECTION Header -->
    <!--  eslint-disable vue/no-mutating-props -->
    <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row">
      <div class="ma-sm-4">
        <div class="d-flex align-center mb-6">
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="me-3"
          />

          <!-- 👉 Title -->
          <h6 class="font-weight-bold text-xl">
            {{ themeConfig.app.title }}
          </h6>
        </div>
        <p class="mb-0">
          Office 149, 450 South Brand Brooklyn
        </p>
        <p class="mb-0">
          San Diego County, CA 91905, USA
        </p>
        <p class="mb-0">
          +1 (123) 456 7891, +44 (876) 543 2198
        </p>
      </div>

      <!-- 👉 Right Content -->
      <div class="mt-4 ma-sm-4">
        <h6 class="d-flex align-center font-weight-medium justify-sm-end text-xl mb-3">
          <span class="me-3">Document Number</span>
          <span>
            <VTextField
              v-model="props.data.invoice.id"
              disabled
              prefix="#"
              density="compact"
              style="width: 8.9rem;"
            />
          </span>
        </h6>

        <!-- 👉 Issue Date -->
        <p class="d-flex align-center justify-sm-end mb-3">
          <span class="me-3">Document Date</span>

          <span>
            <VDateInput
              v-model="today"
              density="compact"
              placeholder="YYYY-MM-DD"
              style="width: 8.9rem;"
              :config="{ position: 'auto right' }"
            />
          </span>
        </p>

        <!-- 👉 Due Date -->
        <p class="d-flex align-center justify-sm-end mb-0">
          <span class="me-3">Expected Check In Date</span>

          <span>
            <VDateInput
              v-model="props.data.invoice.dueDate"
              density="compact"
              placeholder="YYYY-MM-DD"
              style="width: 8.9rem;"
              :config="{ position: 'auto right' }"
            />
          </span>
        </p>
      </div>
    </VCardText>
    <!-- !SECTION -->

    <VDivider />

    <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row gap-4">
      <div
        class="ma-sm-4"
        style="width: 15.5rem;"
      >
        <h6 class="text-sm font-weight-medium mb-3">
          Invoice To:
        </h6>

        <VSelect
          v-model="props.data.invoice.client"
          :items="clients"
          item-title="name"
          item-value="name"
          placeholder="Select Customer"
          return-object
          class="mb-6"
          density="compact"
        />
        <p class="mb-1">
          {{ props.data.invoice.client.name }}
        </p>
        <p class="mb-1">
          {{ props.data.invoice.client.company }}
        </p>
        <p
          v-if="props.data.invoice.client.address"
          class="mb-1"
        >
          {{ props.data.invoice.client.address }}, {{ props.data.invoice.client.country }}
        </p>
        <p class="mb-1">
          {{ props.data.invoice.client.contact }}
        </p>
        <p class="mb-0">
          {{ props.data.invoice.client.companyEmail }}
        </p>
      </div>

      <div class="ma-sm-4">
        <h6 class="text-sm font-weight-medium mb-3">
          Bill To:
        </h6>
        <table>
          <tbody>
            <tr>
              <td class="pe-6">
                Total Due:
              </td>
              <td class="font-weight-semibold">
                {{ props.data.paymentDetails.totalDue }}
              </td>
            </tr>
            <tr>
              <td class="pe-6">
                Bank Name:
              </td>
              <td>{{ props.data.paymentDetails.bankName }}</td>
            </tr>
            <tr>
              <td class="pe-6">
                Country:
              </td>
              <td>{{ props.data.paymentDetails.country }}</td>
            </tr>
            <tr>
              <td class="pe-6">
                IBAN:
              </td>
              <td>{{ props.data.paymentDetails.iban }}</td>
            </tr>
            <tr>
              <td class="pe-6">
                SWIFT Code:
              </td>
              <td>{{ props.data.paymentDetails.swiftCode }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </VCardText>

    <VDivider />

    <!-- 👉 Add purchased products -->
    <VCardText class="add-products-form">
      <div
        v-for="(product, index) in props.data.purchasedProducts"
        :key="product.title"
        class="ma-sm-4"
      >
        <InvoiceProductEdit
          :id="index"
          :data="product"
          @remove-product="removeProduct"
        />
      </div>

      <div class="mt-4 ma-sm-4">
        <VBtn @click="addItem">
          Add Item
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

    <!-- 👉 Total Amount -->
    <VCardText class="d-flex justify-space-between flex-wrap flex-column flex-sm-row">
      <div class="mx-sm-4 my-2">
        <div class="d-flex align-center mb-4">
          <h6 class="text-sm font-weight-semibold me-2">
            Salesperson:
          </h6>
          <VTextField
            v-model="props.data.salesperson"
            style="width: 10rem;"
          />
        </div>

        <VTextField
          v-model="props.data.thanksNote"
          placeholder="Thanks for your business"
        />
      </div>

      <div class="my-2 mx-sm-4">
        <table>
          <tr>
            <td class="text-end">
              <div class="me-5">
                <p class="mb-2">
                  Subtotal:
                </p>
                <p class="mb-2">
                  Discount:
                </p>
                <p class="mb-2">
                  Tax:
                </p>
                <p class="mb-2">
                  Total:
                </p>
              </div>
            </td>

            <td class="font-weight-semibold">
              <p class="mb-2">
                $154.25
              </p>
              <p class="mb-2">
                $00.00
              </p>
              <p class="mb-2">
                $50.00
              </p>
              <p class="mb-2">
                $204.25
              </p>
            </td>
          </tr>
        </table>
      </div>
    </VCardText>

    <VDivider />

    <VCardText class="mx-sm-4">
      <p class="font-weight-semibold mb-2">
        Note:
      </p>
      <VTextarea
        v-model="props.data.note"
        :rows="2"
      />
    </VCardText>
  </VCard>
</template>
