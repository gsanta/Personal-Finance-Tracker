import Page from '@/components/Page';
import { Alert, Box, Button, ButtonGroup, Heading, Separator, Switch, Textarea } from '@chakra-ui/react';
import Room from '@/types/Room';
import RoomDropdown from './components/RoomDropdown';
import Booking from '@/types/Booking';
import { useState, useMemo, useEffect, useRef } from 'react';
import useBookRoom from '@/hooks/useBookRoom';
import DatePicker from '@/lib/DatePicker/DatePicker';
import { DateTime } from 'luxon';
import { t } from 'i18next';
import useResponsive from '@/utils/useResponsive';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import CatInputList from './components/CatInputList';
import { DateRange } from '@/lib/DatePicker/types/DatePicker.types';
import { createDateRange } from '@/lib/DatePicker/hooks/useSelection';
import { getFieldErrorMessage } from '@/utils/validation';

type RoomsPageProps = {
  bookings: Booking[];
  rooms: Room[];
};

export type BookingForm = {
  cats: {
    name: string;
  }[];
  notes: string;
  foodFromOwner: boolean;
  range: DateRange;
  roomId: string;
};

const RoomsPage = ({ bookings, rooms }: RoomsPageProps) => {
  const { isMobile } = useResponsive();

  const [isSticky, setIsSticky] = useState(false);
  const buttonGroupRef = useRef<HTMLDivElement>(null);

  const methods = useForm<BookingForm>({
    defaultValues: {
      cats: [{ name: '' }],
      notes: '',
      foodFromOwner: false,
      range: undefined,
      roomId: rooms[0]?.id || '',
    },
  });

  const { control, formState, handleSubmit, register, reset, setError, watch } = methods;

  const selectedRoomId = watch('roomId');

  useEffect(() => {
    reset({ roomId: rooms[0].id });
  }, [rooms]);

  useEffect(() => {
    if (!buttonGroupRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      },
    );

    return () => observer.disconnect();
  }, []);

  const bookingsForSelectedRoom = useMemo(
    () => bookings.filter((booking) => booking.roomId === selectedRoomId),
    [bookings, selectedRoomId],
  );

  const { createBooking, createBookingError, isCreateBookingLoading, isCreateBookingSuccess } = useBookRoom();

  useEffect(() => {
    if (createBookingError) {
      const filedError = createBookingError.response?.data?.errors?.['cats'];
      if (filedError) {
        setError('cats', {
          type: 'manual',
          message: getFieldErrorMessage(filedError),
        });
      }
    }
  }, [createBookingError, reset]);

  console.log(formState.errors);

  const handleCreateBooking = handleSubmit((data: BookingForm) => {
    if (selectedRoomId && data.range?.from && data.range?.to) {
      createBooking({
        endDate: data.range.to.endOf('day').toISO(),
        foodFromOwner: data.foodFromOwner,
        notes: data.notes,
        roomId: selectedRoomId,
        startDate: data.range.from.startOf('day').toISO(),
        cats: data.cats.filter((cat) => cat.name.trim() !== '').map((cat) => cat.name),
      });
    }
  });

  const ranges = useMemo<DateRange[]>(
    () =>
      bookingsForSelectedRoom.map((booking) =>
        createDateRange(DateTime.fromISO(booking.startDate), DateTime.fromISO(booking.endDate), booking.isCurrentUser),
      ),
    [bookingsForSelectedRoom],
  );

  return (
    <Page>
      <Box
        height="calc(100vh - 42px)"
        overflowY="auto"
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingX="4"
        paddingTop="4"
      >
        <FormProvider {...methods}>
          <Box
            as="form"
            marginTop="2rem"
            display="flex"
            flexDirection="column"
            gap="4"
            onSubmit={handleCreateBooking}
            width={['340px', 'initial']}
          >
            <RoomDropdown rooms={rooms} />
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
              <Controller
                control={control}
                name="range"
                render={({ field }) => (
                  <DatePicker
                    disabledRanges={ranges}
                    isMobile={isMobile}
                    onApply={(d) => field.onChange(d)}
                    selected={field.value}
                  />
                )}
              />
              <Separator borderColor="{colors.brand.subtle}" size="md" />
            </Box>
            <CatInputList />
            <Separator borderColor="{colors.brand.subtle}" size="md" />
            <Box display="flex" flexDirection="column" gap="{sizes.32}">
              <Heading pb="{sizes.16}">Egyéb</Heading>
              <Controller
                control={control}
                name="foodFromOwner"
                render={({ field }) => (
                  <Switch.Root
                    colorPalette="brand"
                    checked={field.value}
                    display="flex"
                    justifyContent="space-between"
                    onCheckedChange={(e) => field.onChange(e.checked)}
                    width="100%"
                  >
                    <Switch.HiddenInput />
                    <Switch.Label>Ételt a gazdi hoz?</Switch.Label>
                    <Switch.Control />
                  </Switch.Root>
                )}
              />
              <Textarea placeholder="Egyéb megjegyzés..." {...register('notes')} />
            </Box>
            <Box
              ref={buttonGroupRef}
              position="sticky"
              bottom="0"
              backgroundColor={isSticky ? 'white' : 'transparent'}
              paddingY={isSticky ? '4' : '0'}
              width="100%"
              bgColor="{colors.brand.muted}"
              borderTopWidth="2px"
              borderTopStyle="solid"
              borderTopColor="{colors.brand.solid}"
              paddingInline="{sizes.12}"
              paddingBlock="{sizes.12}"
            >
              {isCreateBookingSuccess && (
                <Alert.Root marginBottom="{sizes.16}" status="success" variant="outline">
                  <Alert.Indicator />
                  <Alert.Title>Sikeres foglalás</Alert.Title>
                </Alert.Root>
              )}
              <ButtonGroup>
                <Button colorPalette="brand" onClick={() => reset()} variant="subtle">
                  {t('clear')}
                </Button>
                <Button colorPalette="brand" loading={isCreateBookingLoading} type="submit" variant="solid">
                  {t('booking')}
                </Button>
              </ButtonGroup>
            </Box>
          </Box>
        </FormProvider>
      </Box>
    </Page>
  );
};

export default RoomsPage;
