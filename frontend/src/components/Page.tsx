import { ReactNode } from 'react';
import Header from './Header/Header';
import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

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
      <Header />
      <div className="bg-base-200 flex justify-around min-h-screen">
        <div className="max-w-7xl w-full border-x border-primary border-dashed">
          <div className="flex items-center justify-between gap-4 px-8 ps-10 w-full pt-4">
            <h2 className="font-title text-lg">Cat food store</h2>
          </div>
          {children}
        </div>
      </div>
    </ChakraProvider>
  );
};

export default Page;
