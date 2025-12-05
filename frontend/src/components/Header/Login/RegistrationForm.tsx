import { Button } from '../../button';
import { Box, Input, Separator } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';
import { RegisterFormData } from '@/hooks/useRegister';

type RegistrationFormProps = {
  register: UseFormRegister<RegisterFormData>;
  setCurrentForm: (form: 'login' | 'register') => void;
};

const RegistrationForm = ({ register, setCurrentForm }: RegistrationFormProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="4">
      <Input placeholder="Enter your email" {...register('email')} />
      <Input placeholder="Enter your password" type="password" {...register('password')} />
      <Input placeholder="Confirm your password" type="password" {...register('confirmPassword')} />
      <Button asChild>
        <a href="auth/google/login?from=http://localhost:3012/profile">Google</a>
      </Button>
      <Separator />
      <Button colorPalette="yellow" onClick={() => setCurrentForm('login')} type="submit" variant="solid">
        Login
      </Button>
      <Separator />
    </Box>
  );
};

export default RegistrationForm;
