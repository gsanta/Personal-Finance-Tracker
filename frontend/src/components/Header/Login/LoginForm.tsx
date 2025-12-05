import { Button } from '@/components/button';
import { LoginFormData } from '@/hooks/useLogin';
import { Box, Input, Separator } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type LoginFormProps = {
  register: UseFormRegister<LoginFormData>;
  setCurrentForm: (form: 'login' | 'register') => void;
};

const LoginForm = ({ register, setCurrentForm }: LoginFormProps) => {
  const { t } = useTranslation();
  return (
    <Box display="flex" flexDirection="column" gap="4">
      <Input bgColor="bg.subtle" colorPalette="whiteAlpha" placeholder={t('enter_your_email')} {...register('email')} />
      <Input
        bgColor="bg.subtle"
        colorPalette="whiteAlpha"
        placeholder={t('enter_your_password')}
        type="password"
        {...register('password')}
      />
      <Separator />
      <Button colorPalette="yellow" onClick={() => setCurrentForm('register')} variant="solid">
        {t('register')}
      </Button>
      <Separator />
    </Box>
  );
};

export default LoginForm;
