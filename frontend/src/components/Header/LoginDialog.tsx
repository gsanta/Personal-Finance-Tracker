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
import useLogin from '@/hooks/useLogin';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginDialog = () => {
  const {
    register,
    handleSubmit,
    reset: resetForm,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { login: loginUser } = useLogin();

  const onSubmit = ({ email, password }: LoginFormData) => {
    loginUser({ email, password });
  };

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button colorPalette="yellow" variant="solid">
          Login
        </Button>
      </DialogTrigger>

      <DialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody display="flex" flexDirection="column" gap="4">
          <Input placeholder="Enter your email" {...register('email')} />
          <Input placeholder="Enter your password" type="password" {...register('password')} />
        </DialogBody>

        <DialogFooter>
          <Button>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default LoginDialog;
