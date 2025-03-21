import { defineStore } from "pinia";

export const useInquiriesStore = defineStore("inquiriesStore", {
  id: "inquiriesStore",
  state: () => ({
    transaction: null,
    fromDate: getSevenDaysAgo(),
    toDate: getToday(),
    document_number: ''
  }),
});

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  return year + "-" + month + "-" + day;
};

const getSevenDaysAgo = () => {
  const today = new Date();
  const fiveDayAgo = new Date(today);
  fiveDayAgo.setDate(today.getDate() - 7);
  const year = fiveDayAgo.getFullYear();
  const month = (fiveDayAgo.getMonth() + 1).toString().padStart(2, "0");
  const day = fiveDayAgo.getDate().toString().padStart(2, "0");

  return year + "-" + month + "-" + day;
};
