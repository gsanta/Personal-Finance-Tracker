import { Box, BoxProps } from '@chakra-ui/react';
import * as React from 'react';

type Props = BoxProps;

const DatePickerGrid: React.FunctionComponent<Props> = (props: Props) => {
  return (
    <Box display="grid" {...props} gridAutoRows="2rem" gridRowGap="{sizes.6}" gridTemplateColumns="repeat(7, 3rem)" />
  );
};

export default DatePickerGrid;
