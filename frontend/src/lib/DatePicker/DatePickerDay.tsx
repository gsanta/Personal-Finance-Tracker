import { useMemo } from 'react';
import { DateTime, Settings } from 'luxon';
import { useDatePickerContext } from './DatePicker.context';
import { useSlotRecipe } from '@chakra-ui/react/styled-system';
import { datePickerDayRecipe } from './DatePickerDay.recipe';
import { Box, Text } from '@chakra-ui/react';
import useCalendarDayRange from './hooks/useCalendarDayRange';
import useCalendarDayStyle from './hooks/useCalendarDayStyle';
import useCalendarDayInMonthNumber from './hooks/useCalendarDayInMonthNumber';

// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64995
Settings.throwOnInvalid = true;

declare module 'luxon' {
  export interface TSSettings {
    throwOnInvalid: true;
  }
}

type DatePickerDayProps = {
  datePickerGridIndex: number;
  monthFirstDay: DateTime;
};

const DatePickerDay = ({ datePickerGridIndex, monthFirstDay }: DatePickerDayProps) => {
  const {
    disabledRanges,
    onPreview,
    onSelect,
    selectable,
    selected,
    showOutsideMonths: showOutsideDays,
    today,
  } = useDatePickerContext();
  const { from: dateSelectableFrom, to: dateSelectableTo } = selectable || {};
  const { from: dateSelectedFrom, to: dateSelectedTo } = selected || {};

  const date = monthFirstDay.plus({ days: datePickerGridIndex - monthFirstDay.weekday });
  const daysInPreviousMonth = monthFirstDay.minus({ month: 1 }).daysInMonth;

  const dayOfWeek = monthFirstDay.weekday;
  const daysInMonth = monthFirstDay.daysInMonth;

  const currentMonthStartsAtDayOfWeek = monthFirstDay.weekday;
  const currentMonthDaysInMonth = monthFirstDay.daysInMonth;

  const isPreviousMonth = datePickerGridIndex < dayOfWeek;
  const isNextMonth = datePickerGridIndex - dayOfWeek >= daysInMonth;
  const isCurrentMonth = !isPreviousMonth && !isNextMonth;
  const isAfterSelectableFromDate = !dateSelectableFrom || date >= dateSelectableFrom;
  const isBeforeSelectableToDate = !dateSelectableTo || date <= dateSelectableTo;
  const currentDisabledRange = useMemo(
    () =>
      disabledRanges?.find((range) => {
        const fromDate = range.from;
        const toDate = range.to;
        return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
      }),
    [disabledRanges, date],
  );
  const isSelectable = !currentDisabledRange && isAfterSelectableFromDate && isBeforeSelectableToDate;
  const isToday = today.equals(
    monthFirstDay.set({ day: datePickerGridIndex - currentMonthStartsAtDayOfWeek + 1 }).startOf('day'),
  );

  const interactive = isCurrentMonth || showOutsideDays;

  const range = useCalendarDayRange({
    currentDisabledRange,
    date,
    dateSelectedFrom,
    dateSelectedTo,
    interactive,
  });

  const style = useCalendarDayStyle({
    isToday,
    isCurrentMonth,
    range: currentDisabledRange,
  });

  const recipe = useSlotRecipe({ recipe: datePickerDayRecipe });
  const styles = recipe({
    range,
    style,
  });

  const dayInMonthNumber = useCalendarDayInMonthNumber({
    datePickerGridIndex,
    currentMonthStartsAtDayOfWeek,
    currentMonthDaysInMonth,
    daysInPreviousMonth,
    isPreviousMonth,
    isCurrentMonth,
    isNextMonth,
  });

  const customProps: Record<string, unknown> = {};

  if (range) {
    customProps['data-range'] = range;
  }

  if (style) {
    customProps['data-style'] = style;
  }

  // Add group identifier if the day belongs to a disabled range
  if (currentDisabledRange) {
    customProps['data-group'] =
      `group-${currentDisabledRange.from?.toISODate()}-${currentDisabledRange.to?.toISODate()}`;
  }

  // Group hover handlers
  const handleGroupHover = (enter: boolean) => {
    if (!currentDisabledRange) return;

    const groupId = `group-${currentDisabledRange.from?.toISODate()}-${currentDisabledRange.to?.toISODate()}`;
    const groupElements = document.querySelectorAll(`[data-group="${groupId}"]`);

    groupElements.forEach((element) => {
      if (enter) {
        element.classList.add('group-hover');
      } else {
        element.classList.remove('group-hover');
      }
    });
  };

  customProps['aria-selected'] = Boolean(range);

  if (isNextMonth && !showOutsideDays) {
    return null;
  }
  if (isPreviousMonth && !showOutsideDays) {
    return <div />;
  }

  return (
    <Box
      asChild
      css={styles.day}
      disabled={!isSelectable && !currentDisabledRange?.editable}
      onClick={() => isSelectable && onSelect(date)}
      onFocus={() => isSelectable && onPreview(date)}
      onMouseEnter={() => {
        if (isSelectable) onPreview(date);
        handleGroupHover(true);
      }}
      onMouseLeave={() => handleGroupHover(false)}
      role="option"
    >
      <button type="button" {...customProps}>
        <Text css={styles.text}>{dayInMonthNumber}</Text>
      </button>
    </Box>
  );
};

export default DatePickerDay;
