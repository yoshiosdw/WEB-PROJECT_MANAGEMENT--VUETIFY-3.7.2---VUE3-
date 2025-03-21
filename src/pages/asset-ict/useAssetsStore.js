import { defineStore } from "pinia";

export const useAssetsStore = defineStore('assetsStore', {
    id: 'assetsStore',
    state: () => ({
        asset: null,
        find: ''
    }),
    actions: {
      setAssets(newAsset) {
        this.asset = newAsset;
      }
    }
})
