import useBookingDelete from '@/api/bookings/useBookingDelete';
import Page from '@/components/Page';
import { toaster } from '@/components/toaster';
import { Tooltip } from '@/components/tooltip';
import Booking, { BookingPaginated } from '@/types/Booking';
import Room from '@/types/Room';
import { Box } from '@chakra-ui/react/box';
import { IconButton } from '@chakra-ui/react/button';
import { Text } from '@chakra-ui/react/text';
import { Card } from '@chakra-ui/react/card';
import { Table } from '@chakra-ui/react/table';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FcCancel } from 'react-icons/fc';
import { Separator } from '@chakra-ui/react';
import PasswordChangeForm from './components/PasswordChangeForm';
import DeleteProfile from './components/DeleteProfile';

type ProfilePageProps = {
  bookings: BookingPaginated;
  rooms: Room[];
};

const ProfilePage = ({ bookings, rooms }: ProfilePageProps) => {
  const { t } = useTranslation();

  const { mutateAsync: deleteBooking } = useBookingDelete();

  const onDeleteClick = async (bookingId: string) => {
    try {
      await deleteBooking({ id: bookingId });
      toaster.create({
        title: 'Foglalás törölve',
        type: 'success',
      });
    } catch {
      toaster.create({
        title: 'Hiba történt a foglalás törlése során',
        type: 'error',
      });
    }
  };

  const roomMap = useMemo(() => {
    return rooms.reduce(
      (map, room) => {
        map[room.id] = room.name;
        return map;
      },
      {} as Record<string, string>,
    );
  }, [rooms]);

  return (
    <Page>
      <Text mb="{sizes.16}" textStyle="2xl">
        {t('pages.profile.title')}
      </Text>
      <Separator />
      <Box alignItems="center" display="flex" flexDir="column">
        <Card.Root maxW="80rem" margin="{sizes.32}" width="100%">
          <Card.Header>
            <Card.Title>{t('pages.profile.bookings_table_title')}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Table.Root size="sm" interactive>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Room</Table.ColumnHeader>
                  <Table.ColumnHeader>From</Table.ColumnHeader>
                  <Table.ColumnHeader>To</Table.ColumnHeader>
                  <Table.ColumnHeader width={'{sizes.64}'} />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {bookings.items.map((booking) => (
                  <Table.Row key={booking.id}>
                    <Table.Cell>{roomMap[booking.roomId] || booking.roomId}</Table.Cell>
                    <Table.Cell>{DateTime.fromISO(booking.startDate).toLocaleString(DateTime.DATE_MED)}</Table.Cell>
                    <Table.Cell>{DateTime.fromISO(booking.endDate).toLocaleString(DateTime.DATE_MED)}</Table.Cell>
                    <Table.Cell>
                      {booking.cancelable && (
                        <Tooltip content={t('pages.profile.delete_booking_tooltip')}>
                          <IconButton
                            aria-label="Search database"
                            onClick={() => onDeleteClick(booking.id)}
                            variant="outline"
                            size="md"
                          >
                            <FcCancel size="24" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root maxW="80rem" margin="{sizes.32}" width="100%">
          <Card.Header>
            <Card.Title>{t('pages.profile.settings_title')}</Card.Title>
          </Card.Header>
          <Card.Body>
            <PasswordChangeForm />
          </Card.Body>
        </Card.Root>

        <Card.Root maxW="80rem" margin="{sizes.32}" width="100%">
          <Card.Header>
            <Card.Title>{t('pages.profile.settings_title')}</Card.Title>
          </Card.Header>
          <Card.Body alignItems="flex-start">
            <DeleteProfile />
          </Card.Body>
        </Card.Root>
      </Box>
    </Page>
  );
};

export default ProfilePage;
