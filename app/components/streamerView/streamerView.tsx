import { Call } from '@stream-io/video-client'
import { ParticipantView, useCallStateHooks, useDeviceList } from '@stream-io/video-react-sdk';
import React, { useEffect, useState } from 'react'
import {useSession} from '@clerk/nextjs';
import { useDatabase } from '@/contexts/databaseContext';
import { User } from '../icons';
import { Button } from '../button/button';
import GoLiveForm from './goLiveForm';

const StreamerView = ({
  call,
  chatExpanded,
  setChatExpanded,
}: {
  call: Call;
  chatExpanded: boolean;
  setChatExpanded: (expanded: boolean) => void;
}) => {


    const {
        useCameraState,
        useMicrophoneState,
        useScreenShareState,
        useParticipantCount,
        useIsCallLive,
        useParticipants,
    } = useCallStateHooks();

    const {
        camera,
        isEnabled: isCamEnabled,
        devices,
        selectedDevice
    } = useCameraState();
    const [showGoLiveForm, setShowGoLiveForm] = useState(false);
    const [currentUserName, setCurrentUserName] = useState<string | null>(null);
    const {session} = useSession();
    const {getUserData, deleteLivestream} = useDatabase();
    const {microphone, isEnabled: isMicEnabled} = useMicrophoneState();
    const {screenShare, isEnabled: isScreenShareEnabled} = useScreenShareState();

    const participantCount = useParticipantCount();
    const isLive = useIsCallLive();

    const [firstParticipant] = useParticipants();
    const {deviceList, selectedDeviceInfo} = useDeviceList(
        devices,
        selectedDevice
    );

    console.log('Camera enabled');

    useEffect(() => {
        const getCurrentUser = async () => {
            const userId = session?.user.id;
            if(userId) {
                const userData = await getUserData(userId);
                if(userData){
                    setCurrentUserName(userData.user_name);
                }
            }
        }
        getCurrentUser();
    }, [session?.user.id, getUserData]);

  return (
    <div className = 'flex flex-col gap-2 relative'>
<div
  className={`relative flex items-center justify-center max-h-[500px] overflow-hidden border-b-4 ${
    isLive ? 'border-golivehub-purple' : 'border-slate-200'
  }`}
>
    <>
        {firstParticipant ? (
            <>
                <ParticipantView
                    className = 'h-full'
                    trackType = {
                        isScreenShareEnabled ? 'screenShareTrack' : 'videoTrack'
                    }
                    VideoPlaceholder={() => (
                        <div className = 'h-[500px] aspect-video bg-slate-200' />
                    )}
                    participant = {firstParticipant}
                />
                {isScreenShareEnabled && isCamEnabled && (
                    <ParticipantView
                        className = 'aspect-video h-32 absolute bottom-4 right-4 rounded-lg overflow-hidden'
                        trackType = 'videoTrack'
                        VideoPlaceholder={() => (
                            <div className = 'h-[500px] aspect-video bg-slage-200' />
                        )}
                        participant = {firstParticipant}
                    />
                )}
            </>
        ) : (
            <div>The host has&apos;t joined yet</div>
        )}
    </>
</div>
<div className = 'flex gap-4 p-6'>
    <div className = 'flex items-center'>
        <User />
        <span>{participantCount}</span>
    </div>
    <Button variant='primary' onClick = {async () => {
        if(isLive) {
            call.stopLive();
            if(currentUserName){
                try{
                    const success = await deleteLivestream(currentUserName);
                    if(success) { 
                        console.log('Livestream removed from database');
                    }else{
                        console.log('Failed to remove livestream from database');
                    }
                }catch(error){
                    console.log(`Error removing livestream from database`, error);
                }
            }else{
                console.log('No current username found, cannot remove livestream from database');
            }
        }else{
            setShowGoLiveForm(true);
        }
    }}>
        {isLive ? 'Stop Live' : 'Go Live'}
    </Button>
     <Button variant='secondary' onClick = {async () => camera.toggle()}>
        {isCamEnabled ? 'Disable Camera' : 'Enable camera'}
    </Button>
    <Button variant = 'secondary' onClick = {() => microphone.toggle()}>
        {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
    </Button>
</div>
      <section className = 'p-6 space-y-2'>
        <h2 className = 'text-xl font-semibold'>What do you want to share?</h2>
        <p className = 'text-sm text-secondary'>You can share your camera, or both</p>
        <div className = 'flex gap-2'>
            <Button
                className = {`border-2 ${
                    isCamEnabled && !isScreenShareEnabled ? 'border-golivehub-purple' : 'border-transparent'
                }`}
                onClick = {async () => {
                    await camera.enable();
                    await screenShare.disable();
                }}
                variant = 'secondary'
                >
                    Camera only
                </Button>
                <Button 
                    className = {`border-2
                    ${!isCamEnabled && isScreenShareEnabled ? 'border-golivehub-purple' : 'border-transparent'}     
                    `}
                    onClick = {async () => {
                        await screenShare.enable();
                        await camera.disable();
                    }}
                    variant = 'secondary'
                    >
                        Screen Only
                    </Button>
                    <Button 
                    className = {`border-2
                    ${isCamEnabled && isScreenShareEnabled ? 'border-golivehub-purple' : 'border-transparent'}     
                    `}
                     onClick = {async () => {
                        await camera.enable();
                        await screenShare.enable();
                    }}
                    variant = 'secondary'
                    >
                        Screen + Camera
                    </Button>
        </div>
      </section>

      <div className = 'flex flex-col gap-2 p-6'>
        <h2 className = 'text-lg font-semibold'>Select camera</h2>
        <div className ='flex gap-2'>
            {deviceList.map((device, index) => (
                 <Button 
                    className = {`border-2
                    ${selectedDeviceInfo?.deviceId === device.deviceId ? 'border-golivehub-purple' : 'border-transparent'}     
                    `}
                    key = {`${device.deviceId}-${index}`}
                     onClick = {async () => {
                        await camera.select(device.deviceId);
                    }}
                    variant = 'secondary'
                    >
                        {device.label}
                    </Button>
            ))}
        </div>
      </div>
      {showGoLiveForm && (
        <GoLiveForm
            onGolive={() => {
                setShowGoLiveForm(false);
                call.goLive();
            }}
            onCancel={() => setShowGoLiveForm(false)}
            />
      )}
    </div>
  )
}

export default StreamerView;