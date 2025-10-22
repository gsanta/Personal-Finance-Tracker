type MediaAsset = {
  createdAt: string;
  id: string;
  originalFileName: string;
  publicUrl: string;
  uploadStatus: 'uploaded' | 'uploading';
};

export default MediaAsset;
