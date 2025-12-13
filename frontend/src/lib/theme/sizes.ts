import { defineTokens } from '@chakra-ui/react/styled-system';

const sizes = {
  '1': {
    value: '0.0625rem',
  },
  '2': {
    value: '0.125rem',
  },
  '4': {
    value: '0.25rem',
  },
  '6': {
    value: '0.375rem',
  },
  '8': {
    value: '0.5rem',
  },
  '12': {
    value: '0.75rem',
  },
  '16': {
    value: '1rem',
  },
  '20': {
    value: '1.25rem',
  },
  '24': {
    value: '1.5rem',
  },
  '32': {
    value: '2rem',
  },
  '40': {
    value: '2.5rem',
  },
  '48': {
    value: '3rem',
  },
  '64': {
    value: '4rem',
  },
  '96': {
    value: '6rem',
  },
  '128': {
    value: '8rem',
  },
  '256': {
    value: '16rem',
  },
};

export default defineTokens.sizes(sizes);
