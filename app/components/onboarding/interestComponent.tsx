import { colorForInterest } from '@/lib/types/interests';
import React from 'react';

const InterestComponent = ({
  interest,
  selected = true,
}: {
  interest: string;
  selected?: boolean;
}) => {
  const numberOfTextElements = 11;

  return (
    <div
      className={`group relative w-full min-w-20 aspect-[2/3] flex flex-col items-center justify-center overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer ${
        selected
          ? 'ring-4 ring-golivehub-purple ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
          : 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-gray-300 dark:hover:ring-gray-600'
      }`}
      style={{ backgroundColor: colorForInterest(interest) }}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 pointer-events-none" />
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -translate-x-full group-hover:translate-x-full" 
           style={{ transition: 'transform 0.8s ease-in-out, opacity 0.5s' }} />

      {/* Text layers with opacity gradient - FIXED FOR MOBILE */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-1">
        {[...Array(numberOfTextElements)].map((_, i) => (
          <p
            key={i}
            className="text-center text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-wider mix-blend-overlay select-none transition-all duration-300 group-hover:tracking-wider leading-tight"
            style={{
              opacity: getOpacity(i),
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              margin: '0',
              padding: '0',
            }}
          >
            {interest}
          </p>
        ))}
      </div>

      {/* Bottom label with background */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-white text-[10px] sm:text-xs font-semibold text-center drop-shadow-lg">
          {interest}
        </p>
      </div>

      {/* Selection checkmark */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-golivehub-purple rounded-full flex items-center justify-center shadow-lg animate-scale-in">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </div>
  );

  function getOpacity(index: number): number {
    const middleIndex = Math.floor(numberOfTextElements / 2);
    return 1 - (Math.abs(index - middleIndex) * 1.9) / middleIndex;
  }
};

export default InterestComponent;