import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultDisplay from '../components/ResultDisplay';
import { VIDEO_CUSTOM_TEMPLATES } from '../types';

const VIDEO_PRESETS = [
    { id: 'zoom-in', name: 'Zoom In', prompt: 'smooth zoom in effect' },
    { id: 'pan-left', name: 'Pan Left', prompt: 'smoothly pans from right to left' },
    { id: 'dolly', name: 'Dolly Effect', prompt: 'dolly effect, cinematic' },
    { id: 'shimmer', name: 'Shimmer', prompt: 'subtle shimmering and sparkling light effect' },
    { id: 'rotate', name: 'Rotate', prompt: 'slowly rotates clockwise' },
];

// Helper to convert a data URL (base64) to a File object
async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
}

interface VideoSynthesizerProps {
  initialImage: string | null;
}

const VideoSynthesizer: React.FC<VideoSynthesizerProps> = ({ initialImage }) => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>(VIDEO_PRESETS[0].prompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialImage) {
      const fileName = `studio-image-${Date.now()}.jpeg`;
      dataUrlToFile(initialImage, fileName)
        .then(file => {
          setImageFile(file);
          setResultVideoUrl(null);
          setError(null);
        })
        .catch(err => {
          console.error("Error converting data URL to file:", err);
          setError("Could not load the image from the studio.");
        });
    }
  }, [initialImage]);
  
  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    setResultVideoUrl(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }

    const finalPrompt = mode === 'preset' ? selectedPreset : prompt;
    if (!finalPrompt) {
      setError('Please select a preset or provide a custom prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultVideoUrl(null);
    setProgressMessage('Initializing...');

    try {
      const videoUrl = await generateVideo(imageFile, finalPrompt, setProgressMessage);
      setResultVideoUrl(videoUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text">Video Synthesizer</h2>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Bring your static images to life. Generate captivating short videos with simple presets or custom prompts.</p>
      </div>

      <div className="max-w-4xl mx-auto bg-gray-800/50 p-4 sm:p-6 rounded-2xl border border-gray-700 space-y-6">
        {!initialImage && (
             <div className="text-center bg-gray-800 border border-blue-400/30 text-blue-200 p-3 rounded-lg text-sm">
                <strong>Tip:</strong> For best video results, please use an image with a 16:9 aspect ratio.
             </div>
        )}
       
        <ImageUploader 
          onImageUpload={handleImageUpload} 
          title="Upload an Image to Animate"
          initialPreview={initialImage} 
        />

        {imageFile && (
          <>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button onClick={() => setMode('preset')} className={`w-1/2 py-2 rounded-md transition-colors ${mode === 'preset' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}>Presets</button>
              <button onClick={() => setMode('custom')} className={`w-1/2 py-2 rounded-md transition-colors ${mode === 'custom' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'}`}>Custom</button>
            </div>
            
            {mode === 'preset' ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {VIDEO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.prompt)}
                    className={`px-4 py-2 rounded-lg transition-colors ${selectedPreset === preset.prompt ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'A gentle breeze makes the leaves rustle' or 'cinematic fly-through'"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  rows={3}
                />
                 <div className="space-y-3 pt-4 border-t border-gray-700">
                    <h4 className="text-base font-bold text-gray-300 text-center tracking-wide">Prompt Ideas</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {VIDEO_CUSTOM_TEMPLATES.map(template => (
                            <button key={template.name} onClick={() => setPrompt(template.prompt)} className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:border-purple-500 transition-all duration-200">
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3.5 px-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner message={progressMessage} /> : '🎬 Generate Video'}
            </button>
          </>
        )}
        
        {error && <p className="text-red-400 text-center animate-pulse">{error}</p>}
      </div>

      {isLoading && !resultVideoUrl && (
        <div className="flex justify-center">
            <LoadingSpinner message={progressMessage || "Generating your video..."}/>
        </div>
      )}

      {resultVideoUrl && <ResultDisplay videoUrl={resultVideoUrl} />}
    </div>
  );
};

export default VideoSynthesizer;