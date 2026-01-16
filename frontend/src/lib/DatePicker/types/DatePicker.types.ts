import { DateTime } from 'luxon';

export type DateRange = {
  editable?: boolean;
  from?: DateTime;
  to?: DateTime;
};

export type DatePickerProps = {
  disabledRanges?: DateRange[];
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
