import useIsMobile from '@/hooks/useIsMobile';
import { Products } from '../hooks/useGetProducts';
import { BiTrash } from 'react-icons/bi';
import { useMemo, useState } from 'react';
import Product, { categoryMap } from '../types/Payment';
import DeletePaymentConfirmDialog from './DeletePaymentConfirmDialog';

type ProductsTableProps = {
  payments: Products;
  page: number;
  setPage: (page: number) => void;
  refetchPayments: () => void;
};

const ITEMS_PER_PAGE = 10;

const ProductsTable = ({ payments, page, setPage, refetchPayments }: ProductsTableProps) => {
  const isMobile = useIsMobile();

  const currentPage = page || 1;

  const [payment, setSelectedPayment] = useState<Product | null>(null);

  const handleDelete = (payment: Product) => {
    setSelectedPayment(payment);
    const dialog = document.getElementById('delete-payment-dialog') as HTMLDialogElement;
    dialog?.showModal();
  };

  const pages = useMemo(() => Math.ceil(payments.totalCount / ITEMS_PER_PAGE), [payments.totalCount]);

  return (
    <>
      <table className={`table bg-neutral rounded-none ${isMobile ? 'w-full' : 'table-fixed w-[35rem]'}`}>
        <thead>
          <tr className="bg-base-200">
            <th className={`${isMobile ? undefined : 'w-[12rem]'}`}>Name</th>
            <th className={`${isMobile ? undefined : 'w-[8rem]'}`}>Amount (HUF)</th>
            <th className={`${isMobile ? undefined : 'w-[10rem]'}`}>Date</th>
            <th className={`${isMobile ? undefined : 'w-[5rem]'}`}></th>
          </tr>
        </thead>
        <tbody>
          {payments.items.map((payment) => {
            const date = new Date(payment.createdAt);

            const formattedDate = new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(date);

            const formattedTime = new Intl.DateTimeFormat('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }).format(date);

            return (
              <tr key={payment.id}>
                <td className="flex flex-col">
                  {payment.name}
                  {payment.category && (
                    <span className="text-secondary font-bold text-sm">{categoryMap[payment.category]}</span>
                  )}
                </td>
                <td>{payment.isIncome ? payment.amount : -payment.amount}</td>
                <td>
                  {formattedDate}
                  <br />
                  <span className="text-sm">{formattedTime}</span>
                </td>
                <td>
                  <button className="btn btn-square btn-warning" onClick={() => handleDelete(payment)}>
                    <BiTrash size={24} />
                  </button>
                </td>
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
              className={`join-item btn ${i === currentPage - 1 ? 'btn-primary' : ''}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <DeletePaymentConfirmDialog item={payment} refetchPayments={refetchPayments} />
    </>
  );
};

export default ProductsTable;
