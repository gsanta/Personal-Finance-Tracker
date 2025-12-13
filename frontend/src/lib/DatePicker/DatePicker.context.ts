import { DateTime } from 'luxon';
import { DateRange } from './hooks/useDateRange';
import type { DatePickerDayViewProps } from './DatePickerDay';
import { createContext } from '@chakra-ui/react';

interface Context {
  dayTooltip?: DatePickerDayViewProps['tooltip'];
  disabledDays: Set<string>;
  leftViewDate: DateTime;
  selectable?: DateRange;
  selected?: DateRange;
  today: DateTime;
  preview: 'from' | 'to' | undefined;
  rightViewDate: DateTime;
  onSelect: (d: DateTime) => void;
  setLeftViewDate: (d: DateTime) => void;
  setRightViewDate: (d: DateTime) => void;
  mode: 'day' | 'range';
  showOutsideMonths: boolean;
  onPreview: (d: DateTime) => void;
}
export const [DatePickerContext, useDatePickerContext] = createContext<Context>();
