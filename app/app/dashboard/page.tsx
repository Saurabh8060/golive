"use client";
import React, { useEffect, useState } from "react";
import {
  StreamVideoClient,
  Call,
  StreamTheme,
  StreamVideo,
  StreamCall,
  User,
} from "@stream-io/video-react-sdk";
import StreamerView from "@/app/components/streamerView/streamerView";
import { useSession } from "@clerk/nextjs";
import { useDatabase } from "@/contexts/databaseContext";
import { createToken } from "@/app/actions";
import { getClient } from "@/lib/streamClient";
import MyChat from "@/app/components/myChat/myChat";
import { Loader2, MessageSquare, X } from "lucide-react";

const Dashboard = () => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [chatChannelId, setChatChannelId] = useState<string | null>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { session } = useSession();
  const { supabase, getUserData, setSupabaseClient, getLivestreams } = useDatabase();

  useEffect(() => {
    let isCancelled = false;

    const enterCall = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        if (!apiKey) {
          throw new Error("Stream API key is not configured");
        }
        
        const userId = session?.user.id;
        if (!userId) {
          setIsLoading(false);
          return;
        }

        if (!supabase) {
          const token = await session?.getToken();
          if (token) {
            console.log("[Dashboard] Setting supabase client with token");
            setSupabaseClient(token);
            setIsLoading(false);
            return;
          }
        }

        if (client && call) {
          setIsLoading(false);
          return;
        }

        const userData = await getUserData(userId);
        if (!userData) {
          throw new Error("User data not found");
        }

        const callId = userData.user_id;
        const token = await createToken(userId);
        const user: User = {
          id: userId,
          name: userData.user_id,
        };

        const streamClient = getClient({
          apiKey: apiKey,
          user: user,
          userToken: token,
        });

        const streamCall = streamClient.call("livestream", callId);
        await streamCall.join({ create: true });
        const livestreams = await getLivestreams();
        const activeLivestream = livestreams.find(
          (livestream) => livestream.user_id === callId
        );

        if (isCancelled) {
          await streamCall.leave();
          return;
        }
        
        setClient(streamClient);
        setCall(streamCall);
        setChatChannelId(activeLivestream?.id ?? null);
        setUserName(userData.user_id);
        setIsLoading(false);
      } catch (err) {
        console.error("[Dashboard] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to connect to stream");
        setIsLoading(false);
      }
    };

    enterCall();

    return () => {
      isCancelled = true;
    };
  }, [session, getUserData, supabase, setSupabaseClient, client, call, getLivestreams]);

  useEffect(() => {
    return () => {
      if (call) {
        void call.leave();
      }
    };
  }, [call]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-300 text-lg font-medium">Setting up your stream...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 max-w-md text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen lg:h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-y-auto lg:overflow-hidden">
      <div className="min-h-screen lg:h-full grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]">
        {/* Main Stream View - Scrollable on mobile */}
        <div className="relative min-h-screen lg:h-full overflow-y-auto overflow-x-hidden">
          {client && call && (
            <StreamTheme>
              <StreamVideo client={client}>
                <StreamCall call={call}>
                  <StreamerView 
                    call={call} 
                    chatExpanded={chatExpanded} 
                    setChatExpanded={setChatExpanded}
                    onChatSessionChange={setChatChannelId}
                  />
                </StreamCall>
              </StreamVideo>
            </StreamTheme>
          )}

          {/* Mobile Chat Toggle Button - Bottom right */}
          {!chatExpanded && session?.user && userName && (
            <button
              onClick={() => setChatExpanded(true)}
              className="fixed bottom-6 right-6 lg:hidden bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-110 z-50"
              aria-label="Open chat"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Chat Panel - Desktop only (always visible), Mobile (slide in from right) */}
        {session?.user && userName && (
          <div className={`
            fixed lg:relative top-0 right-0 bottom-0
            w-full max-w-md lg:max-w-none
            bg-gray-900
            z-50 lg:z-auto
            flex flex-col
            border-l border-gray-700
            transform transition-transform duration-300 ease-in-out
            ${chatExpanded ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
              <h2 className="text-white font-semibold text-base lg:text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                Live Chat
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                  Live
                </span>
                {/* Close button - Mobile only */}
                <button
                  onClick={() => setChatExpanded(false)}
                  className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 -mr-2"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Component */}
            <div className="flex-1 overflow-hidden min-h-0">
              {call && !call.state.backstage && chatChannelId ? (
                <MyChat
                  userId={session.user.id}
                  isStreamer={true}
                  userName={session.user.fullName || 'User'}
                  channelId={chatChannelId}
                />
              ) : (
                <div className="h-full bg-gray-900 p-6 text-gray-200">
                  <div className="h-full rounded-xl border border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900 p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-xl font-semibold mb-2">Live chat is waiting</p>
                      <p className="text-sm text-gray-400 mb-6">
                        Go live to open a fresh chat room for this stream.
                      </p>
                      <div className="space-y-3">
                        <div className="rounded-lg bg-gray-800/70 border border-gray-700 px-4 py-3">
                          <p className="text-sm font-medium">Viewer messages appear here</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Keep this panel open to follow audience questions in real time.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3">
                      <p className="text-sm text-blue-300">
                        Tip: Start with camera + mic enabled for faster audience engagement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile when chat is open */}
      {chatExpanded && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setChatExpanded(false)}
        />
      )}
    </section>
  );
};

export default Dashboard;
