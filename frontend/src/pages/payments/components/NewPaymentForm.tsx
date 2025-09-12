import { UseFormRegister } from 'react-hook-form';

type NewPaymentFormProps = {
  register: UseFormRegister<{
    name: string;
    amount: number;
    isIncome: boolean;
    category?: string;
  }>;
};

const NewPaymentForm = ({ register }: NewPaymentFormProps) => {
  return (
    <>
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

        <select className="select select-primary w-full max-w-xs" {...register('category')}>
          <option selected>No category</option>
          <option value="food">Food</option>
          <option value="fun">Fun</option>
          <option value="health">Health</option>
          <option value="main_income">Main income</option>
          <option value="other_income">Other income</option>
          <option value="utilities">Utilities</option>
        </select>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-4">
            <input type="checkbox" {...register('isIncome')} className="checkbox" />
            <span className="label-text">Income</span>
          </label>
        </div>
      </div>
    </>
  );
};

export default NewPaymentForm;
