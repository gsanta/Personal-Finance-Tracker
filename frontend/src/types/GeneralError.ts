type ErrorCode = 'ERR_INVALID_CREDENTIALS';

export const ErrorMessages: Record<ErrorCode, string> = {
  ERR_INVALID_CREDENTIALS: 'Invalid email or password.',
};

type GeneralError = {
  code?: ErrorCode;
};

export default GeneralError;
