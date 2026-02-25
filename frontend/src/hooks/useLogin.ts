import GeneralError from '@/types/GeneralError';
import { api, loginPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import useGlobalProps from './useGlobalProps';

type RegisterRequest = {
  email: string;
  password: string;
};

type RegisterResponse = {
  name: string;
  id: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

type UseLoginProps = {
  onClose: () => void;
};

const useLogin = ({ onClose }: UseLoginProps) => {
  const { setUser } = useGlobalProps();

  const {
    error: loginError,
    mutateAsync: loginUser,
    reset,
  } = useMutation<RegisterResponse, AxiosError<GeneralError>, RegisterRequest>({
    mutationFn: async (data) => api.post(loginPath, data),
    onSuccess: (response) => {
      setUser({ email: response.name, id: response.id });
    },
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
      await loginUser({ email, password });
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
