'use client';

import { SignedInSessionResource } from '@clerk/types';
import { Tables } from '@/database/database.types';
import { useDatabase } from '@/contexts/databaseContext';
import { useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Onboarding from '../components/onboarding/onboarding';
import SelectInterests from '../components/onboarding/selectInterests';
import LiveChannels from '../components/liveChannels/liveChannels';
import HomeFeed from '../components/homeFeed/homeFeed';

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 border-4 border-t-transparent border-t-purple-500 border-gray-300 rounded-full animate-spin" />
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default function AppPage() {
  const { session } = useSession();
  const {
    supabase,
    setSupabaseClient,
    getUserData,
    getLivestreams,
    setLivestreamsMockData,
    removeLivestreamsMockData,
  } = useDatabase();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSelectInterests, setShowSelectInterests] = useState(false);
  const [livestreams, setLivestreams] = useState<Tables<'livestreams'>[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function initializeSupabase(session: SignedInSessionResource) {
      const token = (await session?.getToken()) as string;
      if (token) {
        setSupabaseClient(token);
      }
    }

    if (session && !supabase) {
      initializeSupabase(session);
    }
  }, [session, setSupabaseClient, supabase]);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      if (!supabase || !session?.user.id) return;

      try {
        const user = await getUserData(session.user.id);
        console.log(user);
        if (!user) {
          setShowOnboarding(true);
        } else if (user.interests && user.interests.length === 0) {
          setShowSelectInterests(true);
        } else {
          const streams = await getLivestreams();
          setLivestreams(streams);
          setShowOnboarding(false);
          setShowSelectInterests(false);
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [supabase, session?.user.id, getUserData, getLivestreams]);

  if (loading) {
    return <Loader />;
  }

  if (showOnboarding) {
    return <Onboarding />;
  }

  if (showSelectInterests) {
    return <SelectInterests />;
  }

return (
    <>
      <section className="relative flex h-screen w-screen overflow-hidden">
        {/* Sidebar with fixed width when closed, overlays when open */}
        <div 
          className="relative z-20 flex-shrink-0 transition-[width] duration-700 ease-in-out"
          style={{ width: isSidebarOpen ? '320px' : '64px' }}
        >
          <LiveChannels 
            livestreams={livestreams}
            isOpen={isSidebarOpen}
            onToggle={setIsSidebarOpen}
          />
        </div>
        
        {/* Main content area */}
        <main 
          className="relative flex-1 min-w-0 overflow-auto transition-[margin-left] duration-700 ease-in-out"
          style={{ marginLeft: isSidebarOpen ? '-256px' : '0' }}
        >
          <HomeFeed livestreams={livestreams} />
          
          {/* Translucent overlay when sidebar is open */}
          <div 
            className={`absolute inset-0 bg-black transition-opacity duration-700 ease-in-out pointer-events-none ${
              isSidebarOpen ? 'opacity-60' : 'opacity-0'
            }`}
            style={{ zIndex: 10 }}
          />
        </main>
      </section>
      </>
)
};