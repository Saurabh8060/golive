'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Channel,
  Chat,
  MessageInput,
  MessageInputProps,
  MessageList,
  Window,
} from 'stream-chat-react';
import CustomChannelHeader from './customChannelHeader';

import { createTokenProvider } from '@/lib/streamClient';
import 'stream-chat-react/dist/css/v2/index.css';
import CustomMessage from './customMessage';

export default function MyChat({
  userId,
  userName,
  isStreamer,
  setChatExpanded,
  channelId, 
}: {
  userId: string;
  userName: string;
  isStreamer: boolean;
  setChatExpanded?: (expanded: boolean) => void;
  channelId: string;
}) {
  const [client, setClient] = useState<any>();
  const [channel, setChannel] = useState<any>();
  const [customColor, setCustomColor] = useState<string | undefined>();

  useEffect(() => {
    const initializeChatClient = async () => {
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        console.error('[MyChat] Stream API key is not set');
        return;
      }
      
      console.log('[MyChat] Initializing with:', { userId, userName, channelId });
      
      // Dynamic import to avoid TypeScript issues
      const streamChatModule = await import('stream-chat');
      const StreamChat = (streamChatModule as any).StreamChat || streamChatModule;
      
      const client = new StreamChat(apiKey);
      await client.connectUser(
        {
          id: userId,
          name: userName,
        },
        createTokenProvider(userId)
      );
      setClient(client);
    };

    const createChannel = async () => {
      if (!client) {
        return;
      }
      
      // Validate channelId
      if (!channelId || typeof channelId !== 'string') {
        console.error('[MyChat] Invalid channelId:', channelId);
        return;
      }
      
      try {
        console.log('[MyChat] Creating/joining channel:', channelId);
        
        const chatChannel = client.channel('livestream', channelId, {
          name: `${channelId}'s Stream`,
          created_by_id: userId, 
        });
        
        // Get or create the channel
        await chatChannel.create();
        
        console.log('[MyChat] Successfully joined channel:', channelId);
        
        setCustomColor(createCustomColor());
        setChannel(chatChannel);
      } catch (error) {
        console.error('[MyChat] Error creating/joining channel:', error);
      }
    };

    if (!client) {
      console.log('[MyChat] Client is not set');
      initializeChatClient();
      return;
    }
    if (!channel) {
      createChannel();
    }
  }, [client, userName, userId, channel, channelId]); 

  const submitHandler: MessageInputProps['overrideSubmitHandler'] = useCallback(
    async (params: any) => {
      await channel?.sendMessage(
        {
          text: params.localMessage.text,
          user_id: params.localMessage.user_id,
          color: customColor,
          isStreamer: isStreamer,
        },
        params.sendOptions
      );
    },
    [channel, customColor, isStreamer]
  );

  if (!client || !channel) return <div>Setting up client & connection...</div>;

  return (
    <Chat client={client}>
      <Channel channel={channel} Message={CustomMessage}>
        <Window>
          <CustomChannelHeader setChatExpanded={setChatExpanded} />
          <MessageList />
          <MessageInput overrideSubmitHandler={submitHandler} />
        </Window>
      </Channel>
    </Chat>
  );
}

function createCustomColor(): string {
  const colors = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'pink',
    'brown',
    'gray',
    'black',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}