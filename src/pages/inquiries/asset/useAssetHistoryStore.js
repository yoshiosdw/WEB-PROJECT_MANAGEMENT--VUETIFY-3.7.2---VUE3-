import { defineStore } from "pinia";

export const useAssetHistoryStore = defineStore('assetHistoryStore', {
    id: 'assetHistoryStore',
    state: () => ({
        asset: null,
        find: ''
    })
})
