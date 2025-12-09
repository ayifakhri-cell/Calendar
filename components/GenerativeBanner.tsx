import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerativeBannerProps {
  imageUrl: string | null;
  isLoading: boolean;
  monthName: string;
}

export const GenerativeBanner: React.FC<GenerativeBannerProps> = ({ imageUrl, isLoading, monthName }) => {
  return (
    <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-md group transition-all duration-500">
      {/* Background Image or Placeholder */}
      <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`Theme for ${monthName}`} 
            className="w-full h-full object-cover transition-opacity duration-700 opacity-100"
          />
        ) : (
          <div className="text-stone-400 flex flex-col items-center">
             <Sparkles className="w-8 h-8 mb-2 opacity-50" />
             <span className="text-sm font-medium">AI Generating Theme...</span>
          </div>
        )}
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Month Title */}
      <div className="absolute bottom-4 left-6 text-white">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-md">
          {monthName}
        </h1>
        <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
          <Sparkles className="w-3 h-3" />
          <span>Generative Theme Active</span>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg animate-pulse">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        </div>
      )}
    </div>
  );
};