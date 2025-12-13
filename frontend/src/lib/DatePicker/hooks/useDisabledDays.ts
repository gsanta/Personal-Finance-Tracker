import { useMemo } from 'react';
import { DateRange } from '../DatePicker';

const useDisabledDays = (disabledRanges: DateRange[] | undefined) => {
  const disabledDays = useMemo(() => {
    if (!disabledRanges || disabledRanges.length === 0) {
      return new Set<string>();
    }

    const disabledSet = new Set<string>();

    disabledRanges.forEach((range) => {
      if (range.from && range.to) {
        let current = range.from.startOf('day');
        const end = range.to.startOf('day');

        while (current <= end) {
          disabledSet.add(current.toISODate()!);
          current = current.plus({ days: 1 });
        }
      } else if (range.from) {
        // If only 'from' is specified, disable that single day
        disabledSet.add(range.from.startOf('day').toISODate()!);
      } else if (range.to) {
        // If only 'to' is specified, disable that single day
        disabledSet.add(range.to.startOf('day').toISODate()!);
      }
    });

    return disabledSet;
  }, [disabledRanges]);

  return disabledDays;
};

export default useDisabledDays;
