import { Button } from '@/components/button';
import { useDatePickerContext } from './DatePicker.context';
import { Box, BoxProps, ButtonGroup, Separator, Tag } from '@chakra-ui/react';
import { DateTime } from 'luxon';
import useResponsive from '@/utils/useResponsive';

const DatePickerFooter = ({ mode }: { mode: 'day' | 'range' }) => {
  const { leftViewDate, preview, selected, setLeftViewDate } = useDatePickerContext();

  const { isMobile } = useResponsive();

  const hasSelectedDate = selected?.from && selected?.to && !preview;

  const boxProps: BoxProps = isMobile
    ? {
        display: 'flex',
        alignItems: 'center',
        justifyContent: hasSelectedDate ? 'space-between' : 'flex-end',
      }
    : {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
      };

  return (
    <Box {...boxProps}>
      {hasSelectedDate && (
        <Box gridColumn="1">
          <Tag.Root colorPalette="brand" size="lg" variant="solid">
            <Tag.Label>
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
            </Tag.Label>
            <Tag.EndElement>
              <Tag.CloseTrigger
                onClick={() => {
                  console.log('clear tag');
                }}
              />
            </Tag.EndElement>
          </Tag.Root>
        </Box>
      )}
      {!isMobile && (
        <Box gridColumn="2" display="flex" justifyContent="center">
          <Separator
            borderColor="{colors.brand.subtle}"
            marginLeft="16px"
            orientation="vertical"
            height="56px"
            size="md"
          />
        </Box>
      )}
      <Box gridColumn="3" display="flex" justifyContent="flex-end">
        <ButtonGroup padding="{sizes.8}">
          <Button
            onClick={() =>
              setLeftViewDate(leftViewDate.set({ month: DateTime.now().month, year: DateTime.now().year }))
            }
            colorPalette="brand"
            variant="subtle"
          >
            Today
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default DatePickerFooter;
