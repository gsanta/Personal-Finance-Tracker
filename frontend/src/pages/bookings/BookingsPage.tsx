import Calendar from '@/components/Calendar/Calendar';
import Page from '@/components/Page';
import { Box } from '@chakra-ui/react';

const BookingsPage = () => {
  return (
    <Page>
      <Box
        display="flex"
        flexDir="column"
        alignItems="center"
        padding="4"
        minHeight="calc(100vh - 42px)"
        overflowY="auto"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: '66.67%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '33.33%',
          filter: 'blur(3px)',
          zIndex: 0,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '66.67%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '33.33%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }}
      >
        <Box marginTop="2rem" position="relative" zIndex={2}>
          <Calendar />
        </Box>
      </Box>
    </Page>
  );
};

export default BookingsPage;
