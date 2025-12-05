import Room from '@/types/Room';
import { createListCollection, Select } from '@chakra-ui/react';
import { useMemo } from 'react';

type RoomDropdownProps = {
  onChange: (roomId: string) => void;
  rooms: Room[];
  value: string;
};

const RoomDropdown = ({ rooms, value, onChange }: RoomDropdownProps) => {
  const roomCollection = createListCollection({
    items: rooms.map((room) => ({ label: room.name, value: room.id })),
  });

  const values = useMemo(() => [value], [value]);

  return (
    <Select.Root collection={roomCollection} value={values} onValueChange={(e) => onChange(e.value[0])} width="320px">
      <Select.HiddenSelect />
      <Select.Label />

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
  );
};

export default RoomDropdown;
