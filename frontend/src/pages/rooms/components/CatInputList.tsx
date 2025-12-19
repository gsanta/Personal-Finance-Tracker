import { Box, Heading, Button, Field, IconButton, Input } from '@chakra-ui/react';
import { BiPlus, BiTrashAlt } from 'react-icons/bi';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import type { BookingForm } from '../RoomsPage';

type CatNameInputProps = {
  onChange: (value: string) => void;
  onDelete: () => void;
  value: string;
};

const CatNameInput = ({ onChange, onDelete, value }: CatNameInputProps) => {
  return (
    <Box display="flex" gap="4" alignItems="flex-end">
      <Field.Root>
        <Input
          colorPalette="brand"
          variant="subtle"
          placeholder="Add meg a cica nevét"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field.Root>
      <IconButton size="md" colorPalette="brand" variant="subtle" onClick={onDelete}>
        <BiTrashAlt />
      </IconButton>
    </Box>
  );
};

const CatInputList = () => {
  const { control } = useFormContext<BookingForm>();

  const { fields, append, remove } = useFieldArray<BookingForm>({
    control,
    name: 'catNames',
  });

  return (
    <Box>
      <Heading pb="{sizes.16}">Vendég(ek)?</Heading>
      <Box display="flex" flexDirection="column" gap="4">
        {fields.map((field, index) => (
          <Controller
            name={`catNames.${index}.name`}
            key={field.id}
            render={({ field }) => (
              <CatNameInput
                value={field.value}
                onChange={field.onChange}
                onDelete={() => {
                  if (fields.length > 1) {
                    remove(index);
                  }
                }}
              />
            )}
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
