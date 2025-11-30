import Room from '@/types/Room';
import { createListCollection, Select } from '@chakra-ui/react';

type RoomDropdownProps = {
  rooms: Room[];
};

const RoomDropdown = ({ rooms }: RoomDropdownProps) => {
  const roomCollection = createListCollection({
    items: rooms.map((room) => ({ label: room.name, value: room.id })),
  });

  return (
    <Select.Root collection={roomCollection}>
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
