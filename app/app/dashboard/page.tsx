"use client";
import React, { useEffect } from "react";
import {
  StreamVideoClient,
  Call,
  StreamTheme,
  StreamVideo,
  StreamCall,
  User,
} from "@stream-io/video-react-sdk";
import { useState } from "react";
import StreamerView from "@/app/components/streamerView/streamerView";
import { useSession } from "@clerk/nextjs";
import { useDatabase } from "@/contexts/databaseContext";
import { createToken } from "@/app/actions";
import { getClient } from "@/lib/streamClient";
import MyChat from "@/app/components/myChat/myChat";
const Dashboard = () => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const { session } = useSession();
  const { supabase, getUserData, setSupabaseClient } = useDatabase();
  const [chatExpanded, setChatExpanded] = useState(false);

  useEffect(() => {
    const enterCall = async () => {
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        throw new Error("NEXT_PUBLIC_STREAM_API_KEY is not set");
      }
      const userId = session?.user.id;

      if (!userId) {
        return;
      }

      if (!supabase) {
        const token = await session?.getToken();
        if (token) {
          console.log(
            "[Dashboard] Setting supabase client with token: ",
            token
          );
          setSupabaseClient(token);
          return;
        }
      }
      if (client && call) {
        return;
      }
      const userData = await getUserData(userId);
      if (!userData) {
        throw new Error("User Data not found");
      }
      const callId = userData.user_name.toLowerCase();
      const token = await createToken(userId);
      const user: User = {
        id: userId,
        name: userData.user_name,
      };

      const streamClient = getClient({
        apiKey: apiKey,
        user: user,
        userToken: token,
      });

      const streamCall = streamClient.call("livestream", callId);
      await streamCall.join({ create: true });
      await streamCall.goLive(); 
      setClient(streamClient);
      setCall(streamCall);

      setUserName(userData.user_name);
    };
    enterCall();
  }, [session, getUserData, supabase, setSupabaseClient, client, call]);
  return (
  <section className={`grid ${chatExpanded ? 'grid-cols-2' : 'grid-cols-1'}`}>

      {client && call && (
        <StreamTheme>
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <StreamerView call={call} chatExpanded = {chatExpanded} setChatExpanded={setChatExpanded}/>
            </StreamCall>
          </StreamVideo>
        </StreamTheme>
      )}

      {chatExpanded && session?.user && userName && (
        <div className = 'w-full h-full max-h-[700px]'>
          <MyChat
            userId = {session?.user.id}
            isStreamer={true}
            userName = {userName}
            setChatExpanded={setChatExpanded}
             />
        </div>
      )}
    </section>
  );
};

export default Dashboard;
