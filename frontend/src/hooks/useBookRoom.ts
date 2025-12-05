import { api, bookingsPath } from '@/utils/apiRoutes';
import { useMutation } from '@tanstack/react-query';

type BookingsRequest = {
  endDate: string;
  roomId: string;
  startDate: string;
};

const useBookRoom = () => {
  const { mutateAsync: createBooking } = useMutation<unknown, unknown, BookingsRequest>({
    mutationFn: async (data) => {
      return api.post(bookingsPath, data);
    },
  });

  return {
    createBooking,
  };
};

export default useBookRoom;
