import { DateTime } from 'luxon';
import { DatePickerDayViewProps } from '../DatePickerDay';
import { DateRange } from '../hooks/useDateRange';

type DatePickerProps = {
  disabledRanges?: DateRange[];
  dayTooltip?: DatePickerDayViewProps['tooltip'];
  isMobile: boolean;
  onClose?: () => void;
  selectable?: DateRange;
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

export default DatePickerProps;
