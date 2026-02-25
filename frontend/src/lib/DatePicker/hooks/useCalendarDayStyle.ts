import { DateRange } from '../types/DatePicker.types';

type UseCalendarDayStyleParams = {
  isToday: boolean;
  isCurrentMonth: boolean;
  range?: DateRange;
};

const useCalendarDayStyle = ({
  isToday,
  isCurrentMonth,
  range,
}: UseCalendarDayStyleParams): undefined | 'deletable' | 'n/a' | 'today' => {
  if (range?.editable) {
    return 'deletable';
  }

  if (isToday) {
    return 'today';
  }

  if (!isCurrentMonth) {
    return 'n/a';
  }

  return undefined;
};

export default useCalendarDayStyle;
