import { ReactNode } from 'react';
import Header from './Header/Header';
import { Box, ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import '../utils/i18n';
import config from '@/lib/theme/config';
import { ResponsiveProvider } from '@/utils/useResponsive';
import { Toaster } from './toaster';

type PageProps = {
  children: ReactNode;
};

const system = createSystem(defaultConfig, config);

const Page = ({ children }: PageProps) => {
  return (
    <ChakraProvider value={system}>
      <Box background="orange.solid" minHeight="100vh" display="flex" flexDirection="column" alignItems="center">
        <Box bgColor="bg.warning" maxW="100rem" width="100%" minHeight="100vh">
          <Header />
          <Box padding="{sizes.16}">{children}</Box>
        </Box>
      </Box>
      <Toaster />
    </ChakraProvider>
  );
};

export default Page;
