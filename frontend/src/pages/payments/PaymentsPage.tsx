import { useMemo } from 'react';
import useQueryParam from '@/utils/useQueryParam';
import useGetPayments, { Payments } from './hooks/useGetPayments';
import NewPayment from './components/NewPayment';
import useIsMobile from '@/hooks/useIsMobile';

type PaymentsPageProps = {
  payments: Payments;
};

const ITEMS_PER_PAGE = 10;

const PaymentsPage = ({ payments: initialPayments }: PaymentsPageProps) => {
  const [page, setPage] = useQueryParam('page', '');
  const isMobile = useIsMobile();

  const { payments, refetchPayments } = useGetPayments({ page, initialPayments });

  const pages = useMemo(() => Math.ceil(payments.totalCount / ITEMS_PER_PAGE), [payments.totalCount]);

  return (
    <div className="bg-base-200 flex justify-around min-h-screen pt-4">
      <div className="max-w-7xl w-full">
        <div className="flex items-center justify-between gap-4 px-8 ps-10 w-full">
          <h2 className="font-title text-lg">Personal finance tracker</h2>
        </div>
        <div className="flex flex-col gap-4 items-center p-6 bg-base-200">
          <div className="flex gap-4 items-start">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Transactions</h3>
                  {isMobile && (
                    <button
                      className="btn btn-primary"
                      onClick={() => (document.getElementById('new-payment-dialog') as HTMLDialogElement)?.showModal()}
                    >
                      Add transaction
                    </button>
                  )}
                </div>
                <div className="divider"></div>
                <table className={`table bg-neutral rounded-none ${isMobile ? 'w-full' : 'table-fixed w-[35rem]'}`}>
                  <thead>
                    <tr className="bg-base-200">
                      <th className={`${isMobile ? undefined : 'w-52'}`}>Name</th>
                      <th className={`${isMobile ? undefined : 'w-32'}`}>Amount (HUF)</th>
                      <th className={`${isMobile ? undefined : 'w-52'}`}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.items.map((payment) => {
                      const date = new Date(payment.createdAt);
                      const formattedDate = new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }).format(date);

                      return (
                        <tr key={payment.id}>
                          <td>{payment.name}</td>
                          <td>{payment.amount}</td>
                          <td>{formattedDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="card-actions justify-end">
                  <div className="join">
                    {Array.from({ length: pages }, (_, i) => (
                      <button
                        key={i}
                        className={`join-item btn ${i === Number(page) - 1 ? 'btn-primary' : ''}`}
                        onClick={() => setPage((i + 1).toString())}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <NewPayment refetchPayments={refetchPayments} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
