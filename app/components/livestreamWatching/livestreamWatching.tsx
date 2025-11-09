'use client';

import {
  LivestreamLayout,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

export default function LivestreamWatching() {
  const call = useCall();
  const { useIsCallLive } = useCallStateHooks();
  const isLive = useIsCallLive();

  return (
    <div className='w-full h-full'>
      {isLive && call?.id && (
        <LivestreamLayout
          muted={false}
          enableFullScreen={true}
          showLiveBadge={false}
          showDuration={true}
          showSpeakerName={false}
          showParticipantCount={true}
          floatingParticipantProps={{
            muted: false,
            enableFullScreen: true,
            showParticipantCount: false,
            showDuration: false,
            showLiveBadge: false,
            showSpeakerName: false,
            position: 'bottom-right',
          }}
        />
      )}
    </div>
  );
}