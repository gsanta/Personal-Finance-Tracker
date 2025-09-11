import { useMemo } from 'react';
import Payment from './types/Payment';
import useQueryParam from '@/utils/useQueryParam';
import { useQuery } from '@tanstack/react-query';
import { api, listPaymentsPath } from '@/utils/apiRoutes';
import { AxiosResponse } from 'axios';

type Payments = {
  totalCount: number;
  items: Payment[];
};

type PaymentsPageProps = {
  payments: Payments;
};

const ITEMS_PER_PAGE = 10;

const PaymentsPage = ({ payments: initialPayments }: PaymentsPageProps) => {
  const [page, setPage] = useQueryParam('page', '');

  const { data: payments } = useQuery<AxiosResponse<Payments>, unknown, Payments>({
    queryKey: ['payments', page],
    queryFn: async () => {
      const data = await api.get(
        listPaymentsPath({
          params: { page: page ? Number(page) - 1 : 0 },
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

  const pages = useMemo(() => Math.floor(payments.totalCount / ITEMS_PER_PAGE), [payments.totalCount]);

  return (
    <div className="flex flex-col min-h-screen items-center p-6 bg-base-200">
      <div className="w-[75rem] bg-base-100 flex flex-col items-center gap-4 border border-base-content/5">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.items.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.name}</td>
                <td>{payment.amount}</td>
                <td>{payment.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="join">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={`join-item btn ${i === Number(page) ? 'btn-active' : ''}`}
              onClick={() => setPage((i + 1).toString())}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
