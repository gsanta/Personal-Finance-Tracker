import { api, bookingsPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';

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
  } = useMutation<unknown, unknown, BookingsRequest>({
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
