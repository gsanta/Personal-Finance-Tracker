import { getProductsQueryKey } from '@/pages/products/hooks/useGetProducts';
import MediaAsset from '@/pages/products/types/MediaAsset';
import { api, mediaUploadPath, mediaFinalizeUploadPath, getMediaAssetPath } from '@/utils/apiRoutes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useState, useCallback, useEffect } from 'react';

type UploadRequest = {
  fileName: string;
  contentType: string;
  originalFileName: string;
  productId: string;
  sizeBytes: number;
};

type UploadResponse = {
  assetId: string;
  uploadUrl: string;
  objectKey: string;
  method: string;
};

type FinalizeRequest = {
  contentType: string;
  id: string;
};

type UploadImageProps = {
  acceptedTypes: string[];
  handleClose: () => void;
  productId?: string;
};

const useUploadImage = ({ acceptedTypes, handleClose, productId }: UploadImageProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);

  const { mutateAsync: mutateUploadUrl } = useMutation<UploadResponse, unknown, UploadRequest>({
    mutationFn: async (variables) => {
      const data = await api.post<UploadResponse>(mediaUploadPath, variables);
      return data?.data;
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
      });
    },
  });

  const { data: mediaAsset } = useQuery<AxiosResponse<MediaAsset>, unknown, MediaAsset>({
    queryKey: ['media-assets', uploadedAssetId],
    queryFn: async () => {
      return api.get(getMediaAssetPath(uploadedAssetId!));
    },
    enabled: Boolean(uploadedAssetId),
    select: (data) => data.data,
    refetchInterval: 1000,
  });

  const queryClient = useQueryClient();

  const uploadFile = useCallback(
    async (file: File | undefined | null) => {
      if (!file) return;
      if (!acceptedTypes.includes(file.type)) {
        alert('Unsupported file type. Please select an image.');
        return;
      }
      try {
        setUploading(true);
        const uploadData = await mutateUploadUrl({
          fileName: file.name,
          contentType: file.type,
          originalFileName: file.name,
          sizeBytes: file.size,
          productId: productId || '',
        });
        await mutateUploadFile({ url: uploadData.uploadUrl, file, method: uploadData.method });
        setUploadedAssetId(uploadData.assetId);
      } finally {
        setUploading(false);
      }
    },
    [acceptedTypes, mutateFinalizeUpload, mutateUploadFile, mutateUploadUrl],
  );

  useEffect(() => {
    if (mediaAsset?.uploadStatus === 'uploaded') {
      setUploadedAssetId(null);

      const params = new URLSearchParams(window.location.search);
      const page = params.get('page') ?? '';

      queryClient.invalidateQueries({ queryKey: getProductsQueryKey(page) });

      handleClose();
    }
  }, [mediaAsset]);

  return {
    uploading,
    uploadFile,
  };
};

export default useUploadImage;
