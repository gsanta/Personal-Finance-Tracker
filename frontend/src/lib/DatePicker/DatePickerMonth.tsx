import { useCallback, useId } from 'react';
import { DateTime, Info } from 'luxon';
import DatePickerGrid from './DatePickerGrid';
import DatePickerDay from './DatePickerDay';
import DatePickerHeader, {
  DatePickerHeaderContent,
  DatePickerHeaderNext,
  DatePickerHeaderPrevious,
} from './DatePickerHeader';
import { Box, Text } from '@chakra-ui/react';
import MonthSelect from './MonthSelect';
import YearSelect from './YearSelect';

const daysOfTheWeek = Info.weekdays('short');
const daysCount = 6 * 7;

interface DatePickerMonthProps {
  controls: 'left' | 'right' | 'both';
  onViewDateChange: (viewDate: DateTime) => void;
  monthFirstDay: DateTime;
}

export const datePickerMinYear = 1990;
export const datePickerMaxYear = 2100;

const DatePickerMonth = ({ controls, onViewDateChange, monthFirstDay }: DatePickerMonthProps) => {
  const onNextMonth = useCallback(
    () => onViewDateChange(monthFirstDay.plus({ months: 1 })),
    [onViewDateChange, monthFirstDay],
  );
  const onPreviousMonth = useCallback(
    () => onViewDateChange(monthFirstDay.minus({ months: 1 })),
    [onViewDateChange, monthFirstDay],
  );

  const monthLabelId = useId();
  return (
    <Box>
      <DatePickerHeader controls={controls} onNext={onNextMonth} onPrevious={onPreviousMonth}>
        {(controls === 'left' || controls === 'both') && <DatePickerHeaderPrevious label="previous month" />}
        <DatePickerHeaderContent id={monthLabelId}>
          <MonthSelect side={controls === 'both' ? 'left' : controls} />
          <YearSelect side={controls === 'both' ? 'left' : controls} />
        </DatePickerHeaderContent>
        {(controls === 'left' || controls === 'both') && <DatePickerHeaderNext label="next month" />}
      </DatePickerHeader>

      <DatePickerGrid alignItems="center" gridTemplateRows="2rem" justifyItems="center">
        {daysOfTheWeek.map((day) => (
          <Text key={day} color="neutral.50" textTransform="capitalize">
            {day}
          </Text>
        ))}
      </DatePickerGrid>
      <DatePickerGrid aria-labelledby={monthLabelId} paddingTop="8" role="listbox">
        {Array.from({ length: daysCount }).map((_, i) => (
          <DatePickerDay key={i + 1} datePickerGridIndex={i + 1} monthFirstDay={monthFirstDay} />
        ))}
      </DatePickerGrid>
    </Box>
  );
};

export default DatePickerMonth;
