import { DateTime } from 'luxon';
import { useCallback } from 'react';

type UseHandleSelectParams = {
  mode: 'day' | 'range';
  dateFrom?: DateTime;
  dateTo?: DateTime;
  preview?: 'from' | 'to';
  setDateFrom: (date?: DateTime) => void;
  setDateTo: (date?: DateTime) => void;
  setPreview: (preview?: 'from' | 'to') => void;
  handleApply: (from: DateTime, to?: DateTime) => void;
};

const useSelectDay = ({
  mode,
  dateFrom,
  dateTo,
  preview,
  setDateFrom,
  setDateTo,
  setPreview,
  handleApply,
}: UseHandleSelectParams) => {
  const handleSelect = useCallback(
    (date: DateTime) => {
      let previewNew: 'from' | 'to' | undefined;
      let dateFromNew = dateFrom;
      let dateToNew = dateTo;

      if (mode === 'day') {
        dateFromNew = date;
      } else if (dateFrom && dateTo) {
        if (!preview) {
          previewNew = 'from';
          dateFromNew = date;
          dateToNew = undefined;
        }
      } else if (dateTo && date > dateTo) {
        dateFromNew = dateTo;
        dateToNew = date;
      } else if (dateFrom && date < dateFrom) {
        dateFromNew = date;
        dateToNew = dateFrom;
      } else if (dateFrom) {
        dateToNew = date;
      } else {
        previewNew = 'from';
        dateFromNew = date;
      }

      setPreview(previewNew);
      setDateFrom(dateFromNew);
      setDateTo(dateToNew);

      if (!dateFromNew || previewNew) {
        return;
      }

      if (mode !== 'day' && !dateToNew) {
        return;
      }

      handleApply(dateFromNew, dateToNew);
    },
    [dateFrom, dateTo, preview],
  );

  return handleSelect;
};

export default useSelectDay;
