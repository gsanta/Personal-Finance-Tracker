import GeneralError from '@/types/GeneralError';
import { setFieldError } from '@/utils/validation';
import { AxiosError } from 'axios';
import { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { useEffect } from 'react';

const useSetFirstFieldError = <T extends FieldValues>(
  error: AxiosError<GeneralError, unknown> | null,
  setError: UseFormSetError<T>,
  fields: Path<T>[],
) => {
  useEffect(() => {
    if (error) {
      const firstErrorIndex = fields.findIndex((field) => error.response?.data.errors[field] !== undefined);
      const fieldError = firstErrorIndex === -1 ? null : error.response?.data.errors[fields[firstErrorIndex]];

      if (fieldError) {
        const field = fields[firstErrorIndex];
        setFieldError(setError, field, fieldError);
      }
    }
  }, [error, fields, setError]);
};

export default useSetFirstFieldError;
