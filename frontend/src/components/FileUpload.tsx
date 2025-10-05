import { useMutation } from '@tanstack/react-query';
import { api, uploadPath } from '@/utils/apiRoutes';
import { ChangeEvent, useRef, useState } from 'react';

type UploadRequest = {
  fileName: string;
  contentType: string;
};

const FileUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const [uploading, setUploading] = useState(false);

  const { mutateAsync: mutateUploadUrl } = useMutation<string, unknown, UploadRequest>({
    mutationFn: async (variables) => {
      return api.post(uploadPath, variables);
    },
  });

  const { mutate: mutateUploadFile } = useMutation<unknown, unknown, { file: File; url: string }>({
    mutationFn: async ({ file, url}) => {
      return api.put(url, file, {
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

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;


    // // Create preview for images
    // if (file.type.startsWith('image/')) {
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     setPreview(reader.result as string);
    //   };
    //   reader.readAsDataURL(file);
    // }
    const uploadUrl = await mutateUploadUrl({ fileName: file.name, contentType: file.type })
    mutateUploadFile({ url: uploadUrl, file });
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept={acceptedTypes.join(',')}
      onChange={handleFileSelect}
      disabled={uploading}
      className="file-input file-input-bordered w-full"
    />
  );
};

export default FileUpload;
