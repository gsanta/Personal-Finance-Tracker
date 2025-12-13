import { DateTime } from 'luxon';
import { DatePickerDayViewProps } from '../DatePickerDay';
import { DateRange } from '../hooks/useDateRange';

type DatePickerProps = {
  disabledRanges?: DateRange[];
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

export default DatePickerProps;
