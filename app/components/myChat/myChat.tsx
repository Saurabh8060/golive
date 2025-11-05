'use client';
import type {LocalMessage, Message, SendMessageOptions, Channel as StreamChannel} from 'stream-chat';
import {StreamChat} from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';
import {
    Channel,
    Chat,
    MessageInput,
    MessageInputProps,
    MessageList,
    Window,
} from 'stream-chat-react';

import React, { useState, useEffect, useCallback } from 'react';
import  {createTokenProvider} from '@/lib/streamClient';
import CustomChannelHeader from './customChannelHeader';
import CusTomMessage from './customMessage';

const MyChat = ({
    userId,
    userName,
    setChatExpanded,
    isStreamer
} : {
    userId: string,
    userName: string,
    setChatExpanded?: (expanded: boolean) => void;
    isStreamer: boolean;
}) => {
    const [client, setClient] = useState<StreamChat | undefined>();
    const [channel, setChannel] = useState<StreamChannel | undefined>();
    const [customColor, setCustomColor] = useState<string | undefined>();
    useEffect(() => {
        const initializeChatClient = async () => {
            const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
            if(!apiKey) {
                console.log('[MyChat] stream api key is not set');
                return;
            }
            const client = new StreamChat(apiKey);
            await client.connectUser({
                id: userId,
                name: userName
            },
        createTokenProvider(userId));
        setClient(client);
        };

        const createChannel = async () => {
            if(!client){
                return;
            }
            const chatChannel = client.channel('livestream', userName);
            await chatChannel.create();
            await chatChannel.addMembers([userId], {
                text: `${userName} joined the stream`,
                user_id: userId,
            });
            setChannel(chatChannel);
            setCustomColor(createCustomColor());
        };

        if(!client){
            console.log('[MyChat] Client is not set');
            initializeChatClient();
            return;
        };

        if(!channel){
            createChannel();
        }
    }, [client, userName, userId, channel]);

    const submitHandler: MessageInputProps['overrideSubmitHandler'] = useCallback(
        async (params: {
            cid: string;
            localMessage: LocalMessage;
            message: Message;
            sendOptions: SendMessageOptions;
        }) => {
            await channel?.sendMessage({
            text: params.localMessage.text,
            user_id: params.localMessage.user_id,
            color: customColor,
            isStreamer: isStreamer
        },
            params.sendOptions)
        }, [channel, customColor, isStreamer]);

    if(!client || !channel) return <div>Setting up client & connection...</div>
  return (
    <Chat client = {client}>
        <Channel channel = {channel} Message={CusTomMessage}>
            <Window>
                <CustomChannelHeader setChatExpanded={setChatExpanded} />
                <MessageList />
                <MessageInput overrideSubmitHandler={submitHandler}/>
            </Window>
        </Channel>
    </Chat>
  )
}


function createCustomColor(): string{
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
        'black'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
export default MyChat
