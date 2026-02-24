'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Channel,
  Chat,
  MessageList,
} from 'stream-chat-react';
import {
  StreamChat,
  type Channel as StreamChatChannel,
  type DefaultGenerics,
} from 'stream-chat';

import { createTokenProvider } from '@/lib/streamClient';
import 'stream-chat-react/dist/css/v2/index.css';
import CustomMessage from './customMessage';

export default function MyChat({
  userId,
  userName,
  isStreamer,
  channelId, 
}: {
  userId: string;
  userName: string;
  isStreamer: boolean;
  channelId: string;
}) {
  const [client, setClient] = useState<StreamChat<DefaultGenerics> | null>(null);
  const [channel, setChannel] = useState<StreamChatChannel<DefaultGenerics> | null>(null);
  const [customColor, setCustomColor] = useState<string | undefined>();
  const [chatError, setChatError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let initializedClient: StreamChat<DefaultGenerics> | null = null;

    const initializeChatClient = async () => {
      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
      if (!apiKey) {
        console.error('[MyChat] Stream API key is not set');
        setChatError('Chat is unavailable right now.');
        return;
      }
      
      console.log('[MyChat] Initializing with:', { userId, userName });
      setChatError(null);
      setChannel(null);

      const nextClient = new StreamChat(apiKey);
      initializedClient = nextClient;
      try {
        await nextClient.connectUser(
          {
            id: userId,
            name: userName,
          },
          createTokenProvider(userId)
        );
        if (!isCancelled) {
          setClient(nextClient);
        } else {
          await nextClient.disconnectUser();
        }
      } catch (error) {
        console.error('[MyChat] Failed to initialize chat client:', error);
        if (!isCancelled) {
          setChatError('Failed to connect chat. Please refresh.');
        }
      }
    };

    void initializeChatClient();

    return () => {
      isCancelled = true;
      if (initializedClient) {
        void initializedClient.disconnectUser();
      }
    };
  }, [userName, userId]); 

  useEffect(() => {
    const createChannel = async () => {
      if (!client) {
        return;
      }

      if (!channelId || typeof channelId !== 'string') {
        console.error('[MyChat] Invalid channelId:', channelId);
        return;
      }

      try {
        console.log('[MyChat] Creating/joining channel:', channelId);
        setChannel(undefined);
        setChatError(null);

        const chatChannel = client.channel('livestream', channelId, {
          name: `${channelId}'s Stream`,
          created_by_id: userId,
        });

        await chatChannel.watch();
        setCustomColor(createCustomColor());
        setChannel(chatChannel);
      } catch (error) {
        console.error('[MyChat] Error creating/joining channel:', error);
        setChatError('Failed to join live chat. Please refresh.');
      }
    };

    void createChannel();
  }, [client, channelId, userId]);

  const sendMessage = useCallback(async () => {
    const text = messageText.trim();
    if (!channel || !text || isSending) return;

    setIsSending(true);
    try {
      await channel.sendMessage({
        text,
        user_id: userId,
        color: customColor,
        isStreamer: isStreamer,
      });
      setMessageText('');
    } catch (error) {
      console.error('[MyChat] Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [channel, messageText, isSending, userId, customColor, isStreamer]);

  if (chatError) return <div className='p-4'>{chatError}</div>;
  if (!client || !channel) return <div className='p-4'>Setting up client & connection...</div>;

  return (
    <div className='live-chat-root h-full min-h-0'>
      <Chat client={client}>
        <Channel channel={channel} Message={CustomMessage}>
          <div className='relative h-full min-h-0 overflow-hidden'>
            <div className='absolute inset-0 pb-16 overflow-hidden'>
              <MessageList />
            </div>
            <form
              className='absolute left-0 right-0 bottom-0 border-t border-gray-700 bg-gray-900 p-2 flex gap-2'
              onSubmit={async (e) => {
                e.preventDefault();
                await sendMessage();
              }}
            >
              <input
                type='text'
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder='Type a message...'
                className='flex-1 rounded-md bg-gray-800 text-white px-3 py-2 outline-none border border-gray-700 focus:border-blue-500'
              />
              <button
                type='submit'
                disabled={!messageText.trim() || isSending}
                className='px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50'
              >
                Send
              </button>
            </form>
          </div>
        </Channel>
      </Chat>
    </div>
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
