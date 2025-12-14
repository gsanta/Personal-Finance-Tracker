import { useMemo } from 'react';
import { DateTime } from 'luxon';
import DatePickerMonth from './DatePickerMonth';
import { DatePickerContext } from './DatePicker.context';
import DatePickerFooter from './DatePickerFooter';
import { Box, Separator } from '@chakra-ui/react';
import useDisabledDays from './hooks/useDisabledDays';
import useDateRange from './hooks/useDateRange';
import DatePickerProps from './types/DatePickerProps';
import useSelection from './hooks/useSelection';
import useViewDate from './hooks/useViewDate';
import useSelectDay from './hooks/useSelectDay';
import useHoverDay from './hooks/useHoverDay';

export function useObjectMemo<T extends object>(obj: T): T {
  return useMemo(() => {
    return obj;
  }, Object.values(obj));
}

const DatePicker = (props: DatePickerProps) => {
  const { dayTooltip, disabledRanges, isMobile, mode, onApply, selectable, selected } = props;

  const disabledDays = useDisabledDays(disabledRanges);

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
    dayTooltip,
    disabledDays,
    leftViewDate,
    mode: mode || 'range',
    onPreview: handleHover,
    onSelect: handleSelect,
    preview,
    rightViewDate,
    selectable,
    selected: useDateRange([dateFrom, dateTo]),
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
            viewDate={leftViewDate}
          />

          {!isSingleMonthView && (
            <>
              <Separator
                borderColor="{colors.brand.subtle}"
                ml="{sizes.16}"
                orientation="vertical"
                height="360px"
                size="md"
              />
              <DatePickerMonth controls="right" onViewDateChange={setRightViewDate} viewDate={rightViewDate} />
            </>
          )}
        </Box>
        <DatePickerFooter mode={mode || 'range'} />
      </Box>
    </DatePickerContext>
  );
};

export default DatePicker;
