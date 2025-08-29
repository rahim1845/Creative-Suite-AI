import React, { useState, useCallback } from 'react';
import { FEATURES, FeatureId } from '../types';
import { editImage } from '../services/geminiService';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultDisplay from '../components/ResultDisplay';

const VariationEngine: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const featureInfo = FEATURES[FeatureId.VariationEngine];

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    setResultImage(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!imageFile) {
      setError('Please upload an image to create variations of.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    const fullPrompt = `Generate a stylistic variation of this image. ${prompt || 'Keep the core subject and composition, but explore a different artistic style.'}`;
    
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
        <ImageUploader onImageUpload={handleImageUpload} title="Upload an Image for Variation" />

        {imageFile && (
            <>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Optional: Describe a style, e.g., 'in the style of a watercolor painting' or 'make it look like a vintage photograph'"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                    rows={3}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full py-3 px-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner message="Generating Variation..." /> : 'Generate Variation'}
                </button>
            </>
        )}
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && !resultImage && (
        <div className="flex justify-center">
            <LoadingSpinner message="Exploring new creative possibilities..."/>
        </div>
      )}

      {resultImage && <ResultDisplay image={resultImage} />}
    </div>
  );
};

export default VariationEngine;
