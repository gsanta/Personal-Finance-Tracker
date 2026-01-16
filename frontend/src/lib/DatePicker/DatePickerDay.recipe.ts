import { defineSlotRecipe } from '@chakra-ui/react';

export const datePickerDayRecipe = defineSlotRecipe({
  slots: ['day', 'text'],
  className: 'calendar-day',
  base: {
    day: {
      _focusVisible: {
        boxShadow: 'none',
        outline: 'none',
      },
      '&:is(:hover, :focus):not([aria-selected=true]):not([disabled])': {
        '& p': {
          backgroundColor: '{colors.brand.focusRing}',
          color: '{colors.neutral.fg}',
        },
      },
      // Group hover effect
      '&.group-hover:not([aria-selected=true]):not([disabled])': {
        '& p': {
          backgroundColor: '{colors.brand.subtle}',
          color: '{colors.neutral.fg}',
          borderColor: '{colors.brand.emphasized}',
        },
      },
      _selected: {
        backgroundColor: '{colors.brand.muted}',
      },
      _disabled: {
        backgroundColor: '{colors.disabled.subtle}',
        color: '{colors.disabled.solid}',
      },
      padding: '0',
    },
    text: {
      alignItems: 'center',
      border: '1px solid',
      borderColor: 'transparent',
      borderRadius: '0.5rem',
      display: 'flex',
      height: '2rem',
      justifyContent: 'center',
    },
  },
  variants: {
    style: {
      'n/a': {
        day: {
          color: '{colors.neutral.focusRing}',
          '&:is(:hover, :focus):not([aria-selected=true]):not([disabled]):not([aria-disabled=true])': {
            '& p': {
              backgroundColor: '{colors.brand.emphasized}',
            },
          },
        },
      },
      today: {
        text: {
          borderColor: 'sys/purple/base',
        },
      },
      deletable: {
        day: {
          backgroundColor: '{colors.yellow.emphasized}',
          color: '{colors.disabled.solid}',
        },
      },
    },
    range: {
      single: {
        day: {
          borderRadius: '0.5rem',
          _selected: {
            backgroundColor: '{colors.brand.solid}',
            color: '{colors.border.subtle}',
          },
          _hover: {
            color: '{colors.brand.subtle}',
            backgroundColor: '{colors.brand.solid}',
          },
          _focus: {
            color: '{colors.brand.subtle}',
            backgroundColor: '{colors.brand.solid}',
          },
        },
      },
      rangeStart: {
        day: {
          borderRadius: '0.5rem 0 0 0.5rem',
          '--range-type': 'start',
          _selected: {
            backgroundColor: '{colors.brand.solid}',
            color: '{colors.border.subtle}',
          },
          _hover: {
            color: '{colors.brand.subtle}',
            backgroundColor: '{colors.brand.solid}',
          },
          _focus: {
            color: '{colors.brand.subtle}',
            backgroundColor: '{colors.brand.solid}',
          },
        },
      },
      rangeEnd: {
        day: {
          borderRadius: '0 0.5rem 0.5rem 0',
          '--range-type': 'end',
          _selected: {
            backgroundColor: '{colors.brand.solid}',
            color: '{colors.border.subtle}',
          },
          _hover: {
            color: '{colors.brand.subtle}',
            backgroundColor: '{colors.brand.solid}',
          },
          _focus: {
            color: '{colors.brand.subtle}',
            backgroundColor: '{colors.brand.solid}',
          },
        },
      },

      rangeMid: {
        day: {
          '--range-type': 'mid',
          _selected: {
            color: '{colors.gray.fg}',
            backgroundColor: '{colors.brand.emphasized}',
          },
          _hover: {
            color: '{colors.gray.fg}',
            backgroundColor: '{colors.brand.focusRing}',
          },
          _focus: {
            color: '{colors.gray.fg}',
            backgroundColor: '{colors.brand.focusRing}',
          },
        },
      },
    },
  },
  compoundVariants: [
    {
      range: 'rangeStart',
      style: 'deletable',
      css: {
        day: {
          borderRadius: '0.5rem 0 0 0.5rem',
          _selected: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
          _hover: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
          _focus: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
        },
      },
    },
    {
      range: 'rangeEnd',
      style: 'deletable',
      css: {
        day: {
          borderRadius: '0 0.5rem 0.5rem 0',
          _selected: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
          _hover: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
          _focus: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
        },
      },
    },
    {
      range: 'rangeMid',
      style: 'deletable',
      css: {
        day: {
          _selected: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
          _hover: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
          _focus: {
            backgroundColor: '{colors.yellow.emphasized}',
            color: '{colors.disabled.solid}',
          },
        },
      },
    },
    {
      style: 'deletable',
      css: {
        day: {
          '&.group-hover': {
            boxShadow: '0 0 0 3px {colors.yellow.solid}, 0 0 8px 0 {colors.yellow.solid}',
          },
        },
      },
    },
  ],
});
