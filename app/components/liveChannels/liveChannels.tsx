import { Tables } from '@/database/database.types'
import React from 'react'
import { ArrowRight } from '../icons';
import Image from 'next/image';
import Sample_Stream_Image from '../../../public/sample-image.png';

interface LiveChannelsProps {
  livestreams: Tables<'livestreams'>[];
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const LiveChannels = ({ livestreams, isOpen, onToggle }: LiveChannelsProps) => {
  return (
    <div
      className="bg-golivehub-ice text-gray-500 p-2 flex flex-col gap-1 overflow-hidden transition-[width] duration-700 ease-in-out h-full shadow-lg"
      style={{ width: isOpen ? '320px' : '64px' }}
    >
      <div
        className="flex items-center pb-2 text-black overflow-hidden"
        style={{ 
          justifyContent: isOpen ? 'space-between' : 'center',
          transition: 'justify-content 0.7s ease-in-out'
        }}
      >
        {isOpen && (
          <h2 className="text-sm uppercase font-bold whitespace-nowrap transition-opacity duration-700 ease-in-out">
            Live Channels
          </h2>
        )}
        <button
          className={`text-sm text-secondary cursor-pointer rounded-full hover:bg-gray-200 p-1 transition-transform duration-700 ease-in-out ${
            isOpen ? '' : 'rotate-180'
          }`}
          onClick={() => onToggle(!isOpen)}
        >
          <ArrowRight />
        </button>
      </div>

      <div className="overflow-y-auto flex flex-col gap-1">
        {livestreams.map((livestream) => (
          <button
            key={livestream.id}
            className="flex items-center gap-2 text-secondary cursor-pointer transition-all duration-200 ease-in-out hover:bg-gray-100 rounded-lg p-2"
            onClick={() => {
              console.log(`Clicked on ${livestream.name}`);
            }}
          >
            <Image
              src={livestream.profile_image_url || Sample_Stream_Image}
              alt={livestream.name}
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
            />
            <div
              className="flex items-center gap-2 overflow-hidden transition-all duration-700 ease-in-out"
              style={{
                width: isOpen ? '100%' : '0',
                opacity: isOpen ? 1 : 0
              }}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-sm font-bold text-black text-left whitespace-nowrap">
                  {livestream.name}
                </h3>
                <p className="text-xs text-left truncate">
                  {livestream.categories.join(', ')}
                </p>
              </div>
              <div className="flex items-center justify-start gap-1 ml-auto flex-shrink-0">
                <div className="size-2 bg-red-500 rounded-full" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LiveChannels;