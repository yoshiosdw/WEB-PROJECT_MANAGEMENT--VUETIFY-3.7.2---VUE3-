import { defineStore } from "pinia";

export const useCheckoutStore = defineStore('CheckoutStore', {
    id: "checkoutStore",
    checkout: null,
    lines: null
})
