import { useMutation } from '@tanstack/react-query';
import { api, mediaFinalizeUploadPath, mediaUploadPath } from '@/utils/apiRoutes';
import { ChangeEvent, DragEvent, useCallback, useRef, useState } from 'react';
import { AxiosResponse } from 'axios';
import useDragAndDrop from '@/hooks/useDragAndDrop';
import DragAndDrop from './DragAndDrop';

type UploadRequest = {
  fileName: string;
  contentType: string;
  productId: string;
};

type FinalizeRequest = {
  contentType: string;
  objectKey: string;
  originalFileName: string;
  sizeBytes: number;
};

type ImageUploadDialogProps = {
  onClose(): void;
  productId?: string;
};

const ImageUploadDialog = ({ onClose, productId }: ImageUploadDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    onClose();
    (document.getElementById('image-upload-dialog') as HTMLDialogElement)?.close();
  };

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const [uploading, setUploading] = useState(false);

  const { mutateAsync: mutateUploadUrl } = useMutation<
    AxiosResponse<{ uploadUrl: string; objectKey: string; method: string; productId: string }>,
    unknown,
    UploadRequest
  >({
    mutationFn: async (variables) => {
      return api.post(mediaUploadPath, variables);
    },
  });

  const { mutateAsync: mutateFinalizeUpload } = useMutation<unknown, unknown, FinalizeRequest>({
    mutationFn: async (variables) => {
      return api.post(mediaFinalizeUploadPath, variables);
    },
  });

  const { mutateAsync: mutateUploadFile } = useMutation<unknown, unknown, { file: File; url: string; method: string }>({
    mutationFn: async ({ file, url, method }) => {
      return api.request({
        url,
        method,
        data: file,
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: () => {
          // if (progressEvent.total) {
          //   const progress = 30 + Math.round((progressEvent.loaded * 70) / progressEvent.total);
          //   setUploadProgress(progress);
          // }
        },
      });
    },
  });

  const uploadFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      if (!acceptedTypes.includes(file.type)) {
        // Basic guard; server also validates.
        alert('Unsupported file type. Please select an image.');
        return;
      }
      try {
        setUploading(true);
        const uploadUrl = await mutateUploadUrl({
          fileName: file.name,
          contentType: file.type,
          productId: productId || '',
        });
        await mutateUploadFile({ url: uploadUrl.data.uploadUrl, file, method: uploadUrl.data.method });
        await mutateFinalizeUpload({
          contentType: file.type,
          objectKey: uploadUrl.data.objectKey,
          originalFileName: file.name,
          sizeBytes: file.size,
        });
      } finally {
        setUploading(false);
      }
    },
    [acceptedTypes, mutateFinalizeUpload, mutateUploadFile, mutateUploadUrl],
  );

  const { handleFileInputChange, handleDragOver, handleDragLeave, handleDrop, isDragOver, file, setFile } =
    useDragAndDrop(['.jpeg', '.jpg', '.png', '.gif', '.webp']);

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
