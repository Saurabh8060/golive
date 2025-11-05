'use client';

import { useDatabase } from '@/contexts/databaseContext';
import { useSession } from '@clerk/nextjs';
import { SignedInSessionResource } from '@clerk/types';
import { useEffect, useState } from 'react';

import { Tables } from '@/database/database.types';
import Onboarding from '../components/onboarding/onboarding';
import SelectInterests from '../components/onboarding/selectInterests';
import LiveChannels from '../components/liveChannels/liveChannels';
import HomeFeed from '../components/homeFeed/homeFeed';


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

  useEffect(() => {
    async function initializeSupabase(session: SignedInSessionResource) {
      const token = (await session?.getToken()) as string;
      if (token) {
        setSupabaseClient(token);
      }
    }

    if (session && !supabase) {
      initializeSupabase(session);
    } else {
      console.log('No clerk session');
    }
  }, [session, setSupabaseClient, supabase]);

  useEffect(() => {
    console.log('Session', session?.user.id);
    if (supabase && session?.user.id) {
        console.log('inside supabase and user id');
      getUserData(session?.user.id).then((user) => {
        console.log('inside getUserData');
        if (user) {
          console.log('inside user', user);
          if (user && user.interests && user.interests.length === 0) {
            console.log('inside if');
            setShowOnboarding(false);
            setShowSelectInterests(true);
          } else {
            console.log('inside else');
            setShowOnboarding(false);
            setShowSelectInterests(false);
            getLivestreams().then((livestreams) => {
              setLivestreams(livestreams);
            });
          }
        } else {
          setShowOnboarding(true);
        }
      });
    }
  }, [supabase, session?.user.id, getUserData, getLivestreams]);

  if (showOnboarding) {
    return <Onboarding />;
  }

  if (showSelectInterests) {
    return <SelectInterests />;
  }

  return (
    <>
      <section className='grid h-full grid-cols-[auto_1fr]'>
        <LiveChannels livestreams={livestreams} />
        <HomeFeed livestreams={livestreams} />
      </section>
      <button onClick={() => setLivestreamsMockData()}>
        Set Livestreams Mock Data
      </button>
      <button onClick={() => removeLivestreamsMockData()}>
        Remove Livestreams Mock Data
      </button>
    </>
  );
}