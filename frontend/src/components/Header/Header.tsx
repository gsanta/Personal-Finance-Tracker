import { Box, Flex } from '@chakra-ui/react';
import RegisterDialog from './RegisterDialog';
import LoginDialog from './LoginDialog';
import useGlobalProps from '@/hooks/useGlobalProps';
import { Button } from '../button';
import useLogout from '@/hooks/useLogout';

const Header = () => {
  const { isLoggedIn } = useGlobalProps();

  const { logout } = useLogout();

  return (
    <>
      <Box as="header" bg="blue.500" h="16" shadow="md" position="sticky" top="0" zIndex="sticky">
        <Flex maxW="7xl" mx="auto" h="full" align="center" justify="space-between" px="6">
          <Box color="white" fontSize="xl" fontWeight="bold">
            Personal Finance Tracker
          </Box>
          <Box display="flex" gap="4">
            {isLoggedIn ? (
              <Button colorPalette="yellow" onClick={() => logout()} variant="solid">
                Logout
              </Button>
            ) : (
              <>
                <LoginDialog />
                <RegisterDialog />
              </>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default Header;
