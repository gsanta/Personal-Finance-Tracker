import { useCallback, useEffect, useReducer } from 'react';
import { DateObjectUnits, DateTime } from 'luxon';

function viewDateReducer(
  state: {
    left: DateTime<true>;
    right: DateTime<true>;
  },
  action: { left: DateTime | DateObjectUnits } | { right: DateTime | DateObjectUnits },
) {
  if ('left' in action) {
    const left = DateTime.isDateTime(action.left) ? action.left : state.left.set(action.left);
    return { left, right: left.plus({ months: 1 }).startOf('month') };
  }
  const right = DateTime.isDateTime(action.right) ? action.right : state.right.set(action.right);
  return { left: right.minus({ months: 1 }).startOf('month'), right };
}

function useViewDate({ dateFrom }: { dateFrom?: DateTime }): {
  leftViewDate: DateTime;
  rightViewDate: DateTime;
  setLeftViewDate: (date: DateTime | DateObjectUnits) => void;
  setRightViewDate: (date: DateTime | DateObjectUnits) => void;
} {
  const initLeft = (dateFrom || DateTime.now()).startOf('month');
  const initRight = initLeft.plus({ months: 1 }).startOf('month');
  const initialState = { left: initLeft, right: initRight };

  const [{ left: leftViewDate, right: rightViewDate }, updateViewDate] = useReducer(viewDateReducer, initialState);
  const setLeftViewDate = useCallback((date: DateTime | DateObjectUnits) => updateViewDate({ left: date }), []);
  const setRightViewDate = useCallback((date: DateTime | DateObjectUnits) => updateViewDate({ right: date }), []);

  return {
    leftViewDate,
    rightViewDate,
    setLeftViewDate,
    setRightViewDate,
  };
}

export default useViewDate;
