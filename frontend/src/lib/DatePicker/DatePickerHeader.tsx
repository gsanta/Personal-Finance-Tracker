import { Box, BoxProps, createContext, IconButton } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useObjectMemo } from './DatePicker';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

const [HeaderContext, useHeaderContext] = createContext<{
  onPrevious: () => void;
  onNext: () => void;
  controls: 'left' | 'right' | 'both';
}>();
export const DatePickerHeaderContent = (props: BoxProps) => (
  <Box alignSelf="center" display="flex" gap="2" justifyContent="center" {...props} />
);
export const DatePickerHeaderPrevious = ({ label }: { label: string }) => {
  const { controls, onPrevious } = useHeaderContext();
  return (
    <IconButton
      alignSelf="start"
      aria-label={label}
      as="button"
      colorPalette="brand"
      onClick={onPrevious}
      type="button"
      variant="subtle"
      visibility={controls === 'right' ? 'hidden' : undefined}
    >
      <BiChevronLeft />
    </IconButton>
  );
};
export const DatePickerHeaderNext = ({ label }: { label: string }) => {
  const { controls, onNext } = useHeaderContext();
  return (
    <IconButton
      alignSelf="end"
      aria-label={label}
      color="purple.10"
      colorPalette="brand"
      onClick={onNext}
      variant="subtle"
      visibility={controls === 'right' ? 'hidden' : undefined}
    >
      <BiChevronRight />
    </IconButton>
  );
};

const DatePickerHeader = ({
  children,
  controls = 'both',
  onNext,
  onPrevious,
}: {
  onPrevious: () => void;
  onNext: () => void;
  controls?: 'left' | 'right' | 'both';
  children?: ReactNode;
}) => {
  const ctx = useObjectMemo({ controls, onNext, onPrevious });
  return (
    <Box alignItems="center" display="flex" justifyContent="flex-end" gap="4" marginBottom="{sizes.24}" width="100%">
      <HeaderContext value={ctx}>{children}</HeaderContext>
    </Box>
  );
};
export default DatePickerHeader;
