import { ChangeEvent, DragEvent, useState } from 'react';

const useDragAndDrop = (validExtensions: string[]) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFiles = async (files: FileList) => {
    const firstValidFile = Array.from(files).find((currentFile) =>
      validExtensions.some((validExtension) => currentFile.name.endsWith(validExtension)),
    );

    if (firstValidFile) {
      setFile(firstValidFile);
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!isDragOver) {
      setIsDragOver(true);
    }

    event.preventDefault();
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    setIsDragOver(false);
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  return {
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragOver,
    file,
    setFile,
  };
};

export default useDragAndDrop;
