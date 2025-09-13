import { api, monthlySummaryPath } from '@/utils/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import MonthlySummary from '../types/MonthlySummary';

type UseMonthlySummaryProps = {
  initialMonthlySummary: MonthlySummary;
  year: number;
};

const useMonthlySummary = ({ initialMonthlySummary, year }: UseMonthlySummaryProps) => {
  const { data: monthly } = useQuery<AxiosResponse<MonthlySummary>, unknown, MonthlySummary>({
    queryKey: ['monthly', year],
    queryFn: async () => {
      const data = await api.get(
        monthlySummaryPath({
          params: { year },
        }),
      );
      return data;
    },
    initialData: {
      data: initialMonthlySummary,
    } as AxiosResponse<MonthlySummary>,
    retry: false,
    select: (response) => response.data,
    // staleTime: 2000,
  });

  return {
    monthly,
  };
};

export default useMonthlySummary;
