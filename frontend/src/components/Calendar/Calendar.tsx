import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import './Calendar.scss';
import { useMemo, useState } from 'react';
import { DateRange as _DateRange } from 'react-date-range';
import { addDays, isWithinInterval, isSameDay } from 'date-fns';

export type DateRange = {
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  color?: string | undefined;
  key?: string | undefined;
};

type CalendarProps = {
  onRangeChange: (range: DateRange) => void;
  ranges: DateRange[];
};

const Calendar = ({ onRangeChange, ranges }: CalendarProps) => {
  const [state, setState] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
    key: 'selection',
  });

  const rdrNoSelection = useMemo(() => {
    const range = ranges?.[0];
    return !range || (!range.startDate && !range.endDate);
  }, [ranges]);

  return (
    <_DateRange
      className={rdrNoSelection ? 'rdrNoSelection' : ''}
      disabledDay={(date: Date) => {
        return ranges.some((range) => {
          if (!range.startDate || !range.endDate) return false;
          return (
            isWithinInterval(date, {
              start: range.startDate,
              end: range.endDate,
            }) ||
            isSameDay(date, range.startDate) ||
            isSameDay(date, range.endDate)
          );
        });
      }}
      // focusedRange={[0, activeRangeIndex]}
      onChange={(item) => {
        onRangeChange(item.selection);
        setState(item.selection);
        // setActiveRangeIndex(activeRangeIndex === 0 ? 1 : 0);
      }}
      onPreviewChange={(date) => {
        console.log(date);
      }}
      moveRangeOnFirstSelection={false}
      ranges={state ? [state] : undefined}
      direction="horizontal"
    />
  );
};

export default Calendar;
