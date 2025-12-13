import { defineSlotRecipe } from '@chakra-ui/react';

const borderRadii: Record<string, string> = {
  from: '0.5rem 0 0 0.5rem',
  incomplete: '0.5rem',
  to: '0 0.5rem 0.5rem 0',
};
function selectionBorder({ selection }: VariantProps) {
  if (!selection || selection === 'between') {
    return {};
  }
  return { borderRadius: borderRadii[selection] };
}

function textStyle({ currentMonth, disabled, selection, today }: VariantProps) {
  const endpoint = selection === 'from' || selection === 'to' || selection === 'incomplete';
  if (disabled) {
    return undefined;
  }

  let backgroundColor: string | undefined;

  if (!selection) {
    if (currentMonth) {
      backgroundColor = '{colors.brand.emphasized}';
    } else {
      backgroundColor = '{colors.brand.subtle}';
    }
  }

  if (endpoint) {
    return {
      '&:hover, button:focus-visible > &': {
        backgroundColor,
      },
      ...(today && { borderColor: '{colors.brand.emphasized}' }),
    };
  }

  return {
    '&:hover, button:focus-visible > &': {
      backgroundColor,
    },
    ...(today && { borderColor: '{colors.brand.solid}' }),
  };
}

type VariantProps = {
  beingMoved?: boolean;
  currentMonth?: boolean;
  disabled?: boolean;
  selection?: 'from' | 'incomplete' | 'to' | 'between' | undefined;
  today?: boolean;
};

const beingMoved = [true, false];
const disabled = [true, false];
const currentMonth = [true, false];
const selection: Array<VariantProps['selection']> = ['from', 'incomplete', 'to', 'between', undefined];
const today = [true, false];

const allCombinations = beingMoved.flatMap((bm) =>
  currentMonth.flatMap((cm) =>
    selection.flatMap((sel) =>
      disabled.flatMap((dis) =>
        today.map((t) => ({
          beingMoved: bm,
          disabled: dis,
          currentMonth: cm,
          selection: sel,
          today: t,
        })),
      ),
    ),
  ),
);

const generateCompoundVariants = () => {
  return allCombinations.map((combo) => ({
    beingMoved: combo.beingMoved,
    currentMonth: combo.currentMonth,
    disabled: combo.disabled,
    selection: combo.selection,
    today: combo.today,
    css: {
      day: {
        ...buttonStyles(combo),
        ...selectionBorder(combo),
      },
      text: {
        ...textStyle(combo),
      },
    },
  }));
};

const buttonStyles = ({ beingMoved, currentMonth, disabled, selection, today }: VariantProps) => {
  if (disabled) {
    return {
      backgroundColor: '{colors.disabled.subtle}',
      color: '{colors.disabled.solid}',
    };
  }

  const baseStyles = {
    active: {
      rangeEnd: {
        style: {
          '&:hover, &:focus-visible': {
            backgroundColor: beingMoved ? undefined : '{colors.brand.solid}',
            color: beingMoved ? undefined : '{colors.brand.emphasized}',
          },
          backgroundColor: beingMoved ? '{colors.brand.emphasized}' : '{colors.brand.solid}',
          color: beingMoved ? undefined : '{colors.neutral.contrast}',
        },
      },
      rangeMid: {
        style: {
          '&:hover, &:focus-visible': {
            backgroundColor: '{colors.brand.muted}',
          },
          backgroundColor: '{colors.brand.muted}',
        },
      },
      style: {
        color: today ? '{colors.brand.solid}' : '{colors.neutral.fg}',
      },
    },
    'n/a': {
      rangeEnd: {
        style: {
          '&:hover, &:focus-visible': {
            color: '{colors.brand.minimal}',
          },
          backgroundColor: beingMoved ? '{colors.brand.muted}' : '{colors.brand.border}',
          color: beingMoved ? '{colors.neutral.fg}' : '{colors.border.subtle}',
        },
      },
      rangeMid: {
        style: {
          '&:hover, &:focus-visible': {
            backgroundColor: '{colors.brand.muted}',
            color: '{colors.brand.minimal}',
          },
          backgroundColor: '{colors.brand.emphasized}',
          color: '{colors.brand.bold}',
        },
      },
      style: {
        color: '{colors.neutral.fg}',
      },
    },
  };

  const sel =
    selection && (selection == 'from' || selection == 'to' || selection == 'incomplete' ? 'rangeEnd' : 'rangeMid');
  const dayStyles = baseStyles[currentMonth ? 'active' : 'n/a'];

  const style = {
    ...dayStyles.style,
    ...(sel ? dayStyles?.[sel]?.style : {}),
  };

  return style;
};

export const datePickerDayRecipe = defineSlotRecipe({
  slots: ['day', 'text'],
  base: {
    day: {
      _focusVisible: {
        boxShadow: 'none',
        outline: 'none',
      },
      padding: '0',
    },
    text: {
      alignItems: 'center',
      borderRadius: '0.5rem',
      display: 'flex',
      height: '2rem',
      justifyContent: 'center',
      width: '3rem',
    },
  },
  variants: {
    beingMoved: {
      true: {},
      false: {},
    },
    currentMonth: {
      true: {},
      false: {},
    },
    disabled: {
      true: {},
      false: {},
    },
    selection: {
      from: {},
      to: {},
      between: {},
      incomplete: {},
      undefined: {},
    },
    today: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [...generateCompoundVariants()],
});
