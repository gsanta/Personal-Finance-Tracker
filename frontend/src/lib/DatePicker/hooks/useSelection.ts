import { useState, useEffect, useMemo } from 'react';
import { createDateRange, DateRange } from './useDateRange';
import { DateTime } from 'luxon';
import DatePickerProps from '../types/DatePickerProps';

type UseSelectionParams = {
  mode: DatePickerProps['mode'];
  selected: DatePickerProps['selected'];
};

const useSelection = ({ mode, selected }: UseSelectionParams) => {
  const initialRange = useMemo<DateRange | undefined>(
    () => (mode === 'day' ? selected && createDateRange(selected as DateTime) : (selected as DateRange)),
    [selected, mode],
  );

  const [dateFrom, setDateFrom] = useState(initialRange?.from);
  const [dateTo, setDateTo] = useState(initialRange?.to);

  useEffect(() => {
    if (!initialRange?.from || !dateFrom?.equals(initialRange.from)) {
      const newDateFrom = initialRange?.from;
      setDateFrom(newDateFrom);
    }
  }, [initialRange]);

  useEffect(() => {
    if (!initialRange?.to || !dateTo?.equals(initialRange.to)) {
      setDateTo(initialRange?.to);
    }
  }, [initialRange]);

  return {
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
  };
};

export default useSelection;
