import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import LoginDialog from './Login/LoginDialog';
import useGlobalProps from '@/hooks/useGlobalProps';
import { Button } from '../button';
import useLogout from '@/hooks/useLogout';
import { getHeaderTextColor } from '@/utils/styling';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { isPageScrolled, setIsPageScrolled, user } = useGlobalProps();

  const { logout } = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsPageScrolled(scrollTop > 50); // Change background after scrolling 50px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = getHeaderTextColor(isPageScrolled);

  return (
    <>
      <Box
        as="header"
        bg={isPageScrolled ? 'orange.solid' : 'transparent'}
        h="16"
        shadow={isPageScrolled ? 'md' : 'none'}
        position="sticky"
        top="0"
        zIndex="sticky"
        transition="all 0.3s ease"
      >
        <Flex maxW="7xl" mx="auto" h="full" align="center" justify="space-between" px="6">
          <Button asChild colorPalette="orange" variant="ghost">
            <a href="/">
              <Text color={textColor} fontSize="xl" fontWeight="bold">
                Cicatanya
              </Text>
            </a>
          </Button>
          <Box display="flex" alignItems="center" gap="6">
            <Button asChild colorPalette="orange" variant="ghost">
              <a href="rooms">
                <Text color={textColor} textStyle="3xl" textTransform="uppercase">
                  {t('booking')}
                </Text>
              </a>
            </Button>
            <Box display="flex" gap="4">
              {user ? (
                <Button colorPalette="yellow" onClick={() => logout()} variant="solid">
                  Logout
                </Button>
              ) : (
                <>
                  <LoginDialog />
                  {/* <RegisterDialog /> */}
                </>
              )}
            </Box>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Header;
