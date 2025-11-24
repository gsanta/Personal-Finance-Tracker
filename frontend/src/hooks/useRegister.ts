import GeneralError from '@/types/GeneralError';
import { api, registerPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';

type RegisterRequest = {
  email: string;
  password: string;
  confirm_password: string;
};

export type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const useRegister = () => {
  const {
    error: registerError,
    mutateAsync: registerUser,
    reset: resetRegister,
  } = useMutation<unknown, AxiosError<GeneralError>, RegisterRequest>({
    mutationFn: async (data) => api.post(registerPath, data),
  });

  const onSubmit = ({ email, password, confirmPassword }: RegisterFormData) => {
    registerUser({ email, password, confirm_password: confirmPassword });
  };

  const {
    register,
    handleSubmit,
    reset: resetRegisterForm,
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  return {
    registerError,
    registerRegister: register,
    resetRegisterForm,
    handleRegisterSubmit: handleSubmit,
    onSubmitRegister: onSubmit,
    resetRegister,
  };
};

export default useRegister;
