import { FieldError } from '@/types/GeneralError';
import { t } from 'i18next';
import { FieldValues, UseFormSetError, Path } from 'react-hook-form';

export function getFieldErrorMessage(fieldError: FieldError): string {
  return t(`validation.errors.${fieldError.code}`, { value: fieldError.value });
}

export function setFieldError<T extends FieldValues>(
  setError: UseFormSetError<T>,
  field: Path<T>,
  fieldError: FieldError,
): void {
  setError(field, {
    type: 'manual',
    message: getFieldErrorMessage(fieldError),
  });
}
