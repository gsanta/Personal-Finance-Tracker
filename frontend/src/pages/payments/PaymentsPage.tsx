import useGetPayments, { Payments } from './hooks/useGetPayments';
import NewPayment from './components/NewPayment';
import useIsMobile from '@/hooks/useIsMobile';
import PaymentsTable from './components/PaymentsTable';
import useQueryParam from '@/utils/useQueryParam';

type PaymentsPageProps = {
  payments: Payments;
};

const PaymentsPage = ({ payments: initialPayments }: PaymentsPageProps) => {
  const isMobile = useIsMobile();

  const [page, setPage] = useQueryParam('page', '');

  const { payments, refetchPayments } = useGetPayments({ page, initialPayments });

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
                <PaymentsTable
                  payments={payments}
                  page={Number(page)}
                  refetchPayments={refetchPayments}
                  setPage={(newPage: number) => setPage(String(newPage))}
                />
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
