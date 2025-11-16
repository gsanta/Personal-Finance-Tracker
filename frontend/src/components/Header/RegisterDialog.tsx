import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog';
import { Button } from '../button';
import { Input } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import useRegister from '@/hooks/useRegister';

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterDialog = () => {
  const {
    register,
    handleSubmit,
    reset: resetForm,
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { register: registerUser } = useRegister();

  const onSubmit = ({ email, password, confirmPassword }: RegisterFormData) => {
    registerUser({ email, password, confirm_password: confirmPassword });
  };

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button colorPalette="yellow" variant="solid">
          Register
        </Button>
      </DialogTrigger>

      <DialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody display="flex" flexDirection="column" gap="4">
          <Input placeholder="Enter your email" {...register('email')} />
          <Input placeholder="Enter your password" type="password" {...register('password')} />
          <Input placeholder="Confirm your password" type="password" {...register('confirmPassword')} />
        </DialogBody>

        <DialogFooter>
          <Button>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default RegisterDialog;
