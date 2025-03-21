import { defineStore } from "pinia";

export const useEmployee = defineStore("employeeStore", {
  id: "employeeStore",
  state: () => ({
    employees: null,
    // find: ''
  }),
});
