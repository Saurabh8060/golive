import React from 'react'
import { useMessageContext } from 'stream-chat-react';

const CusTomMessage = () => {
    const {message} = useMessageContext();
  return (
    <p data-message-id = {message.id} className = 'flex items-start text-sm'>
        <span className = 'text-sm text-gray-500 mr-2'>
            {message.created_at.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
            })}
        </span>
        {message.isStreamer && (
            <span className = 'text-xs mr-1 bg-golivehub-purple p-0.5 rounded-full size-4 text-white text-center'>
                S
            </span>
        )}
        <span
            className = 'text-sm text-golivehub-purple font-bold'
            style = {{color: message.color}}
            >
                {message?.user?.name}
            </span>
            : <span className = 'text-sm text-gray-500 ml-2'>{message.text}</span>
    </p>
  )
}

export default CusTomMessage;
