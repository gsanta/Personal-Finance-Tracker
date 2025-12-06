import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import DatePickerMonth from './DatePickerMonth';
import { DatePickerContext } from './DatePicker.context';
import DatePickerMonthSelector from './DatePickerMonthSelector';
import useDateRange, { DateRange } from './useDateRange';
import useViewDate from './useViewDate';
import DatePickerFooter from './DatePickerFooter';
import { DatePickerDayViewProps } from './DatePickerDay';
import { Box } from '@chakra-ui/react';

export { useDateRange, DateRange };

export type DatePickerProps = {
  onClose?: () => void;
  dayTooltip?: DatePickerDayViewProps['tooltip'];
  selectable?: DateRange;
  onClear?: () => void;
} & (
  | {
      selected?: DateRange;
      onApply?: (range: DateRange) => void;
      mode?: 'range';
    }
  | {
      selected?: DateTime;
      onApply?: (day?: DateTime) => void;
      mode: 'day';
    }
);

export function useObjectMemo<T extends object>(obj: T): T {
  return useMemo(() => {
    return obj;
  }, Object.values(obj));
}

/**
 * A simple date selection component, that supports a dual month view and
 * range selection.
 */
const DatePicker = (props: DatePickerProps) => {
  const { dayTooltip, mode, onApply, onClear, onClose, selectable, selected } = props;

  const today = DateTime.now().startOf('day');

  const initialRange = useMemo(
    () => (mode === 'day' ? selected && new DateRange(selected) : selected),
    [selected, mode],
  );

  const [dateFrom, setDateFrom] = useState(initialRange?.from);

  const { leftViewDate, rightViewDate, updateLeftViewDate, updateRightViewDate } = useViewDate({
    initalView: dateFrom || selectable?.to,
  });

  useEffect(() => {
    if (!initialRange?.from || !dateFrom?.equals(initialRange.from)) {
      const newDateFrom = initialRange?.from;
      setDateFrom(newDateFrom);
      if (newDateFrom) {
        updateLeftViewDate(newDateFrom.startOf('month'));
      }
    }
  }, [initialRange]);
  const [dateTo, setDateTo] = useState(initialRange?.to);
  useEffect(() => {
    if (!initialRange?.to || !dateTo?.equals(initialRange.to)) {
      setDateTo(initialRange?.to);
    }
  }, [initialRange]);

  const handleClose = () => {
    onClose?.();
    setDateTo(undefined);
    setDateFrom(undefined);
  };

  const handleApply = (from: typeof dateFrom, to: typeof dateTo) => {
    if (onApply) {
      if (mode === 'day') {
        onApply(from);
      } else {
        onApply(new DateRange(from, to));
      }
    }

    handleClose();
  };

  const isSingleMonthView = mode === 'day';

  const [preview, setPreview] = useState<'from' | 'to' | undefined>(undefined);
  const [isMonthSelector, setIsMonthSelector] = useState<'left' | 'right' | undefined>(undefined);

  const handlePreview = useCallback(
    (date: DateTime) => {
      if (!preview) {
        return;
      }
      if (dateFrom) {
        if (date > dateFrom) {
          setPreview('to');
        } else {
          setPreview('from');
        }
      }
      setDateTo(date);
    },
    [preview, dateFrom, dateTo],
  );

  const handleSelect = useCallback(
    (date: DateTime) => {
      let previewNew: 'from' | 'to' | undefined;
      let dateFromNew = dateFrom;
      let dateToNew = dateTo;

      if (mode === 'day') {
        dateFromNew = date;
      } else if (dateFrom && dateTo) {
        if (!preview) {
          previewNew = 'from';
          dateFromNew = date;
          dateToNew = undefined;
        }
      } else if (dateTo && date > dateTo) {
        dateFromNew = dateTo;
        dateToNew = date;
      } else if (dateFrom && date < dateFrom) {
        dateFromNew = date;
        dateToNew = dateFrom;
      } else if (dateFrom) {
        dateToNew = date;
      } else {
        previewNew = 'from';
        dateFromNew = date;
      }

      setPreview(previewNew);
      setDateFrom(dateFromNew);
      setDateTo(dateToNew);

      if (!dateFromNew || previewNew) {
        return;
      }

      if (mode !== 'day' && !dateToNew) {
        return;
      }

      handleApply(dateFromNew, dateToNew);
    },
    [dateFrom, dateTo, preview],
  );

  const currentSelected = useDateRange([dateFrom, dateTo]);
  const ctx = useObjectMemo({
    dayTooltip,
    onPreview: handlePreview,
    onSelect: handleSelect,
    preview,
    selectable,
    selected: currentSelected,
    showOutsideMonths: isSingleMonthView,
    today,
  });

  const onMonthClickLeft = useCallback(() => setIsMonthSelector('left'), []);
  const onMonthClickRight = useCallback(() => setIsMonthSelector('right'), []);
  const onMonthSelected = useCallback(
    (month: number, year: number) => {
      if (isMonthSelector === 'left') {
        updateLeftViewDate({ month, year });
      }
      if (isMonthSelector === 'right') {
        updateRightViewDate({ month, year });
      }
      setIsMonthSelector(undefined);
    },
    [isMonthSelector],
  );

  return (
    <DatePickerContext value={ctx}>
      <Box>
        {isMonthSelector ? (
          <DatePickerMonthSelector
            onMonthSelected={onMonthSelected}
            viewDate={isMonthSelector === 'left' ? leftViewDate : rightViewDate}
          />
        ) : (
          <>
            <Box display="flex" gap="32" marginBottom="24">
              <DatePickerMonth
                controls={isSingleMonthView ? 'both' : 'left'}
                onMonthClick={onMonthClickLeft}
                onViewDateChange={updateLeftViewDate}
                viewDate={leftViewDate}
              />

              {!isSingleMonthView && (
                <DatePickerMonth
                  controls="right"
                  onMonthClick={onMonthClickRight}
                  onViewDateChange={updateRightViewDate}
                  viewDate={rightViewDate}
                />
              )}
            </Box>
            <DatePickerFooter
              mode={mode || 'range'}
              onApply={() => handleApply(dateFrom, dateTo)}
              onClear={onClear}
              onClose={handleClose}
              selected={currentSelected}
            />
          </>
        )}
      </Box>
    </DatePickerContext>
  );
};

export default DatePicker;
