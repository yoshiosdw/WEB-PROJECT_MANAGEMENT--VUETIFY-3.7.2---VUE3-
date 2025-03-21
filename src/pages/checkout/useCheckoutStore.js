import { defineStore } from "pinia";

export const useCheckoutStore = defineStore('checkoutStore', {
    id: 'checkoutStore',
    state: () => ({
        chechout: null,
        find: ''
    })
})
