import GeneralError from '@/types/GeneralError';
import { api, loginPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';

type RegisterRequest = {
  user: string;
  passwd: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

type UseLoginProps = {
  onClose: () => void;
};

const useLogin = ({ onClose }: UseLoginProps) => {
  const {
    error: loginError,
    mutateAsync: loginUser,
    reset,
  } = useMutation<unknown, AxiosError<GeneralError>, RegisterRequest>({
    mutationFn: async (data) => api.post(loginPath, data),
  });

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

  const onSubmit = async ({ email, password }: LoginFormData) => {
    try {
      await loginUser({ user: email, passwd: password });
      onClose();
    } catch {
      // stop propagation
    }
  };

  return {
    loginError,
    onSubmitLogin: onSubmit,
    registerLogin: register,
    resetLogin: reset,
    resetLoginForm: resetForm,
    handleLoginSubmit: handleSubmit,
  };
};

export default useLogin;
