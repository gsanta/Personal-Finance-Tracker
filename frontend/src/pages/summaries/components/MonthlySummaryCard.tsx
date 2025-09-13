import { LineChart, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import MonthlySummary from '../types/MonthlySummary';
import useMonthlySummary from '../hooks/useMonthlySummary';

type MonthlySummaryCardProps = {
  monthly: MonthlySummary;
  netBalance: number;
  year: number;
};

const MonthlySummaryCard = ({ monthly: initialMonthlySummary, netBalance, year }: MonthlySummaryCardProps) => {
  const { monthly } = useMonthlySummary({
    initialMonthlySummary,
    year,
  });

  const chartData = monthly.months.map((m) => ({
    name: `${monthly.year}-${String(m.month).padStart(2, '0')}`,
    income: m.totalIncome,
    expense: m.totalExpense,
  }));

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h3 className="font-bold text-lg">Monthly summary</h3>
        <div className="divider"></div>
        Net balance: {netBalance}
        <LineChart width={600} height={400} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#82ca9d" name="Income" />
          <Line type="monotone" dataKey="expense" stroke="#8884d8" name="Expense" />
        </LineChart>
      </div>
    </div>
  );
};

export default MonthlySummaryCard;
