import { AxiosError } from 'axios';
import { Alert } from './alert';
import GeneralError, { ErrorMessages } from '@/types/GeneralError';

type ErrorMessageProps = {
  error: AxiosError<GeneralError> | null;
};

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  if (!error) return null;

  return (
    <Alert status="error" title="Login failed" variant="surface">
      {error.response?.data.code ? ErrorMessages[error.response?.data.code] : ''}
    </Alert>
  );
};

export default ErrorMessage;
