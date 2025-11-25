import { ReactNode } from 'react';
import Header from './Header/Header';
import { Box, ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import '../utils/i18n';

type PageProps = {
  children: ReactNode;
};

const config = defineConfig({
  theme: {
    tokens: {
      colors: {},
    },
  },
});

const system = createSystem(defaultConfig, config);

const Page = ({ children }: PageProps) => {
  return (
    <ChakraProvider value={system}>
      <Box background="orange.solid" minHeight="100vh" display="flex" flexDirection="column" alignItems="center">
        <Box bgColor="bg.warning" maxW="100rem" width="100%" minHeight="100vh">
          <Header />
          <Box>
            <div>{children}</div>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default Page;
