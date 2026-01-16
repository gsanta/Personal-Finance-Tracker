import { useMemo } from 'react';

type UseCalendarDayNumberParams = {
  datePickerGridIndex: number;
  currentMonthStartsAtDayOfWeek: number;
  currentMonthDaysInMonth: number;
  daysInPreviousMonth: number;
  isPreviousMonth: boolean;
  isCurrentMonth: boolean;
  isNextMonth: boolean;
};

const useCalendarDayInMonthNumber = ({
  datePickerGridIndex,
  currentMonthStartsAtDayOfWeek,
  currentMonthDaysInMonth,
  daysInPreviousMonth,
  isPreviousMonth,
  isCurrentMonth,
  isNextMonth,
}: UseCalendarDayNumberParams): number => {
  return useMemo(() => {
    if (isPreviousMonth) {
      const daysFromMonthStart = currentMonthStartsAtDayOfWeek - datePickerGridIndex - 1;
      return daysInPreviousMonth - daysFromMonthStart;
    }

    if (isCurrentMonth) {
      return datePickerGridIndex - currentMonthStartsAtDayOfWeek + 1;
    }

    if (isNextMonth) {
      return datePickerGridIndex - currentMonthStartsAtDayOfWeek - currentMonthDaysInMonth + 1;
    }

    return 1; // fallback, should never reach here
  }, [
    datePickerGridIndex,
    currentMonthStartsAtDayOfWeek,
    currentMonthDaysInMonth,
    daysInPreviousMonth,
    isPreviousMonth,
    isCurrentMonth,
    isNextMonth,
  ]);
};

export default useCalendarDayInMonthNumber;
