import React, { useState } from 'react';
import { FEATURES, FeatureId } from '../types';
import { generateAdCreative } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultDisplay from '../components/ResultDisplay';

const AdComposer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const featureInfo = FEATURES[FeatureId.AdComposer];

  const handleSubmit = async () => {
    if (!prompt) {
      setError('Please provide a text brief for your ad.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const generatedImage = await generateAdCreative(prompt);
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
        <h3 className="text-xl font-semibold text-center">Describe Your Ad Creative</h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'A vibrant ad for a new line of organic dog food, showing a happy golden retriever in a sunny park.'"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
          rows={5}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 px-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner message="Composing Ad..." /> : 'Generate Ad Creative'}
        </button>
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>

      {isLoading && !resultImage && (
        <div className="flex justify-center">
            <LoadingSpinner message="Generating a stunning ad creative for you..."/>
        </div>
      )}

      {resultImage && <ResultDisplay image={resultImage} />}
    </div>
  );
};

export default AdComposer;