import GeneralError from '@/types/GeneralError';
import { api, loginPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

type RegisterRequest = {
  user: string;
  passwd: string;
};

const useLogin = () => {
  const {
    error: loginError,
    mutateAsync: login,
    reset,
  } = useMutation<unknown, AxiosError<GeneralError>, RegisterRequest>({
    mutationFn: async (data) => api.post(loginPath, data),
  });

  return {
    login,
    loginError,
    resetLogin: reset,
  };
};

export default useLogin;
