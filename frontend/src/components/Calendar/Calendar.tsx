import DateRangePicker from '@wojtekmaj/react-daterange-picker';
// import 'react-calendar/dist/Calendar.css';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import './Calendar.css';
import { useState } from 'react';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const Calendar = () => {
  const [value, onChange] = useState<Value>([new Date(), new Date()]);
  return (
    <DateRangePicker closeCalendar={false} isOpen shouldCloseCalendar={() => false} value={value} onChange={onChange} />
  );
};

export default Calendar;
