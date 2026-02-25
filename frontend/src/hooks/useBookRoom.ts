import GeneralError from '@/types/GeneralError';
import { api, bookingsPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

type BookingsRequest = {
  cats?: string[];
  foodFromOwner?: boolean;
  endDate: string;
  notes?: string;
  roomId: string;
  startDate: string;
};

const useBookRoom = () => {
  const {
    error,
    isPending,
    isSuccess,
    mutateAsync: createBooking,
  } = useMutation<unknown, AxiosError<GeneralError>, BookingsRequest>({
    mutationFn: async (data) => {
      return api.post(bookingsPath, data);
    },
  });

  return {
    createBooking,
    createBookingError: error,
    isCreateBookingLoading: isPending,
    isCreateBookingSuccess: isSuccess,
  };
};

export default useBookRoom;
