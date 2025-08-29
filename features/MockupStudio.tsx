import React, { useState, useCallback } from 'react';
import { FEATURES, FeatureId } from '../types';
import { editImage } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultDisplay from '../components/ResultDisplay';

const MockupStudio: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const featureInfo = FEATURES[FeatureId.MockupStudio];

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    setResultImage(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!imageFile || !prompt) {
      setError('Please upload an asset and describe the mockup.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    const fullPrompt = `Create a photorealistic mockup. Place the uploaded image onto a ${prompt}. The lighting, shadows, and perspective should be realistic.`;
    
    try {
      const generatedImage = await editImage(imageFile, fullPrompt);
      setResultImage(generatedImage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{featureInfo.title}</h2>
        <p className="text-gray-400 mt-1">{featureInfo.description}</p>
      </div>

      <div className="max-w-4xl mx-auto bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-6">
        <ImageUploader onImageUpload={handleImageUpload} title="Upload Your Asset (e.g., Logo)" />

        {imageFile && (
            <>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'a black coffee mug on a wooden desk' or 'a t-shirt worn by a model'"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    rows={3}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-3 px-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner message="Generating Mockup..." /> : 'Generate Mockup'}
                </button>
            </>
        )}
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && !resultImage && (
        <div className="flex justify-center">
            <LoadingSpinner message="Building your photorealistic mockup..."/>
        </div>
      )}

      {resultImage && <ResultDisplay image={resultImage} />}
    </div>
  );
};

export default MockupStudio;