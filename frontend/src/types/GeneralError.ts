export enum ErrorCodes {
  ERR_REQUIRED = 'ERR_REQUIRED',
  ERR_GTE = 'ERR_GTE',
  ERR_INVALID_CREDENTIALS = 'ERR_INVALID_CREDENTIALS',
  ERR_INVALID_DATE_FORMAT = 'ERR_INVALID_DATE_FORMAT',
  ERR_LTE = 'ERR_LTE',
  ERR_MAX = 'ERR_MAX',
  ERR_MIN = 'ERR_MIN',
  ERR_VALIDATION = 'ERR_VALIDATION',
}

export const ErrorMessages: Record<ErrorCodes, string> = {
  [ErrorCodes.ERR_INVALID_CREDENTIALS]: 'Invalid email or password.',
};

export type FieldError = {
  message: string;
  code: ErrorCodes;
  value?: string | number | boolean;
};

export type GeneralError = {
  code?: ErrorCodes;
  errors: Record<string, FieldError>;
};

export default GeneralError;
