import { DateTime } from 'luxon';
import { DateRange } from './useDateRange';
import type { DatePickerDayViewProps } from './DatePickerDay';
import { createContext } from '@chakra-ui/react';

interface Context {
  dayTooltip?: DatePickerDayViewProps['tooltip'];
  selectable?: DateRange;
  selected?: DateRange;
  today: DateTime;
  preview: 'from' | 'to' | undefined;
  onSelect: (d: DateTime) => void;
  showOutsideMonths: boolean;
  onPreview: (d: DateTime) => void;
}
export const [DatePickerContext, useDatePickerContext] = createContext<Context>();
