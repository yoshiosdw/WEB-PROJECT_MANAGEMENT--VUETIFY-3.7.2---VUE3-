import { defineStore } from "pinia";

export const useJobOrder = defineStore("jobOrderStore", {
  id: "jobOrderStore",
  state: () => ({
    orders: null,
    find: '',
    pic: null,
    task: null,
    page: 1,
    perPage: 10,
    total: 0,
    last: 0,
    from: 1,
    to: 1
  }),
});
