import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/dialog';
import { Button } from '../../button';
import { Text } from '@chakra-ui/react';
import useLogin from '@/hooks/useLogin';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../ErrorMessage';
import useGlobalProps from '@/hooks/useGlobalProps';
import { getHeaderTextColor } from '@/utils/styling';
import { useTranslation } from 'react-i18next';
import useRegister from '@/hooks/useRegister';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

const LoginDialog = () => {
  const { t } = useTranslation();
  const { isPageScrolled } = useGlobalProps();
  const [isOpen, setIsOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<'login' | 'register'>('login');

  const onClose = () => {
    setIsOpen(false);
  };

  const { loginError, resetLogin, onSubmitLogin, registerLogin, resetLoginForm, handleLoginSubmit } = useLogin({
    onClose,
  });

  const { registerRegister, registerError, resetRegisterForm, handleRegisterSubmit, onSubmitRegister, resetRegister } =
    useRegister();

  // const onClose = () => {
  //   setIsOpen(false);
  //   resetForm();
  //   resetLogin();
  // };

  useEffect(() => {
    resetLoginForm();
    resetRegisterForm();
    resetLogin();
    resetRegister();
  }, [currentForm, resetLoginForm, resetRegisterForm]);

  return (
    <DialogRoot open={isOpen}>
      <DialogTrigger asChild>
        <Button colorPalette="orange" onClick={() => setIsOpen(true)} variant="ghost">
          <Text color={getHeaderTextColor(isPageScrolled)} textStyle="3xl" textTransform="uppercase">
            {t('login')}
          </Text>
        </Button>
      </DialogTrigger>

      <DialogContent
        bgColor="orange.solid"
        as="form"
        onSubmit={currentForm === 'login' ? handleLoginSubmit(onSubmitLogin) : handleRegisterSubmit(onSubmitRegister)}
      >
        <DialogHeader>
          <DialogTitle color="bg.subtle">{t('login')}</DialogTitle>
          <DialogCloseTrigger onClick={onClose} />
        </DialogHeader>

        <DialogBody display="flex" flexDirection="column" gap="4">
          {currentForm === 'login' ? (
            <LoginForm register={registerLogin} setCurrentForm={setCurrentForm} />
          ) : (
            <RegistrationForm register={registerRegister} setCurrentForm={setCurrentForm} />
          )}

          <ErrorMessage error={loginError || registerError} />
        </DialogBody>

        <DialogFooter>
          <Button onClick={onClose} variant="subtle">
            {t('cancel')}
          </Button>
          <Button colorPalette="yellow" type="submit" variant="solid">
            {currentForm === 'login' ? t('login') : t('register')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default LoginDialog;
