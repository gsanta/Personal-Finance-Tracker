type MonthlySummary = {
  year: number;
  months: {
    month: number;
    totalIncome: number;
    totalExpense: number;
  }[];
};

export default MonthlySummary;
