import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloudIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  title?: string;
  initialPreview?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title = "Upload an Image", initialPreview }) => {
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setPreview(initialPreview || null);
  }, [initialPreview]);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload a valid image file.');
      }
    }
  }, [onImageUpload]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };
  
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleAreaClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragging ? 'border-purple-500 bg-gray-700/50' : 'border-gray-600 hover:border-purple-500'}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e.target.files)}
        accept="image/*"
        className="hidden"
      />
      {preview ? (
        <div className="w-full h-64 md:h-96 relative rounded-lg overflow-hidden">
          <img src={preview} alt="Image preview" className="w-full h-full object-contain" />
           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
             <p className="text-white font-semibold">Click or drag to replace image</p>
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 md:h-96 text-gray-400">
          <UploadCloudIcon className="w-16 h-16 mb-4 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p>Drag & drop an image here, or click to select a file</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
