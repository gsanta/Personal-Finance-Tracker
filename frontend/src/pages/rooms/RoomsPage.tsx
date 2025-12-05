import Calendar, { DateRange } from '@/components/Calendar/Calendar';
import Page from '@/components/Page';
import { Box, Button } from '@chakra-ui/react';
import backgroundImage from '@/assets/images/cat_booking_holidary.png';
import Room from '@/types/Room';
import RoomDropdown from './components/RoomDropdown';
import Booking from '@/types/Booking';
import { useState, useMemo } from 'react';
import useBookRoom from '@/hooks/useBookRoom';

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

  const ranges = useMemo(
    () =>
      bookingsForSelectedRoom.map((booking, index) => ({
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        color: '#3182ce',
        key: `booking-${booking.id || index}`,
      })),
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
        _before={{
          content: '""',
          position: 'absolute',
          top: '66.67%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '33.33%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
          zIndex: 0,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '66.67%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '33.33%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
      >
        <Box marginTop="2rem" display="flex" flexDirection="column" gap="4">
          <RoomDropdown rooms={rooms} value={selectedRoomId} onChange={setSelectedRoomId} />
          <Calendar onRangeChange={(range) => setRange(range)} ranges={ranges} />
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
