import { defineConfig } from '@chakra-ui/react/styled-system';
import sizes from './sizes';
import { selectSlotRecipe } from './select.recipe';
import { colorTokens, semanticColorTokens } from './colors';
import breakpoints from './breakpoints';

const config = defineConfig({
  theme: {
    breakpoints,
    tokens: {
      colors: colorTokens,
      sizes: sizes,
    },
    semanticTokens: {
      colors: semanticColorTokens,
    },
    slotRecipes: {
      select: selectSlotRecipe,
    },
  },
});

export default config;
