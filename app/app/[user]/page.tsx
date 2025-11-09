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

  const { supabase, getUserData, setSupabaseClient, followUser } = useDatabase();

  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<string | undefined>();
  const [showMobileChat, setShowMobileChat] = useState(false);

  // 🎥 Join livestream
  useEffect(() => {
    const joinCall = async () => {
      if (!streamClient || !user) return;

      try {
        const call = streamClient.call('livestream', user);
        await call.get();
        await call.join();
        console.log('[Viewer] Joined call:', call.id);
        setCall(call);
      } catch (error) {
        console.log('[UserPage] Failed to join livestream:', error);
      } finally {
        setIsLoading(false);
      }
    };

    joinCall();
  }, [streamClient, user]);

  // 🌐 Initialize Stream client
  useEffect(() => {
    const initializeStreamClient = async () => {
      if (streamClient) return;

      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_STREAM_API_KEY is not set');
      }

      const userId = session?.user.id;
      if (!userId) {
        console.log('[UserPage] User ID is not (yet) set');
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

  // 🧠 Initialize Supabase + user data
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
        console.log('[UserPage] User param missing');
        return;
      }

      const userData = await getUserData(user, 'user_id');
      if (!userData) {
        console.log('[UserPage] Streamer data not found for:', user);
        return;
      }

      setStreamerData(userData);

      if (session?.user.id && userData) {
        const currentUserData = await getUserData(session.user.id, 'user_id');
        if (currentUserData && currentUserData.following.includes(user)) {
          setIsFollowing(true);
        }
        setCurrentUserData(currentUserData?.user_id);
      }
    };

    initializeClients();
  }, [
    session,
    supabase,
    setSupabaseClient,
    getUserData,
    streamClient,
    user,
  ]);

  // 👤 Handle follow/unfollow
  const handleFollow = async () => {
    if (!session?.user.id || !streamerData) {
      console.log('[UserPage] Missing session or streamer data');
      return;
    }

    if (session.user.id === user) return;

    setIsFollowLoading(true);
    try {
      const success = await followUser(session.user.id, user);
      if (success) {
        setIsFollowing(!isFollowing);
        const updatedStreamerData = await getUserData(user, 'user_id');
        if (updatedStreamerData) {
          setStreamerData(updatedStreamerData);
        }
      }
    } catch (error) {
      console.log('[UserPage] Error following user:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // 🧩 Render
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Mobile Chat Toggle Button - Fixed Position */}
      <button
        onClick={() => setShowMobileChat(!showMobileChat)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-twitch-purple hover:bg-purple-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110"
        aria-label="Toggle chat"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {showMobileChat ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          )}
        </svg>
      </button>

      {/* Mobile Chat Overlay */}
      {showMobileChat && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-gray-900">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">Chat</h2>
              <button
                onClick={() => setShowMobileChat(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {session?.user.id && streamerData && (
                <MyChat
                  userId={session.user.id}
                  userName={session?.user?.fullName || 'User'}
                  isStreamer={false}
                  channelId={streamerData.user_id}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="h-full overflow-y-auto lg:grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]">
        {/* Left side: Stream + profile */}
        <div className="overflow-y-auto">
          {/* Stream Section */}
          <section className="relative bg-black">
            {isLoading && (
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-600 border-t-twitch-purple mb-4"></div>
                  <p className="text-white text-lg">Loading stream...</p>
                </div>
              </div>
            )}

            {/* Stream Offline */}
            {!isLoading && (!call || call.state.backstage) && (
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
                </div>
                
                <div className="text-center text-white z-10 px-4">
                  <div className="mb-4">
                    <svg
                      className="w-20 h-20 mx-auto mb-4 opacity-80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-2xl mb-3">
                    Stream Offline
                  </h1>
                  <p className="text-lg md:text-xl opacity-90 max-w-md mx-auto">
                    {streamerData?.user_id} is not currently streaming. Check back later!
                  </p>
                </div>
              </div>
            )}

            {/* Stream Live */}
            {!isLoading && streamClient && call && !call.state.backstage && (
              <div className="aspect-video">
                <StreamTheme>
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <LivestreamWatching />
                    </StreamCall>
                  </StreamVideo>
                </StreamTheme>
              </div>
            )}
          </section>

          {/* Profile Section */}
          {streamerData && (
            <div className="bg-white dark:bg-gray-900">
              {/* Profile Header with Follow Button */}
              <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={streamerData.image_url}
                          alt={streamerData.user_name}
                          width={80}
                          height={80}
                          className="rounded-full ring-4 ring-purple-100 dark:ring-purple-900"
                        />
                        {!isLoading && call && !call.state.backstage && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                            LIVE
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
                          {streamerData.user_name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {streamerData.followers.length.toLocaleString()}
                          </span>{' '}
                          followers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {session?.user.id !== user && (
                        <Button
                          variant="primary"
                          onClick={handleFollow}
                          disabled={isFollowLoading}
                          className={`transition-all duration-300 ${
                            isFollowing
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                              : 'bg-twitch-purple hover:bg-purple-600 text-white'
                          }`}
                        >
                          {isFollowLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Loading...
                            </span>
                          ) : isFollowing ? (
                            '✓ Following'
                          ) : (
                            '+ Follow'
                          )}
                        </Button>
                      )}
                      {/* <Button
                        variant="icon"
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <EllipsisVertical />
                      </Button> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests Section */}
              {streamerData.interests.length > 0 && (
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Interests
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {streamerData.interests.map((interest, index) => (
                      <div key={`${interest}-${index}`} className="flex-shrink-0">
                        <InterestComponent interest={interest} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Following Section */}
              {streamerData.following.length > 0 && (
                <div className="p-4 md:p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Following ({streamerData.following.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {streamerData.following.map((following, index) => (
                      <div
                        key={`${following}-${index}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {following.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium truncate">
                          {following}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {streamerData.following.length === 0 && (
                <div className="p-4 md:p-6">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>{streamerData.user_name} is not following anyone yet</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: Chat - Desktop Only */}
        <aside className="hidden lg:block border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-full">
          {session?.user.id && streamerData && (
            <MyChat
              userId={session.user.id}
              userName={session?.user?.fullName || 'User'}
              isStreamer={false}
              channelId={streamerData.user_id}
            />
          )}
        </aside>
      </div>
    </div>
  );
}