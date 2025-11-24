import { Button } from '@/components/button';
import { LoginFormData } from '@/hooks/useLogin';
import { Input } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type LoginFormProps = {
  register: UseFormRegister<LoginFormData>;
  setCurrentForm: (form: 'login' | 'register') => void;
};

const LoginForm = ({ register, setCurrentForm }: LoginFormProps) => {
  const { t } = useTranslation();
  return (
    <>
      <Input bgColor="bg.subtle" colorPalette="whiteAlpha" placeholder={t('enter_your_email')} {...register('email')} />
      <Input
        bgColor="bg.subtle"
        colorPalette="whiteAlpha"
        placeholder={t('enter_your_password')}
        type="password"
        {...register('password')}
      />
      <Button onClick={() => setCurrentForm('register')}>{t('register')}</Button>
    </>
  );
};

export default LoginForm;
