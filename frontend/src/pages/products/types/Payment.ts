export const categoryMap = {
  food: 'Food',
  fun: 'Fun',
  health: 'Health',
  main_income: 'Main income',
  other_income: 'Other income',
  utilities: 'Utilities',
};

type Product = {
  id: string;
  name: string;
  price: number;
  quantity: boolean;
};

export default Product;
