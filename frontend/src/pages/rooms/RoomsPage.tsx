import Page from '@/components/Page';
import { Box, Button, ButtonGroup, Separator } from '@chakra-ui/react';
import Room from '@/types/Room';
import RoomDropdown from './components/RoomDropdown';
import Booking from '@/types/Booking';
import { useState, useMemo } from 'react';
import useBookRoom from '@/hooks/useBookRoom';
import DatePicker from '@/lib/DatePicker/DatePicker';
import { createDateRange, DateRange } from '@/lib/DatePicker/hooks/useDateRange';
import { DateTime } from 'luxon';
import { t } from 'i18next';
import useResponsive from '@/utils/useResponsive';

type RoomsPageProps = {
  bookings: Booking[];
  rooms: Room[];
};

const RoomsPage = ({ bookings, rooms }: RoomsPageProps) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');

  const { isMobile } = useResponsive();

  const [range, setRange] = useState<DateRange>();

  const bookingsForSelectedRoom = useMemo(
    () => bookings.filter((booking) => booking.roomId === selectedRoomId),
    [bookings, selectedRoomId],
  );

  const { createBooking } = useBookRoom();

  const handleCreateBooking = () => {
    if (selectedRoomId && range?.from && range?.to) {
      createBooking({
        roomId: selectedRoomId,
        startDate: range.from.toISODate()!,
        endDate: range.to.toISODate()!,
      });
    }
  };

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
        <Box marginTop="2rem" display="flex" flexDirection="column" gap="4" width={['340px', 'initial']}>
          <RoomDropdown rooms={rooms} value={selectedRoomId} onChange={setSelectedRoomId} />
          <Box>
            <Separator borderColor="{colors.brand.subtle}" size="md" paddingBottom={['{sizes.12}', 0]} />
            {!isMobile && (
              <Box display="flex" justifyContent="center">
                <Separator
                  borderColor="{colors.brand.subtle}"
                  size="md"
                  orientation="vertical"
                  height="{sizes.16}"
                  marginLeft="{sizes.16}"
                />
              </Box>
            )}
            <DatePicker disabledRanges={ranges} isMobile={isMobile} onApply={(d) => setRange(d)} selected={range} />
            <Separator borderColor="{colors.brand.subtle}" size="md" />
          </Box>
          <ButtonGroup>
            <Button colorPalette="brand" onClick={() => setRange(undefined)} variant="subtle">
              {t('clear')}
            </Button>
            <Button colorPalette="brand" onClick={handleCreateBooking}>
              {t('booking')}
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </Page>
  );
};

export default RoomsPage;
