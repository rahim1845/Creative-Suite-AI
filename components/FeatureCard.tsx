import React from 'react';
import { Feature, FeatureId } from '../types';

interface FeatureCardProps {
  feature: Feature;
  onSelect: (id: FeatureId) => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(feature.id)}
      className="bg-gray-800 rounded-xl p-6 flex flex-col items-start gap-4 cursor-pointer group hover:bg-gray-700/70 border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="p-3 bg-gray-700 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
        {feature.icon}
      </div>
      <h2 className="text-2xl font-bold text-white">{feature.title}</h2>
      <p className="text-gray-400 text-base flex-grow">
        {feature.description}
      </p>
      <span className="text-purple-400 font-semibold group-hover:underline">
        Get Started →
      </span>
    </div>
  );
};

export default FeatureCard;