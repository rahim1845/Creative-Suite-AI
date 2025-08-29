import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import MagicStudio from './features/MagicStudio';
import VideoSynthesizer from './features/VideoSynthesizer';

export type View = 'studio' | 'video';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('studio');
  const [imageForVideo, setImageForVideo] = useState<string | null>(null);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view !== 'video') {
      setImageForVideo(null);
    }
  };

  const handleAnimateImage = useCallback((base64Image: string) => {
    setImageForVideo(`data:image/jpeg;base64,${base64Image}`);
    setCurrentView('video');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header activeView={currentView} onNavigate={handleNavigate} />
      <main className="container mx-auto p-4 md:p-8">
        {currentView === 'studio' && <MagicStudio onAnimateImage={handleAnimateImage} />}
        {currentView === 'video' && <VideoSynthesizer initialImage={imageForVideo} />}
      </main>
    </div>
  );
};

export default App;
