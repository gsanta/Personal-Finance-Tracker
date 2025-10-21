import useDragAndDrop from '@/hooks/useDragAndDrop';
import DragAndDrop from './DragAndDrop';
import useUploadImage from '@/hooks/useUploadImage';

type ImageUploadDialogProps = {
  onClose(): void;
  productId?: string;
};

const ImageUploadDialog = ({ onClose, productId }: ImageUploadDialogProps) => {
  const handleClose = () => {
    onClose();
    (document.getElementById('image-upload-dialog') as HTMLDialogElement)?.close();
  };

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const { handleFileInputChange, handleDragOver, handleDragLeave, handleDrop, isDragOver, file, setFile } =
    useDragAndDrop(['.jpeg', '.jpg', '.png', '.gif', '.webp']);

  const { uploading, uploadFile } = useUploadImage({
    acceptedTypes,
    handleClose,
    productId,
  });

  return (
    <dialog id="image-upload-dialog" className="modal">
      <div className="modal-box bg-base-100 border-color border-primary border">
        <DragAndDrop
          acceptedTypes={acceptedTypes}
          clearFile={() => setFile(null)}
          file={file}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleFileInputChange={handleFileInputChange}
          uploading={uploading}
          dragActive={isDragOver}
        />
        <div className="modal-action">
          <button className="btn" onClick={handleClose}>
            Close
          </button>
          <button className="btn bg-neutral" onClick={() => uploadFile(file)}>
            Upload
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ImageUploadDialog;
