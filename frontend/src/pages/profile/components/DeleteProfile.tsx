import { Button } from '@/components/button';
import { DialogBody, DialogContent, DialogFooter, DialogRoot, DialogTitle, DialogTrigger } from '@/components/dialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const DeleteProfile = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <DialogRoot open={isOpen}>
        <DialogTrigger asChild>
          <Button colorPalette="red" onClick={() => setIsOpen(true)}>
            Delete profile
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogTitle padding="{sizes.16}">Delete profile</DialogTitle>
          <DialogBody>Are you sure you want to delete your profile? This action cannot be undone.</DialogBody>

          <DialogFooter>
            <Button onClick={onClose} variant="subtle">
              {t('cancel')}
            </Button>
            <Button colorPalette="red" type="submit" variant="solid">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default DeleteProfile;
