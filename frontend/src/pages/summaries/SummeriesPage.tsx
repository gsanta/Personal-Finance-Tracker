import MonthlySummary from './types/MonthlySummary';
import CategoryMonthlySummary from './types/CategoryMonthlySummary';
import CategorySummaryCard from './components/CategorySummaryCard';
import MonthlySummaryCard from './components/MonthlySummaryCard';
import useIsMobile from '@/hooks/useIsMobile';
import Page from '@/components/Page';
import { useForm } from 'react-hook-form';
import useQueryParam from '@/utils/useQueryParam';
import { useEffect } from 'react';

type SummeriesPageProps = {
  category: CategoryMonthlySummary;
  monthly: MonthlySummary;
  netBalance: number;
};

const SummeriesPage = ({ monthly, netBalance, category }: SummeriesPageProps) => {
  const isMobile = useIsMobile(1200);
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();
  const [year, setYear] = useQueryParam('year', currentYear);
  const [month, setMonth] = useQueryParam('month', currentMonth);

  const { register, watch } = useForm({
    defaultValues: {
      year: year,
      month: month,
    },
  });

  const watchYear = watch('year');
  const watchMonth = watch('month');

  useEffect(() => {
    setYear(watchYear);
    setMonth(watchMonth);
  }, [watchYear, watchMonth]);

  return (
    <Page>
      <div className="bg-base-200 flex justify-center items-center min-h-screen pt-4 pb-4">
        <div className="flex flex-col gap-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="font-bold text-lg">Filter</h3>
              <div className="divider"></div>
              <div className="flex gap-4">
                <label className="form-control max-w-xs">
                  <div className="label">
                    <span className="label-text">Year</span>
                  </div>
                  <select className="select select-bordered" {...register('year')}>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </label>

                <label className="form-control max-w-xs">
                  <div className="label">
                    <span className="label-text">Month</span>
                  </div>
                  <select className="select select-bordered" {...register('month')}>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
          <div className={`flex gap-4  ${isMobile ? 'flex-col items-center' : 'flex-row items-start'}`}>
            <MonthlySummaryCard monthly={monthly} netBalance={netBalance} year={Number(year)} />
            <CategorySummaryCard category={category} year={Number(year)} month={Number(month)} />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default SummeriesPage;
