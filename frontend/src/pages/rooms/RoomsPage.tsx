import Page from '@/components/Page';
import { Box, Button } from '@chakra-ui/react';
import backgroundImage from '@/assets/images/cat_booking_holidary.png';
import Room from '@/types/Room';
import RoomDropdown from './components/RoomDropdown';
import Booking from '@/types/Booking';
import { useState, useMemo } from 'react';
import useBookRoom from '@/hooks/useBookRoom';
import DatePicker from '@/lib/DatePicker/DatePicker';
import { createDateRange, DateRange } from '@/lib/DatePicker/hooks/useDateRange';
import { DateTime } from 'luxon';

type RoomsPageProps = {
  bookings: Booking[];
  rooms: Room[];
};

const RoomsPage = ({ bookings, rooms }: RoomsPageProps) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const [range, setRange] = useState<DateRange>();

  const bookingsForSelectedRoom = useMemo(
    () => bookings.filter((booking) => booking.roomId === selectedRoomId),
    [bookings, selectedRoomId],
  );

  const { createBooking } = useBookRoom();

  const ranges = useMemo<DateRange[]>(
    () =>
      bookingsForSelectedRoom.map((booking) =>
        createDateRange(DateTime.fromISO(booking.startDate), DateTime.fromISO(booking.endDate)),
      ),
    [bookingsForSelectedRoom],
  );

  return (
    <Page>
      <Box
        display="flex"
        flexDir="column"
        alignItems="center"
        padding="4"
        minHeight="calc(100vh - 64px)"
        overflowY="auto"
        position="relative"
      >
        <Box marginTop="2rem" display="flex" flexDirection="column" gap="4">
          <RoomDropdown rooms={rooms} value={selectedRoomId} onChange={setSelectedRoomId} />
          <DatePicker disabledRanges={ranges} />
          <Button
            onClick={() =>
              createBooking({
                endDate: range?.endDate?.toISOString() || '',
                roomId: selectedRoomId,
                startDate: range?.startDate?.toISOString() || '',
              })
            }
          >
            Foglalás
          </Button>
        </Box>
      </Box>
    </Page>
  );
};

export default RoomsPage;
