import { api, logoutPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';

const useLogout = () => {
  const { mutate: logout } = useMutation<unknown, unknown, void>({
    mutationFn: async () => api.post(logoutPath),
    onSuccess: () => {
      window.location.href = '/';
    },
  });

  return {
    logout,
  };
};

export default useLogout;
