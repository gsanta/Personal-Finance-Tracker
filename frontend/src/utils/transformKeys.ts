import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import mapValues from 'lodash/mapValues';
import mapKeys from 'lodash/mapKeys';
import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

export const camelCaseKeys = (obj: Record<string, any>): Record<string, any> => {
  if (isArray(obj)) {
    return obj.map(camelCaseKeys);
  } else if (isObject(obj) && obj !== null) {
    return mapValues(
      mapKeys(obj, (_v, k) => camelCase(k)),
      camelCaseKeys,
    );
  }

  return obj;
};

export const snakeCaseKeys = (obj: Record<string, any>): Record<string, any> => {
  if (isArray(obj)) {
    return obj.map(snakeCaseKeys);
  } else if (isObject(obj) && obj !== null) {
    return mapValues(
      mapKeys(obj, (_v, k) => snakeCase(k)),
      snakeCaseKeys,
    );
  }

  return obj;
};
