import { type DateTime } from 'luxon';
import { useMemo } from 'react';
import { DateRange } from '../types/DatePicker.types';

type UseCalendarDayRangeParams = {
  currentDisabledRange: DateRange | undefined;
  date: DateTime;
  dateSelectedFrom?: DateTime;
  dateSelectedTo?: DateTime;
  interactive: boolean;
};

const useCalendarDayRange = ({
  currentDisabledRange,
  date,
  dateSelectedFrom,
  dateSelectedTo,
  interactive,
}: UseCalendarDayRangeParams): 'single' | 'rangeStart' | 'rangeEnd' | 'rangeMid' | undefined => {
  return useMemo(() => {
    if (!interactive) return undefined;

    // Use currentDisabledRange if it exists and is editable, otherwise fall back to selected dates
    const useDisabledRange = currentDisabledRange && currentDisabledRange.editable;
    const rangeFrom = useDisabledRange ? currentDisabledRange.from : dateSelectedFrom;
    const rangeTo = useDisabledRange ? currentDisabledRange.to : dateSelectedTo;

    const hasSelectionRange = rangeFrom && rangeTo && !rangeFrom.equals(rangeTo);

    const orderedFrom = rangeFrom && rangeTo && rangeFrom > rangeTo ? rangeTo : rangeFrom;
    const orderedTo = rangeFrom && rangeTo && rangeFrom > rangeTo ? rangeFrom : rangeTo;

    if (orderedFrom && orderedTo && orderedFrom.hasSame(orderedTo, 'day') && date.hasSame(orderedFrom, 'day')) {
      return 'single';
    }

    if (orderedFrom && date.hasSame(orderedFrom, 'day')) {
      return 'rangeStart';
    }

    if (orderedTo && date.hasSame(orderedTo, 'day')) {
      return 'rangeEnd';
    }

    if (hasSelectionRange && orderedFrom && orderedTo && date > orderedFrom && date < orderedTo) {
      return 'rangeMid';
    }

    return undefined;
  }, [date, dateSelectedFrom, dateSelectedTo, interactive, currentDisabledRange]);
};

export default useCalendarDayRange;
