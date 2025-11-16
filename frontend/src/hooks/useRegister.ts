import { api, registerPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';

type RegisterRequest = {
  email: string;
  password: string;
  confirm_password: string;
};

const useRegister = () => {
  const { mutate: register } = useMutation<unknown, unknown, RegisterRequest>({
    mutationFn: async (data) => api.post(registerPath, data),
  });

  return {
    register,
  };
};

export default useRegister;
