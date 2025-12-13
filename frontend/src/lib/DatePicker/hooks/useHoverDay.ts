import { DateTime } from 'luxon';
import { useState, useCallback } from 'react';

type UseHandlePreviewParams = {
  dateFrom?: DateTime;
  dateTo?: DateTime;
  setDateTo: (date: DateTime | undefined) => void;
};

const useHoverDay = ({ dateFrom, dateTo, setDateTo }: UseHandlePreviewParams) => {
  const [preview, setPreview] = useState<'from' | 'to' | undefined>(undefined);

  const handleHover = useCallback(
    (date: DateTime) => {
      if (!preview) {
        return;
      }
      if (dateFrom) {
        if (date > dateFrom) {
          setPreview('to');
        } else {
          setPreview('from');
        }
      }
      setDateTo(date);
    },
    [preview, dateFrom, dateTo],
  );

  return {
    handleHover,
    preview,
    setPreview,
  };
};

export default useHoverDay;
