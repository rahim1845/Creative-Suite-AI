import React, { useState, useCallback } from 'react';
import { EditorTool, ASPECT_RATIOS, FEATURES, FeatureId } from '../types';
import { editImage } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultDisplay from '../components/ResultDisplay';

const INSTRUCT_TEMPLATES = [
  { name: 'Anime', prompt: 'Convert this image to a vibrant anime style.' },
  { name: 'Cinematic', prompt: 'Give this image a cinematic look, with dramatic lighting and a widescreen feel.' },
  { name: 'Vintage', prompt: 'Make this image look like a vintage photograph from the 1970s.' },
  { name: 'Watercolor', prompt: 'Transform this image into a watercolor painting.' },
  { name: 'Pixel Art', prompt: 'Convert this image into 8-bit pixel art.' },
  { name: 'Neon', prompt: 'Add a neon-punk aesthetic to this image with glowing highlights.' },
];

const MagicEditor: React.FC = () => {
  const [activeTool, setActiveTool] = useState<EditorTool>(EditorTool.Instruct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const featureInfo = FEATURES[FeatureId.MagicEditor];

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    setResultImage(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    let fullPrompt = '';
    switch (activeTool) {
      case EditorTool.Instruct:
        if (!prompt) {
          setError('Please provide instructions.');
          setIsLoading(false);
          return;
        }
        fullPrompt = prompt;
        break;
      case EditorTool.Resize:
        fullPrompt = `Crop the image to an aspect ratio of ${aspectRatio}. The crop should be centered on the main subject of the image. Do not add, remove, or change any content within the cropped area.`;
        break;
      case EditorTool.Extend:
        fullPrompt = `Extend the canvas of this image, creating a seamless outpainting effect. ${prompt || 'Use your creative imagination to expand the scene.'}`;
        break;
    }

    try {
      const editedImage = await editImage(imageFile, fullPrompt);
      setResultImage(editedImage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const toolConfig = {
    [EditorTool.Instruct]: { name: "Instruct", description: "Edit your image with text commands." },
    [EditorTool.Resize]: { name: "Resize", description: "Crop your image to a new aspect ratio." },
    [EditorTool.Extend]: { name: "Extend", description: "Expand your image with outpainting." },
  };

  const renderToolInputs = () => {
    switch (activeTool) {
      case EditorTool.Instruct:
        return (
          <div className="space-y-6">
            <div className="border-t border-gray-700 pt-6">
                <h4 className="text-base font-bold text-gray-300 mb-4 text-center tracking-wide">Quick Effects</h4>
                <div className="flex flex-wrap gap-3 justify-center">
                {INSTRUCT_TEMPLATES.map((template) => (
                    <button
                    key={template.name}
                    onClick={() => setPrompt(template.prompt)}
                    className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:border-purple-500 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                    {template.name}
                    </button>
                ))}
                </div>
            </div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'make the sky a vibrant sunset' or select a quick effect"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                rows={3}
            />
          </div>
        );
      case EditorTool.Resize:
        return (
          <div className="flex flex-wrap gap-2 justify-center">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setAspectRatio(ratio.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${aspectRatio === ratio.value ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        );
      case EditorTool.Extend:
        return (
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional: Describe what to add in the new space."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
            rows={2}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{featureInfo.title}</h2>
        <p className="text-gray-400 mt-1">{featureInfo.description}</p>
      </div>
      
      <div className="max-w-4xl mx-auto bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-6">
        <ImageUploader onImageUpload={handleImageUpload} />

        {imageFile && (
          <>
            <div className="flex justify-center border-b border-gray-700">
              {Object.values(EditorTool).map(tool => (
                <button
                  key={tool}
// Fix: Cast 'tool' to EditorTool as Object.values returns string[], which is not specific enough for the state setter.
                  onClick={() => setActiveTool(tool as EditorTool)}
                  className={`px-6 py-3 text-lg font-semibold border-b-2 transition-colors ${activeTool === tool ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  {/* Fix: Cast 'tool' to EditorTool to use it as an index for toolConfig. */}
                  {toolConfig[tool as EditorTool].name}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-gray-300 text-center">{toolConfig[activeTool].description}</p>
              {renderToolInputs()}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 px-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner message="Applying Magic..." /> : 'Apply Changes'}
            </button>
          </>
        )}

        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && !resultImage && (
        <div className="flex justify-center">
            <LoadingSpinner message="Our AI is working its magic..."/>
        </div>
      )}

      {resultImage && <ResultDisplay image={resultImage} />}
    </div>
  );
};

export default MagicEditor;
