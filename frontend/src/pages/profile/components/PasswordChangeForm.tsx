import { toaster } from '@/components/toaster';
import { Button } from '@/components/button';
import { Box } from '@chakra-ui/react/box';
import { Text } from '@chakra-ui/react/text';
import { Field, Input } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import usePasswordChange from '@/hooks/usePasswordChange';
import useSetFirstFieldError from '@/hooks/useSetFirstFieldError';

type PasswordChangeFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const PasswordChangeForm = () => {
  const { t } = useTranslation();
  const { mutateAsync: changePassword, error, isPending } = usePasswordChange();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useSetFirstFieldError(error, setError, ['currentPassword', 'newPassword', 'confirmPassword']);

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toaster.create({
        title: 'Password changed successfully',
        type: 'success',
      });
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 3000);
    } catch {
      toaster.create({
        title: 'Failed to change password',
        type: 'error',
      });
    }
  };

  if (isSuccess) {
    return (
      <Box textAlign="center" py="8">
        <Text color="green.500" fontSize="lg">
          {t('pages.profile.password_change_success')}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text mb="4" fontWeight="medium">
        {t('pages.profile.change_password_title')}
      </Text>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap="4">
        <Field.Root invalid={!!errors.currentPassword}>
          <Field.Label>{t('pages.profile.current_password_label')}</Field.Label>
          <Input type="password" {...register('currentPassword', { required: 'Current password is required' })} />
          {errors.currentPassword && <Field.ErrorText>{errors.currentPassword.message}</Field.ErrorText>}
        </Field.Root>

        <Field.Root invalid={!!errors.newPassword}>
          <Field.Label>{t('pages.profile.new_password_label')}</Field.Label>
          <Input
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
            })}
          />
          {errors.newPassword && <Field.ErrorText>{errors.newPassword.message}</Field.ErrorText>}
        </Field.Root>

        <Field.Root invalid={!!errors.confirmPassword}>
          <Field.Label>{t('pages.profile.confirm_password_label')}</Field.Label>
          <Input
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your new password',
            })}
          />
          {errors.confirmPassword && <Field.ErrorText>{errors.confirmPassword.message}</Field.ErrorText>}
        </Field.Root>

        <Button type="submit" colorPalette="blue" loading={isPending} disabled={isPending} alignSelf="flex-start">
          {t('pages.profile.change_password_button')}
        </Button>
      </Box>
    </Box>
  );
};

export default PasswordChangeForm;
