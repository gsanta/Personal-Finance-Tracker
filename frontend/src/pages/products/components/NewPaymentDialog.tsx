import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import Product from '../types/Product';
import { api, productsPath } from '@/utils/apiRoutes';

type PaymentRequest = Pick<Product, 'name' | 'amount' | 'isIncome'>;

type NewPaymentDialogProps = {
  refetchPayments: () => void;
};

const NewPaymentDialog = ({ refetchPayments }: NewPaymentDialogProps) => {
  const {
    register,
    handleSubmit,
    reset: resetForm,
  } = useForm({
    defaultValues: {
      name: '',
      amount: 0,
      isIncome: false,
    },
  });

  const {
    mutate,
    isPending,
    reset: resetMutation,
  } = useMutation({
    mutationFn: async (request: PaymentRequest) => {
      const data = await api.post(productsPath(), request);
      return data;
    },
    onSuccess: () => {
      onClose();
      refetchPayments();
    },
  });

  const onClose = () => {
    (document.getElementById('new-payment-dialog') as HTMLDialogElement)?.close();
    resetForm();
    resetMutation();
  };

  const onSubmit = handleSubmit((data) => {
    mutate(data);
  });

  return (
    // <dialog id="new-payment-dialog" className="modal">
    <form className="modal-box bg-base-100" onSubmit={onSubmit}>
      <h3 className="font-bold text-lg">Add new transaction</h3>
      <div className="divider"></div>
      <div className="flex flex-col gap-4">
        <label className="input input-bordered flex items-center gap-2">
          Name
          <input type="text" className="grow" placeholder="The items name" {...register('name')} />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          Amount
          <input type="number" className="grow" placeholder="The amount payed" {...register('amount')} />
        </label>
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input type="checkbox" {...register('isIncome')} className="checkbox" />
            <span className="label-text">Income</span>
          </label>
        </div>
      </div>
      <div className="modal-action">
        <button className="btn" onClick={onClose}>
          Close
        </button>
        <button className="btn bg-neutral" type="submit">
          {isPending ? <span className="loading loading-spinner"></span> : 'Save'}
        </button>
      </div>
    </form>
    // </dialog>
  );
};

export default NewPaymentDialog;
