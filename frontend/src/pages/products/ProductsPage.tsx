import Page from '@/components/Page';
import { Box, Text } from '@chakra-ui/react';

const ProductsPage = () => {
  return (
    <Page>
      <div className="flex flex-col gap-4 items-center p-6">
        <div className="flex gap-4 items-start w-full">
          {/* Dummy content box for testing sticky behavior */}
          <Box bg="gray.50" h="200vh" p="8">
            <Text fontSize="2xl" mb="4" color="gray.700">
              Dummy Content for Testing Sticky Header
            </Text>
            <Text color="gray.600" mb="4">
              Scroll down to test the sticky header behavior.
            </Text>
            {Array.from({ length: 50 }, (_, i) => (
              <Text key={i} py="2" borderBottom="1px" borderColor="gray.200">
                Content line {i + 1} - This is dummy content to make the page scrollable
              </Text>
            ))}
          </Box>
        </div>
      </div>
    </Page>
  );
};

export default ProductsPage;
