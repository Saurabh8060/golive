'use client'

import React, { useState } from 'react';
import { useDatabase } from '@/contexts/databaseContext';
import {useSession} from '@clerk/nextjs';
import { SignedInSessionResource } from '@clerk/types';
import { useEffect } from 'react';
import Onboarding from '../components/onboarding/onboarding';

const AppPage = () => {
    const {session} = useSession();
    const {supabase, setSupabaseClient, getUserData} = useDatabase();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showSelectInterests, setShowSelectInterests] = useState(false);

    
useEffect(() => {
    async function initializeSupabase(session: SignedInSessionResource) { 
        const token = await session?.getToken() as string;
        if(token){
            setSupabaseClient(token);
        }
    }
    
    if(session && !supabase){
        initializeSupabase(session);
    } else {
        console.log('No clerk session');
    }
}, [session, setSupabaseClient, supabase]);

useEffect(() => {
    console.log('Supabase initialized:', !!supabase);
    console.log('Session user ID:', session?.user.id);
    
    if(supabase && session?.user.id){
        getUserData(session.user.id).then((user) => {
            if(user){
                console.log('User data:', user);
                if(user.interests.length === 0){
                    setShowOnboarding(false);
                    setShowSelectInterests(true);
                }else{
                    setShowOnboarding(false);
                    setShowSelectInterests(false);
                }
            }else{
                setShowOnboarding(true);
            }
        });
    }
}, [supabase, session?.user.id, getUserData]);

if(showOnboarding){
    return <Onboarding />
}

  return (
    <section className = 'flex items-center justify-center'>
        <h1>App is running</h1>
    </section>
  )
}

export default AppPage;
