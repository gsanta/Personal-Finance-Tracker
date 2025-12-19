import { createListCollection } from '@chakra-ui/react/collection';
import { Portal, Select } from '@chakra-ui/react';
import { useDatePickerContext } from './DatePicker.context';
import { useMemo } from 'react';

type MonthSelectProps = {
  side: 'left' | 'right';
};

const MonthSelect = ({ side }: MonthSelectProps) => {
  const { leftViewDate, rightViewDate, setLeftViewDate, setRightViewDate } = useDatePickerContext();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return createListCollection({
      items: [currentYear - 1, currentYear, currentYear + 1].map((year) => ({
        label: year.toString(),
        value: year.toString(),
      })),
    });
  }, []);

  const viewDate = side === 'left' ? leftViewDate : rightViewDate;
  const setDate = side === 'left' ? setLeftViewDate : setRightViewDate;

  const isReadonly = side === 'right';

  return (
    <Select.Root
      collection={years}
      value={[viewDate.get('year').toString()]}
      onValueChange={(e) => setDate(viewDate.set({ year: Number(e.value) }))}
      readOnly={isReadonly}
      variant="subtle"
      width="{sizes.96}"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText />
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
            {years.items.map((year) => (
              <Select.Item item={year} key={year.value}>
                {year.label}
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
