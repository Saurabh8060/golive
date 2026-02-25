import { useDatabase } from '@/contexts/databaseContext';
import { Interest, interests } from '@/lib/types/interests';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import InterestComponent from './interestComponent';

export default function SelectInterests() {
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { setUserInterests } = useDatabase();
  const { user } = useUser();

  useEffect(() => {
    document.body.dataset.skipSessionEnforcer = 'true';
    return () => {
      delete document.body.dataset.skipSessionEnforcer;
    };
  }, []);

  return (
    <section className='fixed inset-0 z-40 flex items-center justify-center bg-twitch-ice bg-opacity-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-2xl h-[78vh] sm:h-[80vh] relative text-black flex flex-col'>
        <h1 className='text-lg sm:text-2xl font-bold p-4 sm:p-5 text-center'>
          What are you into?
        </h1>
        <p className='text-center text-xs sm:text-sm mb-2 sm:mb-3 px-4 sm:px-6'>
          Choose 1 or more categories of channels being streamed right now.
        </p>
        <div className='flex-1 overflow-y-auto px-4 sm:px-6 pb-4'>
          <div className='mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3'>
            {interests.map((interest) => (
              <button
                key={interest.id}
                type='button'
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
                  compact
                />
              </button>
            ))}
          </div>
        </div>
        <div className='border-t border-gray-200 p-3 sm:p-4 flex items-center justify-end bg-white rounded-b-lg'>
          <button
            type='button'
            disabled={isSaving}
            className={`px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold cursor-pointer rounded-md transition-colors ${
              selectedInterests.length === 0 || isSaving
                ? 'bg-gray-300 opacity-50 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
            onClick={async () => {
              if (selectedInterests.length === 0 || !user?.id || isSaving) {
                console.log('No interests selected or user not found');
                return;
              }
              setIsSaving(true);
              const updatedUser = await setUserInterests(
                selectedInterests.map((interest) => interest.name),
                user.id
              );
              setIsSaving(false);
              if (updatedUser) {
                window.location.assign('/app');
              }
            }}
          >
            {isSaving ? 'Saving...' : selectedInterests.length === 0 ? 'Choose 1 more' : 'Save'}
          </button>
        </div>
      </div>
    </section>
  );
}
