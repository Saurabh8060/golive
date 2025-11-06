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
      <section className="grid h-full grid-cols-[auto_1fr]">
        <LiveChannels livestreams={livestreams} />
        <HomeFeed livestreams={livestreams} />
      </section>

      <div className="fixed bottom-4 left-4 flex space-x-2">
        <button
          onClick={() => {setLivestreamsMockData(); window.location.reload()}}
          className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-purple-700"
        >
          Set Livestreams Mock Data
        </button>
        <button
          onClick={() => {removeLivestreamsMockData(); window.location.reload()}}
          className="bg-gray-300 text-black px-3 py-1 rounded-lg text-sm hover:bg-gray-400"
        >
          Remove Livestreams Mock Data
        </button>
      </div>
    </>
  );
};
