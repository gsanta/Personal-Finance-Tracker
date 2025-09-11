import axios from 'axios';
import flatten from 'lodash/flatten';
import { snakeCaseKeys, camelCaseKeys } from './transformKeys';

export const transformResponse = flatten([axios.defaults.transformResponse || [], camelCaseKeys]);
const transformRequest = flatten([snakeCaseKeys, axios.defaults.transformRequest || []]);

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
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

export const listPaymentsPath = (config?: Config): string => {
  return pathWithConfig('/api/payments', config);
};
