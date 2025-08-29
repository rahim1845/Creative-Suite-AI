import React, { useState } from 'react';
import { DownloadIcon, EyeIcon, XIcon, VideoIcon } from './icons';

interface ResultDisplayProps {
  image?: string; // base64 string
  videoUrl?: string; // blob URL
  onAnimate?: (base64Image: string) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, videoUrl, onAnimate }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!image && !videoUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    if (image) {
      link.href = `data:image/jpeg;base64,${image}`;
      link.download = `cs-ai-result-${Date.now()}.jpeg`;
    } else if (videoUrl) {
      link.href = videoUrl;
      link.download = `cs-ai-result-${Date.now()}.mp4`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMedia = (isModal: boolean = false) => {
    const commonClasses = "w-full h-auto rounded-lg";
    const modalClasses = "max-h-[90vh] object-contain";
    const cardClasses = "max-h-[70vh] object-contain";

    if (image) {
      return (
        <img
          src={`data:image/jpeg;base64,${image}`}
          alt="Generated result"
          className={`${commonClasses} ${isModal ? modalClasses : cardClasses}`}
        />
      );
    }
    if (videoUrl) {
      return (
        <video
          src={videoUrl}
          controls
          autoPlay
          loop
          className={`${commonClasses} ${isModal ? modalClasses : cardClasses}`}
        />
      );
    }
    return null;
  };

  return (
    <>
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Result</h3>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
          {renderMedia()}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 font-semibold"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 font-semibold"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>Download</span>
            </button>
            {image && onAnimate && (
              <button
                onClick={() => onAnimate(image)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors duration-200 font-semibold"
              >
                <VideoIcon className="w-5 h-5" />
                <span>Animate This Image</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            {renderMedia(true)}
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute -top-4 -right-4 bg-gray-800 rounded-full p-2 text-white hover:bg-gray-700 transition-colors"
              aria-label="Close preview"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultDisplay;
