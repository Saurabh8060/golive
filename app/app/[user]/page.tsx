'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useDatabase } from '@/contexts/databaseContext';
import { Tables } from '@/database/database.types';
import { useSession } from '@clerk/nextjs';
import {
  Call,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { getClient } from '@/lib/streamClient';
import { createToken } from '@/app/actions';
import LivestreamWatching from '@/app/components/livestreamWatching/livestreamWatching';
import { Button } from '@/app/components/button/button';
import { EllipsisVertical } from '@/app/components/icons';
import MyChat from '@/app/components/myChat/myChat';
import InterestComponent from '@/app/components/onboarding/interestComponent';

export default function UserPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const { user } = use(params);

  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(
    null
  );
  const [streamerData, setStreamerData] = useState<Tables<'users'> | null>(
    null
  );
  const [call, setCall] = useState<Call | null>(null);
  const { session } = useSession();

  const { supabase, getUserData, setSupabaseClient, followUser } =
    useDatabase();

  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<string | undefined>();

  useEffect(() => {
    const joinCall = async () => {
      if (!streamClient || !user) return;

      try {
        console.log('000000000000', user)
        const call = streamClient.call('livestream', user);

        await call.get();

        await call.join();

        console.log('[Viewer] Joined call:', call.id);
        console.log('[Viewer] Call state:', call.state.callingState);

        setCall(call);
      } catch (error) {
        console.error('[UserPage] Failed to join livestream:', error);
      } finally {
        setIsLoading(false);
      }
    };

    joinCall();
  }, [streamClient, user]);

  useEffect(() => {
    const initializeStreamClient = async () => {
      if (streamClient) return;

      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_STREAM_API_KEY is not set');
      }

      const userId = session?.user.id;
      if (!userId) {
        console.error('[UserPage] User ID is not (yet) set');
        return;
      }

      const client = getClient({
        apiKey,
        user: { id: userId },
        userToken: await createToken(userId),
      });

      setStreamClient(client);
    };

    initializeStreamClient();
  }, [session?.user.id, streamClient]);

  useEffect(() => {
    const initializeClients = async () => {
      if (!supabase) {
        const supabaseToken = await session?.getToken();
        if (supabaseToken) {
          setSupabaseClient(supabaseToken);
          return;
        }
      }

      if (!user) {
        console.error('[UserPage] User param missing');
        return;
      }

      const userData = await getUserData(user, 'user_id');
      if (!userData) {
        console.error('[UserPage] Streamer data not found for:', user);
        return;
      }

      setStreamerData(userData);

      if (session?.user.id && userData) {
        const currentUserData = await getUserData(session.user.id, 'user_id');
        if (currentUserData && currentUserData.following.includes(user)) {
          setIsFollowing(true);
        }
        setCurrentUserData(currentUserData?.user_name);
      }
    };

    initializeClients();
  }, [
    session,
    supabase,
    setSupabaseClient,
    getUserData,
    streamClient,
    setStreamerData,
    user,
  ]);

  /**
   * Handle follow/unfollow
   */
  const handleFollow = async () => {
    if (!session?.user.id || !streamerData) {
      console.error('[UserPage] Missing session or streamer data');
      return;
    }

    if (session.user.id === user) return;

    setIsFollowLoading(true);
    try {
      const success = await followUser(session.user.id, user);
      if (success) {
        setIsFollowing(!isFollowing);
        const updatedStreamerData = await getUserData(user, 'user_name');
        if (updatedStreamerData) {
          setStreamerData(updatedStreamerData);
        }
      }
    } catch (error) {
      console.error('[UserPage] Error following user:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  /**
   * Render UI
   */
  return (
    <div className="h-full overflow-y-scroll grid grid-cols-2">
      <div>
        <section className="min-h-72 max-h-[500px] w-full">
          {isLoading && (
            <div className="h-full w-full flex items-center justify-center text-2xl">
              <p>Loading...</p>
            </div>
          )}

          {/* Stream Offline */}
          {!isLoading && (!call || call.state.backstage) && (
            <div className="flex items-center justify-center min-h-72 max-h-[500px] w-full bg-gradient-to-r from-twitch-purple via-violet-400 to-twitch-purple">
              <div className="text-center text-white opacity-80 mix-blend-dark-light">
                <h1 className="text-4xl font-extrabold drop-shadow-lg">
                  Stream Offline
                </h1>
                <p className="mt-2 text-lg drop-shadow-md">
                  {streamerData?.user_name} is not currently streaming. Check
                  back later!
                </p>
              </div>
            </div>
          )}

          {/* Stream Live */}
          {!isLoading && streamClient && call && !call.state.backstage && (
            <StreamTheme>
              <StreamVideo client={streamClient}>
                <StreamCall call={call}>
                  <LivestreamWatching />
                </StreamCall>
              </StreamVideo>
            </StreamTheme>
          )}
        </section>

        {streamerData && (
          <section className="space-y-4">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Image
                  src={streamerData.image_url}
                  alt={streamerData.user_name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-xl font-bold">
                    {streamerData.user_name}
                  </h2>
                  <p>{streamerData.followers.length} followers</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {session?.user.id !== user && (
                  <Button
                    variant="primary"
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                  >
                    {isFollowLoading
                      ? 'Following...'
                      : isFollowing
                      ? 'Unfollow'
                      : 'Follow'}
                  </Button>
                )}
                <Button variant="icon">
                  <EllipsisVertical />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-2xl font-bold">Interests</h2>
              <div className="flex gap-4 overflow-x-scroll">
                {streamerData.interests.map((interest, index) => (
                  <InterestComponent
                    key={`${interest}-${index}`}
                    interest={interest}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h2 className="text-2xl font-bold">Following</h2>
              {streamerData.following.length === 0 && (
                <p>{streamerData.user_name} is not following anyone</p>
              )}
              {streamerData.following.map((following, index) => (
                <div key={`${following}-${index}`}>
                  <p>{following}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="max-h-1/2">
        {session?.user.id && (
          <MyChat
            userId={session.user.id}
            userName={(currentUserData || 'Test_User').replace(/\s+/g, '_')}
            isStreamer={false}
          />
        )}
      </section>
    </div>
  );
}
