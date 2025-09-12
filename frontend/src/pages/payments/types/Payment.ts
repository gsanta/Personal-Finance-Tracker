export const categoryMap = {
  food: 'Food',
  fun: 'Fun',
  health: 'Health',
  main_income: 'Main income',
  other_income: 'Other income',
  utilities: 'Utilities',
};

type Payment = {
  amount: number;
  category?: keyof typeof categoryMap;
  createdAt: string;
  id: number;
  isIncome: boolean;
  name: string;
};

export default Payment;
