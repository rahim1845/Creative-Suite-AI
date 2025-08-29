import React, { useState, useCallback } from 'react';
import { StudioTool, MOCKUP_TEMPLATES, COMPOSITE_TEMPLATES, INSTRUCT_TEMPLATES } from '../types';
import { editImage, compositeImages } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultDisplay from '../components/ResultDisplay';
import { PencilScribbleIcon, LayersIcon, MockupIcon } from '../components/icons';

interface MagicStudioProps {
  onAnimateImage: (base64Image: string) => void;
}

const toolConfig = {
  [StudioTool.Instruct]: { 
    name: "Instruct", 
    icon: <PencilScribbleIcon className="w-5 h-5" />, 
    description: "Describe the changes you want to make to your image." 
  },
  [StudioTool.Composite]: { 
    name: "Composite", 
    icon: <LayersIcon className="w-5 h-5" />, 
    description: "Merge two images together with a descriptive prompt." 
  },
  [StudioTool.Mockup]: { 
    name: "Mockup", 
    icon: <MockupIcon className="w-5 h-5" />, 
    description: "Place your graphic onto a product or scene." 
  },
};

const MagicStudio: React.FC<MagicStudioProps> = ({ onAnimateImage }) => {
  const [activeTool, setActiveTool] = useState<StudioTool>(StudioTool.Instruct);
  const [imageFile1, setImageFile1] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setResultImage(null);
  };

  const handleImage1Upload = useCallback((file: File) => {
    setImageFile1(file);
    resetState();
  }, []);

  const handleImage2Upload = useCallback((file: File) => {
    setImageFile2(file);
    resetState();
  }, []);

  const handleToolChange = (tool: StudioTool) => {
    setActiveTool(tool);
    resetState();
    setImageFile1(null);
    setImageFile2(null);
    setPrompt('');
  };

  const handleGenerate = async () => {
    if (!imageFile1 || (activeTool === StudioTool.Composite && !imageFile2)) {
      setError(`Please upload all required images for the ${toolConfig[activeTool].name} tool.`);
      return;
    }
    
    if (activeTool !== StudioTool.Composite && !prompt) {
      setError('Please provide a text prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      let generatedImage: string;
      if (activeTool === StudioTool.Composite) {
        const compositePrompt = prompt || "Combine the two images seamlessly. The overlay image should realistically integrate with the base image, matching its lighting and style.";
        generatedImage = await compositeImages(imageFile1, imageFile2!, compositePrompt);
      } else {
        const fullPrompt = activeTool === StudioTool.Mockup
          ? `Create a photorealistic mockup. Place the uploaded image onto ${prompt}. Ensure lighting, shadows, and perspective are realistic.`
          : prompt;
        generatedImage = await editImage(imageFile1, fullPrompt);
      }
      setResultImage(generatedImage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputs = () => {
    switch (activeTool) {
      case StudioTool.Instruct:
        return (
          <div className="space-y-6">
            <ImageUploader onImageUpload={handleImage1Upload} title="Upload Image to Edit" />
            {imageFile1 && (
              <div className="space-y-4">
                 <div className="space-y-3 pt-4 border-t border-gray-700">
                    <h4 className="text-base font-bold text-gray-300 text-center tracking-wide">Quick Effects</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {INSTRUCT_TEMPLATES.map(template => (
                            <button key={template.name} onClick={() => setPrompt(template.prompt)} className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:border-purple-500 transition-all duration-200">
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="...or describe your edit, e.g., 'make the sky a vibrant sunset'"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  rows={3}
                />
              </div>
            )}
          </div>
        );
      case StudioTool.Composite:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploader onImageUpload={handleImage1Upload} title="Upload Base Image (e.g., Background)" />
              <ImageUploader onImageUpload={handleImage2Upload} title="Upload Overlay Image (e.g., Product)" />
            </div>
            {(imageFile1 && imageFile2) && (
              <>
                <div className="space-y-3 pt-4 border-t border-gray-700">
                    <h4 className="text-base font-bold text-gray-300 text-center tracking-wide">Prompt Ideas</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {COMPOSITE_TEMPLATES.map(template => (
                            <button key={template.name} onClick={() => setPrompt(template.prompt)} className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:border-purple-500 transition-all duration-200">
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how to merge the images (optional)"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  rows={3}
                />
              </>
            )}
          </div>
        );
      case StudioTool.Mockup:
        return (
          <div className="space-y-6">
            <ImageUploader onImageUpload={handleImage1Upload} title="Upload Your Graphic or Logo" />
            {imageFile1 && (
              <>
                <div className="space-y-3 pt-4 border-t border-gray-700">
                    <h4 className="text-base font-bold text-gray-300 text-center tracking-wide">Or choose a template</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {MOCKUP_TEMPLATES.map(template => (
                            <button key={template.name} onClick={() => setPrompt(template.prompt)} className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:border-purple-500 transition-all duration-200">
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the mockup scene... e.g., 'a black coffee mug on a wooden desk'"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    rows={3}
                />
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">Magic Studio</h2>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Your all-in-one AI image generator and editor. Create, combine, and mockup anything you can imagine.</p>
      </div>

      <div className="max-w-5xl mx-auto bg-gray-800/50 p-4 sm:p-6 rounded-2xl border border-gray-700 space-y-6">
        <div className="flex justify-center bg-gray-800 p-1.5 rounded-lg">
          {Object.values(StudioTool).map(tool => (
            <button
              key={tool}
              onClick={() => handleToolChange(tool)}
              className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-sm md:text-base font-semibold rounded-md transition-colors ${activeTool === tool ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              {toolConfig[tool].icon}
              <span className="hidden sm:inline">{toolConfig[tool].name}</span>
            </button>
          ))}
        </div>
        
        <p className="text-center text-gray-400 text-sm md:text-base">{toolConfig[activeTool].description}</p>
        
        {renderInputs()}

        {(imageFile1 && (activeTool !== StudioTool.Composite || imageFile2)) && (
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3.5 px-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner message="Generating..." /> : '✨ Generate'}
          </button>
        )}
        {error && <p className="text-red-400 text-center animate-pulse">{error}</p>}
      </div>

       {isLoading && !resultImage && (
        <div className="flex justify-center">
            <LoadingSpinner message="Our AI is working its magic... this may take a moment."/>
        </div>
      )}

      {resultImage && <ResultDisplay image={resultImage} onAnimate={onAnimateImage} />}
    </div>
  );
};

export default MagicStudio;