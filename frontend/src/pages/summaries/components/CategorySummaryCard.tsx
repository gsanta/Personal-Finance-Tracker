import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import useCategorySummary from '../hooks/useCategorySummary';
import CategoryMonthlySummary from '../types/CategoryMonthlySummary';

type CategorySummaryProps = {
  category: CategoryMonthlySummary;
  year: number;
  month: number;
};

const CategorySummaryCard = ({ category: initialCategory, year, month }: CategorySummaryProps) => {
  const { category } = useCategorySummary({
    initialCategories: initialCategory,
    year,
    month,
  });

  const incomeData = category.categories.filter((c) => c.totalIncome > 0);
  const expenseData = category.categories.filter((c) => c.totalExpense > 0);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="font-bold text-lg">Category summary</h3>
        <div className="divider"></div>

        <BarChart width={500} height={400} data={incomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalIncome" fill="#82ca9d" name="Income" />
        </BarChart>

        <BarChart width={500} height={400} data={expenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalExpense" fill="#8884d8" name="Expense" />
        </BarChart>
      </div>
    </div>
  );
};

export default CategorySummaryCard;
