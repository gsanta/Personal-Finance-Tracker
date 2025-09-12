import { api, paymentPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import Payment from '../types/Payment';

type DeletePaymentConfirmDialogProps = {
  item: Payment | null;
  refetchPayments: () => void;
};

const DeletePaymentConfirmDialog = ({ item, refetchPayments }: DeletePaymentConfirmDialogProps) => {
  const handleClose = () => {
    (document.getElementById('delete-payment-dialog') as HTMLDialogElement)?.close();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = await api.delete(paymentPath(item?.id || ''));
      return data;
    },
    onSuccess: () => {
      handleClose();
      refetchPayments();
    },
  });

  return (
    <dialog id="delete-payment-dialog" className="modal">
      <div className="modal-box bg-base-100">
        <h3 className="font-bold text-lg">Delete transaction</h3>
        <div className="divider"></div>
        <div>
          Are you sure you want to delete the transaction: <b>{item?.name}</b>?
        </div>
        <div className="modal-action">
          <button className="btn" onClick={handleClose}>
            Close
          </button>
          <button className="btn bg-neutral" onClick={() => mutate()}>
            {isPending ? <span className="loading loading-spinner"></span> : 'Delete'}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default DeletePaymentConfirmDialog;
