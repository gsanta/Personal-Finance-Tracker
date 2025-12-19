import Room from '@/types/Room';
import { createListCollection, Select } from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { BookingForm } from '../RoomsPage';

type RoomDropdownProps = {
  rooms: Room[];
};

const RoomDropdown = ({ rooms }: RoomDropdownProps) => {
  const { t } = useTranslation();

  const roomCollection = createListCollection({
    items: rooms.map((room) => ({ label: room.name, value: room.id })),
  });

  const { control } = useFormContext<BookingForm>();

  return (
    <Controller
      control={control}
      name="roomId"
      render={({ field }) => (
        <Select.Root
          collection={roomCollection}
          value={[field.value]}
          onValueChange={(e) => field.onChange(e.value[0])}
          width="340px"
        >
          <Select.HiddenSelect />
          <Select.Label>{t('select_room')}</Select.Label>

          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
              <Select.ClearTrigger />
            </Select.IndicatorGroup>
          </Select.Control>

          <Select.Positioner>
            <Select.Content>
              {roomCollection.items.map((room) => (
                <Select.Item item={room} key={room.value}>
                  {room.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      )}
    />
  );
};

export default RoomDropdown;
