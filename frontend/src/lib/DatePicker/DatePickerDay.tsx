import { ReactNode, useCallback, useMemo } from 'react';
import { DateTime, Settings } from 'luxon';
import { useDatePickerContext } from './DatePicker.context';
import { useSlotRecipe } from '@chakra-ui/react/styled-system';
import { datePickerDayRecipe } from './DatePickerDay.recipe';
import { Box, createContext, Text } from '@chakra-ui/react';
import { Tooltip } from '../tooltip';
import { ButtonProps } from '@/components/button';

// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64995
Settings.throwOnInvalid = true;

declare module 'luxon' {
  export interface TSSettings {
    throwOnInvalid: true;
  }
}

interface Context {
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  viewDate: DateTime;
}
export interface DatePickerDayViewProps {
  tooltip?(day: Pick<DatePickerDayViewProps, 'selectable' | 'date'>): string | undefined;
  onClick: () => void;
  date: DateTime;
  onMouseEnter: () => void;
  selectable: boolean;
  today: boolean;
  currentMonth: boolean;
  showOutsideDays: boolean;
  preview: 'from' | 'to' | undefined;
  selection?: 'from' | 'to' | 'between' | 'incomplete';
  children: ReactNode;
}

const DatePickerDayView = ({
  children,
  currentMonth,
  date,
  tooltip,
  onClick,
  onMouseEnter,
  preview,
  selectable,
  selection,
  today,
}: DatePickerDayViewProps) => {
  const recipe = useSlotRecipe({ recipe: datePickerDayRecipe });
  const styles = recipe({
    currentMonth,
    disabled: !selectable,
    today,
    selection,
    beingMoved: selection === preview,
  });

  const ariaProps: ButtonProps = {};

  if (currentMonth) {
    ariaProps['aria-selected'] =
      selection === 'from' || selection === 'to' || selection === 'incomplete' || selection === 'between';
  } else {
    ariaProps.tabIndex = -1;
  }

  const tooltipText = tooltip?.({ selectable, date });

  return (
    <Tooltip content={tooltipText} disabled={!tooltipText}>
      <Box
        asChild
        {...ariaProps}
        css={styles.day}
        disabled={!selectable}
        onClick={onClick}
        onFocus={onMouseEnter}
        onMouseEnter={onMouseEnter}
        role="option"
        type="button"
      >
        <button>
          <Text css={styles.text}>{children}</Text>
        </button>
      </Box>
    </Tooltip>
  );
};
const [DatePickerDayContext, useDatePickerDayContext] = createContext<Context>();
export { DatePickerDayContext };

const DatePickerDay = ({ n }: { n: number }) => {
  const {
    disabledDays,
    onPreview,
    onSelect,
    dayTooltip,
    preview,
    selectable,
    selected,
    showOutsideMonths: showOutsideDays,
    today,
  } = useDatePickerContext();
  const { onNextMonth, onPreviousMonth, viewDate } = useDatePickerDayContext();
  const { from: dateSelectableFrom, to: dateSelectableTo } = selectable || {};
  const { from: dateSelectedFrom, to: dateSelectedTo } = selected || {};

  const date = viewDate.plus({ days: n - viewDate.weekday });
  const isoDate = useMemo(() => date.toISODate()!, [date]);
  const daysInPreviousMonth = viewDate.minus({ month: 1 }).daysInMonth;

  const dayOfWeek = viewDate.weekday;
  const { daysInMonth } = viewDate;

  const isPreviousMonth = n < dayOfWeek;
  const isNextMonth = n - dayOfWeek >= daysInMonth;
  const isCurrentMonth = !isPreviousMonth && !isNextMonth;
  const isAfterSelectableFromDate = !dateSelectableFrom || date >= dateSelectableFrom;
  const isBeforeSelectableToDate = !dateSelectableTo || date <= dateSelectableTo;
  const isSelectable = !disabledDays.has(isoDate) && isAfterSelectableFromDate && isBeforeSelectableToDate;

  const hasSelectionRange = dateSelectedFrom && dateSelectedTo && !dateSelectedFrom.equals(dateSelectedTo);

  let selection: 'from' | 'to' | 'between' | 'incomplete' | undefined;
  const interactive = isCurrentMonth || showOutsideDays;
  if (hasSelectionRange && interactive && date > dateSelectedFrom && date < dateSelectedTo) {
    selection = 'between';
  }
  if (interactive && dateSelectedFrom && date.equals(dateSelectedFrom)) {
    selection = hasSelectionRange ? 'from' : 'incomplete';
  }
  if (interactive && dateSelectedTo && date.equals(dateSelectedTo)) {
    selection = hasSelectionRange ? 'to' : 'incomplete';
  }

  const onClick = useCallback(() => {
    if (!isSelectable) {
      return;
    }
    onSelect(date);
    if (isPreviousMonth) {
      onPreviousMonth();
    } else if (isNextMonth) {
      onNextMonth();
    }
  }, [isPreviousMonth, isSelectable, onSelect, date, onPreviousMonth, onNextMonth]);
  const onMouseEnter = useCallback(() => {
    if (isSelectable) {
      onPreview(date);
    }
  }, [onSelect, isSelectable, date]);

  if (isNextMonth && !showOutsideDays) {
    return null;
  }
  if (isPreviousMonth && !showOutsideDays) {
    return <div />;
  }
  return (
    <DatePickerDayView
      currentMonth={isCurrentMonth}
      date={date}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      preview={preview}
      selectable={isSelectable}
      selection={selection}
      showOutsideDays={showOutsideDays}
      today={today.equals(viewDate.set({ day: n - dayOfWeek + 1 }).startOf('day'))}
      tooltip={dayTooltip}
    >
      {isPreviousMonth && daysInPreviousMonth - (dayOfWeek - n - 1)}
      {isCurrentMonth && n - dayOfWeek + 1}
      {isNextMonth && n - dayOfWeek - daysInMonth + 1}
    </DatePickerDayView>
  );
};

export default DatePickerDay;
