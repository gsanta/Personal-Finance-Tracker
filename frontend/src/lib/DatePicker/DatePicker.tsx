import { useMemo } from 'react';
import { DateTime } from 'luxon';
import DatePickerMonth from './DatePickerMonth';
import { DatePickerContext } from './DatePicker.context';
import DatePickerFooter from './DatePickerFooter';
import { Box, Separator } from '@chakra-ui/react';
import useSelection from './hooks/useSelection';
import useViewDate from './hooks/useViewDate';
import useSelectDay from './hooks/useSelectDay';
import useHoverDay from './hooks/useHoverDay';
import { DatePickerProps } from './types/DatePicker.types';

export function useObjectMemo<T extends object>(obj: T): T {
  return useMemo(() => {
    return obj;
  }, Object.values(obj));
}

const DatePicker = (props: DatePickerProps) => {
  const { disabledRanges, isMobile, mode, onApply, selectable, selected } = props;

  const today = DateTime.now().startOf('day');

  const handleApply = (from: typeof dateFrom, to: typeof dateTo) => {
    if (onApply) {
      if (mode === 'day') {
        onApply(from);
      } else {
        onApply({ from, to });
      }
    }
  };

  const { dateFrom, dateTo, setDateFrom, setDateTo } = useSelection({
    mode: mode || 'range',
    selected,
  });

  const { leftViewDate, rightViewDate, setLeftViewDate, setRightViewDate } = useViewDate({
    dateFrom,
  });

  const { handleHover, preview, setPreview } = useHoverDay({
    dateFrom,
    dateTo,
    setDateTo,
  });

  const handleSelect = useSelectDay({
    mode: mode || 'range',
    dateFrom,
    dateTo,
    preview,
    setDateFrom,
    setDateTo,
    setPreview,
    handleApply,
  });

  const isSingleMonthView = mode === 'day' || isMobile;

  const ctx = useObjectMemo({
    disabledRanges: disabledRanges || [],
    leftViewDate,
    mode: mode || 'range',
    onPreview: handleHover,
    onSelect: handleSelect,
    preview,
    rightViewDate,
    selectable,
    selected: useMemo(
      () => ({ from: dateFrom as DateTime | undefined, to: dateTo as DateTime | undefined }),
      [dateFrom, dateTo],
    ),
    setLeftViewDate,
    setRightViewDate,
    showOutsideMonths: isSingleMonthView,
    today,
  });

  return (
    <DatePickerContext value={ctx}>
      <Box>
        <Box display="flex" gap="{sizes.24}">
          <DatePickerMonth
            controls={isSingleMonthView ? 'both' : 'left'}
            onViewDateChange={setLeftViewDate}
            monthFirstDay={leftViewDate}
          />

          {!isSingleMonthView && (
            <>
              <Separator
                borderColor="{colors.brand.subtle}"
                ml="{sizes.8}"
                orientation="vertical"
                height="360px"
                size="md"
              />
              <DatePickerMonth controls="right" onViewDateChange={setRightViewDate} monthFirstDay={rightViewDate} />
            </>
          )}
        </Box>
        <DatePickerFooter mode={mode || 'range'} />
      </Box>
    </DatePickerContext>
  );
};

export default DatePicker;
