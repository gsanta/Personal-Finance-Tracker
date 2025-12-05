import User from '@/types/User';
import { createContext, useContext } from 'react';

type GlobalProps = {
  isPageScrolled: boolean;
  setIsPageScrolled: (scrolled: boolean) => void;
  setUser: (user: User) => void;
  user: User;
};

export const GlobalPropsContext = createContext<GlobalProps | undefined>(undefined);

const useGlobalProps = (): GlobalProps => {
  const context = useContext(GlobalPropsContext);

  if (!context) {
    throw new Error('useGlobalProps must be used within a GlobalPropsProvider');
  }

  return context;
};

export default useGlobalProps;
