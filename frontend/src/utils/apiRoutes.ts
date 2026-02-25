import axios from 'axios';
import flatten from 'lodash/flatten';
import { camelCaseKeys, snakeCaseKeys } from './transformKeys';

export const transformResponse = flatten([axios.defaults.transformResponse || [], camelCaseKeys]);
const transformRequest = flatten([snakeCaseKeys, axios.defaults.transformRequest || []]);

// Function to get CSRF token from meta tag
const getCSRFToken = (): string => {
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  return metaTag ? metaTag.content : '';
};

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-CSRFToken': getCSRFToken(),
  },
  transformResponse,
  transformRequest,
});

type Config = {
  params?: Record<string, string | number | boolean>;
};

export const pathWithConfig = (path: string, config?: Config): string => {
  if (!config) {
    return path;
  }

  if (config.params) {
    const keyValuePairs =
      typeof config.params === 'string'
        ? config.params
        : Object.entries(config.params)
            .filter(([, val]) => Boolean(val))
            .map(([key, val]) => `${key}=${encodeURIComponent(val as string)}`)
            .join('&');

    if (keyValuePairs.length) {
      path += `?${keyValuePairs}`;
    }
  }

  return path;
};

export const productsPath = (config?: Config): string => {
  return pathWithConfig('/api/products', config);
};

export const paymentPath = (id: string | number, config?: Config): string => {
  return pathWithConfig(`/api/payments/${id}`, config);
};

export const categorySummaryPath = (config?: Config): string => {
  return pathWithConfig('/api/summary/category', config);
};

export const monthlySummaryPath = (config?: Config): string => {
  return pathWithConfig('/api/summary/monthly', config);
};

export const registerPath = '/api/auth/register/';

export const loginPath = '/api/auth/login/';

export const logoutPath = '/api/auth/logout/';

export const mediaUploadPath = '/api/media/upload-url';

export const mediaFinalizeUploadPath = '/api/media/upload-finalize';

export const bookingsPath = '/api/bookings/';

export const getMediaAssetPath = (id: string) => `/api/media/${id}`;
