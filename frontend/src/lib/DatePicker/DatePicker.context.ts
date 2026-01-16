import { DateTime } from 'luxon';
import { createContext } from '@chakra-ui/react';
import { DateRange } from './types/DatePicker.types';

interface Context {
  disabledRanges: DateRange[];
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
