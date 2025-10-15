import { ChangeEvent, DragEvent, useRef } from 'react';

type DragAndDropProps = {
  acceptedTypes: string[];
  clearFile: () => void;
  file?: File | null;
  handleDragOver: (event: DragEvent<HTMLElement>) => void;
  handleDragLeave: () => void;
  handleDrop: (event: DragEvent<HTMLElement>) => void;
  handleFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  dragActive: boolean;
};

const DragAndDrop = ({
  acceptedTypes,
  clearFile,
  dragActive,
  file,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileInputChange,
  uploading,
}: DragAndDropProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return file ? (
    <div className="border-2 border-dashed p-4 border-slate-300 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-300">Selected file:</p>
        <p className="font-medium">{file.name}</p>
      </div>
      <button type="button" className="btn btn-primary btn-sm" onClick={clearFile} disabled={uploading}>
        Remove
      </button>
    </div>
  ) : (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={uploading}
      onClick={() => !uploading && fileInputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={[
        'flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed p-4 cursor-pointer select-none transition-colors',
        'text-sm text-slate-600 dark:text-slate-300',
        dragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500',
        uploading ? 'opacity-60 cursor-progress' : '',
      ].join(' ')}
    >
      <p className="font-medium">{uploading ? 'Uploading…' : 'Drag & drop an image here'}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">or click to browse (JPEG, PNG, GIF, WEBP)</p>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        disabled={uploading}
        className="sr-only"
      />
    </div>
  );
};

export default DragAndDrop;
