type Booking = {
  endDate: string;
  id: string;
  isCurrentUser: boolean;
  roomId: string;
  startDate: string;
  cancelable?: boolean;
};

export type BookingPaginated = {
  items: Booking[];
  totalCount: number;
};

export default Booking;
