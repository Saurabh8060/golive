'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { createStreamUser } from '../actions';

export type UserObject = {
    userId: string;
    email: string;
    imageUrl?: string;
    fullName?: string;
};

const CreateStreamUser = () => {

    const [creationOngoing, setCreationOngoing] = useState(true);
    const {user} = useUser();

    useEffect(() => {
        const createStreamUserOnServer = async () => {
            if(!user?.id){
                console.log('[createStreamUser] no user id found');
            }

            if(!user?.primaryEmailAddress?.emailAddress){
                console.log('[createStreamUser] No email address found.');
                return;
            }

            const userObject: UserObject = {
                userId: user.id,
                email: user?.primaryEmailAddress?.emailAddress,
                imageUrl: user?.imageUrl,
                fullName: user?.fullName ?? undefined,
            };
            await createStreamUser(userObject);
            setCreationOngoing(false);
        };
        createStreamUserOnServer();
    }, [user]);

    if(creationOngoing){
    return (
    <div className = 'w-full h-full flex items-center justify-center'>
        <h1>Creating a new user....</h1>
    </div>
  )
    }
    redirect('/app');
}

export default CreateStreamUser
