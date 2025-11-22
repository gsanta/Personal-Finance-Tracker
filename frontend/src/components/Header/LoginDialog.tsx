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
import { useState } from 'react';
import { Alert } from '../alert';
import ErrorMessage from '../ErrorMessage';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

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

  const { login: loginUser, loginError, resetLogin } = useLogin();

  const onClose = () => {
    setIsOpen(false);
    resetForm();
    resetLogin();
  };

  const onSubmit = async ({ email, password }: LoginFormData) => {
    try {
      await loginUser({ user: email, passwd: password });
      onClose();
    } catch {
      // stop propagation
    }
  };

  return (
    <DialogRoot open={isOpen}>
      <DialogTrigger asChild>
        <Button colorPalette="yellow" onClick={() => setIsOpen(true)} variant="solid">
          Login
        </Button>
      </DialogTrigger>

      <DialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogCloseTrigger onClick={onClose} />
        </DialogHeader>

        <DialogBody display="flex" flexDirection="column" gap="4">
          <Input placeholder="Enter your email" {...register('email')} />
          <Input placeholder="Enter your password" type="password" {...register('password')} />

          <ErrorMessage error={loginError} />
        </DialogBody>

        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default LoginDialog;
