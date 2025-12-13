import { defineConfig } from '@chakra-ui/react/styled-system';
import sizes from './sizes';
import { selectSlotRecipe } from './select.recipe';
import { colorTokens, semanticColorTokens } from './colors';

const config = defineConfig({
  theme: {
    slotRecipes: {
      select: selectSlotRecipe,
    },
    tokens: {
      colors: colorTokens,
      sizes: sizes,
    },
    semanticTokens: {
      colors: semanticColorTokens,
    },
  },
});

export default config;
