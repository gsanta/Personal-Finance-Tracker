import { Button } from '../../button';
import { Input } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';
import { RegisterFormData } from '@/hooks/useRegister';

type RegistrationFormProps = {
  register: UseFormRegister<RegisterFormData>;
};

const RegistrationForm = ({ register }: RegistrationFormProps) => {
  return (
    <>
      <Input placeholder="Enter your email" {...register('email')} />
      <Input placeholder="Enter your password" type="password" {...register('password')} />
      <Input placeholder="Confirm your password" type="password" {...register('confirmPassword')} />
      <Button asChild>
        <a href="auth/google/login?from=http://localhost:3012/profile">Google</a>
      </Button>
    </>
  );
};

export default RegistrationForm;
