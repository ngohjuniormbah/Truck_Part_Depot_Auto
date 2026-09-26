import React, { useRef, useState } from 'react';
import { Upload, X, Star, Plus, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../services/storage';

interface MultiImageUploaderProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  helperText?: string;
  /** Which Storage subfolder these uploads belong to. Defaults to 'products'. */
  folder?: 'products' | 'gallery' | 'reviews';
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  label = 'Product Photos',
  images = [],
  onChange,
  helperText = 'Upload 2 or more photos (front, angle, OEM label, connectors, installed view)',
  folder = 'products',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setUploadError(null);
    try {
      const newUrls: string[] = [];
      const failures: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          try {
            const url = await uploadImage(file, folder);
            newUrls.push(url);
          } catch (err) {
            console.error('Photo upload failed:', file.name, err);
            failures.push(file.name);
          }
        }
      }
      if (newUrls.length > 0) onChange([...images, ...newUrls]);
      if (failures.length > 0) {
        setUploadError(`${failures.length} photo(s) failed to upload: ${failures.join(', ')}`);
      }
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    const trimmed = (urlInput || '').trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const selected = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([selected, ...rest]);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-white flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>{label}</span>
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
            {images.length} {images.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {showUrlInput ? 'Back to upload' : '+ Paste URL'}
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-500 leading-tight">
          {helperText}
        </p>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-400 leading-tight bg-red-950/40 border border-red-900 rounded px-2 py-1.5">
          {uploadError}
        </p>
      )}

      {showUrlInput && (
        <div className="flex gap-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="flex-1 bg-black border border-neutral-700 text-white text-xs px-3 py-1.5 rounded focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded hover:bg-neutral-200 cursor-pointer"
          >
            Add Photo
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {images.map((imgUrl, index) => {
            const isPrimary = index === 0;
            return (
              <div
                key={index}
                className={`group relative rounded-lg overflow-hidden border transition-all ${
                  isPrimary ? 'border-neutral-400 ring-1 ring-neutral-400/50 bg-neutral-900' : 'border-neutral-800 bg-neutral-950'
                }`}
              >
                <div className="aspect-[4/3] w-full bg-neutral-950 overflow-hidden relative">
                  <img
                    src={imgUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {isPrimary ? (
                    <div className="absolute top-1.5 left-1.5 bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-neutral-700">
                      <Star className="w-2.5 h-2.5 fill-white text-white" />
                      <span>Cover Photo</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="absolute top-1.5 left-1.5 bg-neutral-900/90 text-neutral-300 hover:text-white text-[10px] font-medium px-1.5 py-0.5 rounded border border-neutral-700 cursor-pointer"
                    >
                      Make Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 text-neutral-300 hover:text-red-400 flex items-center justify-center cursor-pointer border border-neutral-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="px-2 py-1 text-[10px] text-neutral-400 flex items-center justify-between border-t border-neutral-800 bg-neutral-900/50">
                  <span className="font-mono">#{index + 1}</span>
                  <span className="text-neutral-500">{isPrimary ? 'Primary' : `Photo ${index + 1}`}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={isProcessing}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-3 px-4 border border-dashed rounded-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer ${
          images.length === 0
            ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white py-4'
            : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white'
        } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isProcessing ? (
          <span>Processing photos...</span>
        ) : images.length === 0 ? (
          <>
            <Upload className="w-4 h-4 text-white" />
            <span className="font-semibold text-white">Select Photos (Upload 2 or more pics)</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            <span>Add More Photos</span>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
