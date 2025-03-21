import { defineStore } from "pinia";

export const useTypeStore = defineStore('typeStore', {
    id: 'typeStore',
    state: () => ({
        types: null,
        find: ''
    })
})
