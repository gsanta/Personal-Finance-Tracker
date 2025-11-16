import { api, loginPath, registerPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';

type RegisterRequest = {
  email: string;
  password: string;
};

const useLogin = () => {
  const { mutate: login } = useMutation<unknown, unknown, RegisterRequest>({
    mutationFn: async (data) => api.post(loginPath, data),
  });

  return {
    login,
  };
};

export default useLogin;
