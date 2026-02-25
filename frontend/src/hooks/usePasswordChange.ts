import GeneralError from '@/types/GeneralError';
import { api } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const usePasswordChange = () => {
  return useMutation<unknown, AxiosError<GeneralError>, ChangePasswordRequest>({
    mutationFn: async (data) =>
      api.post('/api/user/password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      }),
  });
};

export default usePasswordChange;
