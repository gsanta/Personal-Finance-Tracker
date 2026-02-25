import GeneralError from '@/types/GeneralError';
import { api } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const bookingDeletePath = (bookingId: string) => `/api/bookings/${bookingId}`;

const useBookingDelete = () => {
  return useMutation<unknown, AxiosError<GeneralError>, { id: string }>({
    mutationFn: async ({ id }) => api.delete(bookingDeletePath(id)),
  });
};

export default useBookingDelete;
