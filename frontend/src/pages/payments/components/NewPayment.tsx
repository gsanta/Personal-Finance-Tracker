import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api, paymentsPath } from '@/utils/apiRoutes';
import NewPaymentForm from './NewPaymentForm';
import Payment from '../types/Payment';
import useIsMobile from '@/hooks/useIsMobile';
import { BiCheck } from 'react-icons/bi';
import { useState } from 'react';

type PaymentRequest = Pick<Payment, 'name' | 'amount' | 'isIncome'>;

type NewPaymentProps = {
  refetchPayments: () => void;
};

const NewPayment = ({ refetchPayments }: NewPaymentProps) => {
  const isMobile = useIsMobile();

  const [isSuccess, setIsSuccess] = useState(false);

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
      const data = await api.post(paymentsPath(), request);
      return data;
    },
    onSuccess: () => {
      onClose();
      refetchPayments();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
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

  const form = <NewPaymentForm register={register} />;

  return isMobile ? (
    <dialog id="new-payment-dialog" className="modal">
      <form className="modal-box bg-base-100 border-color border-primary border" onSubmit={onSubmit}>
        {form}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button className="btn bg-neutral" type="submit">
            {isPending ? <span className="loading loading-spinner"></span> : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  ) : (
    <form className="modal-box bg-base-100" onSubmit={onSubmit}>
      {form}
      <div className="modal-action">
        <button className="btn" onClick={onClose}>
          Clear
        </button>
        <button className={`btn ${isSuccess ? 'btn-success' : 'bg-neutral'}`} type="submit">
          {isPending && <span className="loading loading-spinner"></span>}
          {isSuccess && <BiCheck size={24} />}
          {!isPending && !isSuccess && 'Save'}
        </button>
      </div>
    </form>
  );
};

export default NewPayment;
