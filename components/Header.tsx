import React from 'react';
import { MagicWandIcon, VideoIcon } from './icons';
import { View } from '../App';

interface HeaderProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const navItems = [
    { id: 'studio', label: 'Magic Studio', icon: <MagicWandIcon className="w-5 h-5" /> },
    { id: 'video', label: 'Video Synthesizer', icon: <VideoIcon className="w-5 h-5" /> },
  ];

  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <MagicWandIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wider hidden sm:block">Creative Suite AI</h1>
        </div>
        <nav className="bg-gray-800 p-1.5 rounded-lg flex items-center gap-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as View)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeView === item.id ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
