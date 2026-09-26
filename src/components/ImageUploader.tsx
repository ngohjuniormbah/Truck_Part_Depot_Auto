import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  helperText?: string;
  compact?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') return;

      if (file.type === 'image/svg+xml') {
        onChange(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = compact ? 900 : 1400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          onChange(canvas.toDataURL('image/jpeg', 0.82));
          return;
        }
        onChange(result);
      };
      img.onerror = () => onChange(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = (urlInput || '').trim();
    if (trimmed) {
      onChange(trimmed);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-neutral-400 font-medium">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          {showUrlInput ? 'Upload file' : 'Paste URL'}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-neutral-600"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 bg-neutral-800 text-white text-xs font-medium rounded hover:bg-neutral-700 cursor-pointer"
          >
            Add
          </button>
        </div>
      ) : value ? (
        <div className="flex items-center gap-3 p-2 bg-neutral-900 border border-neutral-800 rounded">
          <img
            src={value}
            alt="Preview"
            className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} object-cover rounded bg-neutral-950`}
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-neutral-300 font-mono text-[11px] truncate block">
              Photo selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-neutral-500 hover:text-neutral-300 p-1 cursor-pointer"
              title="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2.5 px-3 bg-neutral-900 border border-dashed border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload image</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
