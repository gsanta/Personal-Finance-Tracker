import Calendar from '@/components/Calendar/Calendar';
import Page from '@/components/Page';

const BookingsPage = () => {
  return (
    <Page>
      <div className="flex flex-col gap-4 items-center p-6">
        <div className="flex gap-4 items-start w-full">
          <Calendar />
        </div>
      </div>
    </Page>
  );
};

export default BookingsPage;
