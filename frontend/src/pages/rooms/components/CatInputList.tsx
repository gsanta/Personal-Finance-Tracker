import { Box, Heading, Button, Field, IconButton, Input } from '@chakra-ui/react';
import { BiPlus, BiTrashAlt } from 'react-icons/bi';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { BookingForm } from '../RoomsPage';

type CatNameInputProps = {
  onChange: (value: string) => void;
  onDelete: () => void;
  value: string;
  error?: string;
};

const CatNameInput = ({ onChange, onDelete, value, error }: CatNameInputProps) => {
  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Box display="flex" gap="4" alignItems="flex-end">
        <Field.Root flex="1" invalid={!!error}>
          <Input
            colorPalette="brand"
            variant="subtle"
            placeholder="Add meg a cica nevét"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {error && <Field.ErrorText>{error}</Field.ErrorText>}
        </Field.Root>
        <IconButton size="md" colorPalette="brand" variant="subtle" onClick={onDelete}>
          <BiTrashAlt />
        </IconButton>
      </Box>
    </Box>
  );
};

const CatInputList = () => {
  const { control } = useFormContext<BookingForm>();

  const { fields, append, remove } = useFieldArray<BookingForm>({
    control,
    name: 'cats',
    rules: {
      required: 'Legalább egy vendég neve kötelező',
      minLength: {
        value: 1,
        message: 'Legalább egy vendég neve kötelező',
      },
    },
  });

  return (
    <Box>
      <Heading pb="{sizes.16}">Vendég(ek)?</Heading>
      <Box display="flex" flexDirection="column" gap="4">
        {fields.map((field, index) => (
          <Controller
            name={`cats.${index}.name`}
            key={field.id}
            control={control}
            render={({ field, fieldState, formState }) => {
              return (
                <CatNameInput
                  value={field.value}
                  onChange={field.onChange}
                  onDelete={() => {
                    if (fields.length > 1) {
                      remove(index);
                    }
                  }}
                  error={fieldState.error?.message || formState.errors.cats?.message}
                />
              );
            }}
          />
        ))}
      </Box>
      <Button
        aria-label="Add guest"
        display="flex"
        alignItems="center"
        marginTop="{sizes.12}"
        onClick={() => append({ name: '' })}
        colorPalette="brand"
        variant="subtle"
        disabled={fields.length >= 3}
      >
        Még egy vendég <BiPlus />
      </Button>
    </Box>
  );
};

export default CatInputList;
