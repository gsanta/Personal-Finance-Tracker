import { createListCollection } from '@chakra-ui/react/collection';
import { Portal, Select } from '@chakra-ui/react';
import { useDatePickerContext } from './DatePicker.context';

const months = createListCollection({
  items: [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ],
});

type MonthSelectProps = {
  side: 'left' | 'right';
};

const MonthSelect = ({ side }: MonthSelectProps) => {
  const { leftViewDate, rightViewDate, setLeftViewDate, setRightViewDate } = useDatePickerContext();

  const viewDate = side === 'left' ? leftViewDate : rightViewDate;

  const setDate = side === 'left' ? setLeftViewDate : setRightViewDate;

  const isReadonly = side === 'right';

  return (
    <Select.Root
      collection={months}
      value={[viewDate.get('month').toString()]}
      onValueChange={(e) => setDate(viewDate.set({ month: Number(e.value) }))}
      readOnly={isReadonly}
      size="md"
      variant="subtle"
      width="{sizes.128}"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Select month" />
        </Select.Trigger>
        {!isReadonly && (
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        )}
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {months.items.map((month) => (
              <Select.Item item={month} key={month.value}>
                {month.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default MonthSelect;
