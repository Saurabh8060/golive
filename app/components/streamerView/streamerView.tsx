'use client';

import { useDatabase } from '@/contexts/databaseContext';
import {
  Call,
  useCallStateHooks,
  useDeviceList,
  ParticipantView,
} from '@stream-io/video-react-sdk';
import { Button } from '../button/button';
import { ArrowRight, User } from '../icons';
import { useState, useEffect } from 'react';
import GoLiveForm from './goLiveForm';
import { useSession } from '@clerk/nextjs';

export default function StreamerView({
  call,
  chatExpanded,
  setChatExpanded,
}: {
  call: Call;
  chatExpanded: boolean;
  setChatExpanded: (expanded: boolean) => void;
}) {
  const [showGoLiveForm, setShowGoLiveForm] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const { session } = useSession();
  const { getUserData, deleteLivestream } = useDatabase();

  const {
    useCameraState,
    useMicrophoneState,
    useScreenShareState,
    useParticipantCount,
    useIsCallLive,
    useParticipants,
    useLocalParticipant,
  } = useCallStateHooks();

  const { camera, isEnabled: isCamEnabled, devices, selectedDevice } =
    useCameraState();
  const { microphone, isEnabled: isMicEnabled } = useMicrophoneState();
  const { screenShare, isEnabled: isScreenShareEnabled } =
    useScreenShareState();

  const participantCount = useParticipantCount();
  const isLive = useIsCallLive();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const { deviceList, selectedDeviceInfo } = useDeviceList(
    devices,
    selectedDevice
  );

  // Fetch current user info from DB
  useEffect(() => {
    const getCurrentUser = async () => {
      const userId = session?.user.id;
      if (userId) {
        const userData = await getUserData(userId);
        if (userData) setCurrentUserName(userData.user_id);
      }
    };
    getCurrentUser();
  }, [session?.user.id, getUserData]);

  // ✅ Enable camera only once on load
  useEffect(() => {
    const initCameraOnce = async () => {
      try {
        if (!isCamEnabled) {
          await camera.enable();
        }
      } catch (error) {
        console.error('Failed to enable camera on load:', error);
      }
    };

    initCameraOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Disable camera and mic on page unload if not live
  useEffect(() => {
    const handleUnload = async () => {
      if (!isLive) {
        if (isCamEnabled) await camera.disable();
        if (isMicEnabled) await microphone.disable();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [isLive, isCamEnabled, isMicEnabled, camera, microphone]);

  return (
    <div className='flex flex-col gap-2 w-full min-h-full pb-32 overflow-y-auto max-h-screen'>
      {/* Host video area - Responsive with proper aspect ratio */}
      <div
        className={`relative flex items-center justify-center overflow-hidden border-b-4 flex-shrink-0 ${
          isLive ? 'border-twitch-purple' : 'border-slate-200'
        }`}
      >
        {localParticipant ? (
          <div className='relative w-full aspect-video'>
            <ParticipantView
              participant={localParticipant}
              trackType={isScreenShareEnabled ? 'screenShareTrack' : 'videoTrack'}
              className='absolute inset-0 w-full h-full rounded-md overflow-hidden bg-slate-200'
              VideoPlaceholder={() => (
                <div className='w-full h-full bg-slate-200 flex items-center justify-center text-gray-400'>
                  {isCamEnabled ? 'Camera enabled — waiting for others' : 'Camera off'}
                </div>
              )}
            />
            <span className='absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded z-10'>
              You (Host)
            </span>

            {/* Picture-in-picture for screen share + camera */}
            {isScreenShareEnabled && isCamEnabled && (
              <ParticipantView
                participant={localParticipant}
                trackType='videoTrack'
                className='aspect-video w-32 md:w-40 lg:w-48 absolute bottom-4 right-4 rounded-lg overflow-hidden border-2 border-white shadow-lg z-10'
                VideoPlaceholder={() => (
                  <div className='w-full h-full bg-slate-300' />
                )}
              />
            )}
          </div>
        ) : (
          <div className='w-full aspect-video flex items-center justify-center bg-slate-200'>
            Initializing camera...
          </div>
        )}
      </div>

      {/* Controls - Responsive */}
      <div className='flex flex-wrap gap-3 p-4 md:p-6 flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <User />
          <span>{participantCount}</span>
        </div>

        <Button 
          variant='primary'
          onClick={async () => {
            if (isLive) {
              call.stopLive();

              if (currentUserName) {
                try {
                  const success = await deleteLivestream(currentUserName);
                  if (success)
                    console.log('Livestream removed from database');
                  else console.error('Failed to remove livestream from database');
                } catch (error) {
                  console.error('Error removing livestream:', error);
                }
              } else {
                console.warn('No username found to remove livestream');
              }
            } else {
              setShowGoLiveForm(true);
            }
          }}
        >
          {isLive ? 'Stop Live' : 'Go Live'}
        </Button>

        <Button 
          variant='secondary' 
          onClick={() => camera.toggle()}
        >
          {isCamEnabled ? 'Disable camera' : 'Enable camera'}
        </Button>

        <Button 
          variant='secondary' 
          onClick={() => microphone.toggle()}
        >
          {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
        </Button>
      </div>

      {/* Share options - Responsive */}
      <section className='p-4 md:p-6 space-y-2 flex-shrink-0'>
        <h2 className='text-xl font-semibold'>What do you want to share?</h2>
        <p className='text-sm text-secondary'>
          You can share your camera, screen, or both.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
          <Button
            className={`border-2 ${
              isCamEnabled && !isScreenShareEnabled
                ? 'border-twitch-purple'
                : 'border-transparent'
            }`}
            onClick={async () => {
              await camera.enable();
              await screenShare.disable();
            }}
            variant='secondary'
          >
            Camera only
          </Button>

          <Button
            className={`border-2 ${
              !isCamEnabled && isScreenShareEnabled
                ? 'border-twitch-purple'
                : 'border-transparent'
            }`}
            onClick={async () => {
              await screenShare.enable();
              await camera.disable();
            }}
            variant='secondary'
          >
            Screen only
          </Button>

          <Button
            className={`border-2 ${
              isCamEnabled && isScreenShareEnabled
                ? 'border-twitch-purple'
                : 'border-transparent'
            }`}
            onClick={async () => {
              await camera.enable();
              await screenShare.enable();
            }}
            variant='secondary'
          >
            Screen + Camera
          </Button>
        </div>
      </section>

      {/* Device selection - Responsive */}
      <div className='flex flex-col gap-2 p-4 md:p-6 mb-4 flex-shrink-0'>
        <h2 className='text-lg font-semibold'>Select camera</h2>
        <div className='flex gap-2 flex-wrap'>
          {deviceList.map((device, index) => (
            <Button
              className={`border-2 ${
                selectedDeviceInfo?.deviceId === device.deviceId
                  ? 'border-golivehub-purple'
                  : 'border-transparent'
              }`}
              variant='secondary'
              key={`${device.deviceId}-${index}`}
              onClick={async () => {
                await camera.select(device.deviceId);
              }}
            >
              {device.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Go Live form modal */}
      {showGoLiveForm && (
        <GoLiveForm
          call={call}  
          onGoLive={() => {
            setShowGoLiveForm(false);
          }}
          onCancel={() => setShowGoLiveForm(false)}
        />
      )}
    </div>
  );
}