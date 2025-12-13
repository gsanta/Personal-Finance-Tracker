import { useDatePickerContext } from './DatePicker.context';
import { Box, Button, ButtonGroup, Text } from '@chakra-ui/react';

const DatePickerFooter = ({
  mode,
  onApply,
  onClear,
  onClose,
}: {
  onClose: () => void;
  onApply: () => void;
  onClear?: () => void;
  mode: 'day' | 'range';
}) => {
  const { preview, selected } = useDatePickerContext();

  const styleGrid = (mobile: string, desktop: string) => (mode === 'day' ? mobile : [mobile, desktop]);

  const displayDate = selected?.from || selected?.to;

  return (
    <Box
      data-testid="footer"
      display="grid"
      gap={displayDate ? 24 : 0}
      gridTemplateColumns="1fr auto 1fr"
      gridTemplateRows={styleGrid(displayDate ? '1.25rem 2rem' : '0 2rem', 'unset')}
    >
      {!!onClear && (
        <Button
          color="purple.10"
          gridColumn="1"
          gridRow={styleGrid('2', '1')}
          onClick={() => onClear()}
          size="sm"
          width="fit-content"
        >
          Clear
        </Button>
      )}
      <Text
        alignSelf="center"
        color="text.secondary"
        gridColumn={styleGrid('1 / 4', '2')}
        gridRow="1"
        justifySelf="center"
        textStyle="md"
      >
        {mode === 'day' ? (
          selected?.from?.toFormat('DD', { locale: 'en-US' })
        ) : (
          <>
            {(!preview || preview === 'to') && selected?.from?.toFormat('DD', { locale: 'en-US' })}
            {selected?.to && (
              <>
                {selected?.from || selected?.to ? ' - ' : undefined}
                {(!preview || preview === 'from') && selected?.to?.toFormat('DD', { locale: 'en-US' })}
              </>
            )}
          </>
        )}
      </Text>
      <ButtonGroup gridColumn={styleGrid('2 / 4', '3')} gridRow={styleGrid('2', '1')} justifyContent="end">
        <Button colorPalette="brand" onClick={onClose} variant="subtle" size="sm">
          Cancel
        </Button>

        <Button colorPalette="brand" onClick={onApply} size="sm">
          Apply
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default DatePickerFooter;
