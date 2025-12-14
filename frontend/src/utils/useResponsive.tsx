import breakpoints from '@/lib/theme/breakpoints';
import { useMediaQuery } from '@chakra-ui/react';
import { createContext, ReactNode, useContext, useMemo } from 'react';

const minusOnePixel = (value: string) => {
  const valueInPixels = parseInt(value, 10) * 16;
  return `${valueInPixels - 1}px`;
};

const mediaQueries = [
  `(min-width: ${breakpoints['base']}) and (max-width: ${minusOnePixel(breakpoints['tablet'])})`,
  `(min-width: ${breakpoints['tablet']}) and (max-width: ${minusOnePixel(breakpoints['desktop'])})`,
  `(min-width: ${breakpoints['desktop']}) and (max-width: ${minusOnePixel(breakpoints['wideDesktop'])})`,
  `(min-width: ${breakpoints['wideDesktop']})`,
];

const ResponsiveContext = createContext({ isDesktop: false, isMobile: false, isTablet: false, isWideDesktop: false });

export const ResponsiveProvider = ({ children }: { children: ReactNode }) => {
  const [isMobile, isTablet, isDesktop, isWideDesktop] = useMediaQuery(mediaQueries);
  const context = useMemo(
    () => ({ isDesktop, isMobile, isTablet, isWideDesktop }),
    [isMobile, isTablet, isDesktop, isWideDesktop],
  );

  return <ResponsiveContext.Provider value={context}>{children}</ResponsiveContext.Provider>;
};

const useResponsive = () => {
  return useContext(ResponsiveContext);
};

export default useResponsive;
