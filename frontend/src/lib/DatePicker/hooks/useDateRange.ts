import { useMemo } from 'react';
import { DateTime } from 'luxon';

export type DateRange = {
  from?: DateTime;
  to?: DateTime;
};

export function createDateRange(date1?: DateTime, date2?: DateTime): DateRange {
  return {
    from: !date1 || !date2 || date1 < date2 ? date1 : date2,
    to: !date1 || !date2 || date1 < date2 ? date2 : date1,
  };
}

function useDateRange(range: [DateTime | undefined, DateTime | undefined]): DateRange;
function useDateRange(from?: DateTime, to?: DateTime): DateRange;
function useDateRange(arg1?: DateTime | [DateTime | undefined, DateTime | undefined], arg2?: DateTime): DateRange {
  let from = arg1;
  let to = arg2;
  if (!to && Array.isArray(from)) {
    to = DateTime.max(...(from.filter(Boolean) as DateTime[]));
    from = DateTime.min(...(from.filter(Boolean) as DateTime[]));
  } else {
    from = from as DateTime | undefined;
    to = to as DateTime | undefined;
  }
  const fromParts = from?.toObject();
  const toParts = to?.toObject();
  return useMemo(
    () => ({ from: from as DateTime | undefined, to: to as DateTime | undefined }),
    [fromParts?.year, fromParts?.month, fromParts?.day, toParts?.year, toParts?.month, toParts?.day],
  );
}

export default useDateRange;
