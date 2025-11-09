import { useDatabase } from '@/contexts/databaseContext';
import { Interest, interests } from '@/lib/types/interests';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import InterestComponent from './interestComponent';

export default function SelectInterests() {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const { setUserInterests } = useDatabase();
  const { user } = useUser();

  if (!isOpen) return null;

  return (
    <section className='fixed inset-0 z-50 flex items-center justify-center bg-twitch-ice bg-opacity-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative text-black'>
        <h1 className='text-xl sm:text-2xl font-bold p-4 sm:p-6 text-center'>
          What are you into?
        </h1>
        <p className='text-center text-xs sm:text-sm mb-4 sm:mb-6 px-4 sm:px-6'>
          Choose 1 or more categories of channels being streamed right now.
        </p>
        <div>
          {/* FIXED: Responsive grid - 2 cols on mobile, 3 on small screens, 5 on larger */}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 p-4 sm:p-6'>
            {interests.map((interest) => (
              <button
                key={interest.id}
                className='w-full'
                onClick={() => {
                  if (selectedInterests.includes(interest)) {
                    setSelectedInterests(
                      selectedInterests.filter((i) => i.id !== interest.id)
                    );
                  } else {
                    setSelectedInterests([...selectedInterests, interest]);
                  }
                }}
              >
                <InterestComponent
                  interest={interest.name}
                  selected={selectedInterests.includes(interest)}
                />
              </button>
            ))}
          </div>
          <div className='flex items-center justify-center w-full h-[1px] bg-gray-300 my-4'>
            <p className='bg-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold'>
              <span className='text-xs px-2 py-0.5 uppercase text-white bg-red-500 rounded-full mr-2'>
                Live
              </span>
              Channels for you
            </p>
          </div>
          <p className='text-center text-xs sm:text-sm text-gray-500 px-4 sm:px-6 min-h-24 sm:min-h-32 flex items-center justify-center'>
            No live channels at the moment.
          </p>
          <div className='flex items-center justify-center w-full h-[1px] bg-gray-300 my-4' />
          <div className='flex items-center justify-end w-full p-4'>
            <button
              className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold cursor-pointer rounded-md transition-colors ${
                selectedInterests.length === 0
                  ? 'bg-gray-300 opacity-50 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
              onClick={async () => {
                console.log(selectedInterests);
                if (selectedInterests.length === 0 || !user?.id) {
                  console.log('No interests selected or user not found');
                  return;
                }
                await setUserInterests(
                  selectedInterests.map((interest) => interest.name),
                  user.id
                );
                setIsOpen(false);
                window.location.reload();
              }}
            >
              {selectedInterests.length === 0 ? 'Choose 1 more' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}