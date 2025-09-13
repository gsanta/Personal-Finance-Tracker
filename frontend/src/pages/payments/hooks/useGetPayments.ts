import { api, paymentsPath } from '@/utils/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import Payment from '../types/Payment';

export type Payments = {
  totalCount: number;
  items: Payment[];
};

type UseGetPaymentsProps = {
  page: string;
  initialPayments: Payments;
};

const useGetPayments = ({ page, initialPayments }: UseGetPaymentsProps) => {
  const { data: payments, refetch: refetchPayments } = useQuery<AxiosResponse<Payments>, unknown, Payments>({
    queryKey: ['payments', page],
    queryFn: async () => {
      const data = await api.get(
        paymentsPath({
          params: { page: page ? Number(page) : 1 },
        }),
      );
      return data;
    },
    initialData: {
      data: initialPayments,
    } as AxiosResponse<Payments>,
    select: (response) => response.data,
    // staleTime: 2000,
  });

  return {
    payments,
    refetchPayments,
  };
};

export default useGetPayments;
