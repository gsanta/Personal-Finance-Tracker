import CategorySummary from './CategorySummary';

type CategoryMonthlySummary = {
  year: number;
  month: number;
  categories: CategorySummary[];
};

export default CategoryMonthlySummary;
