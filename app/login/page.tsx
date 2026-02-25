"use client";
import { SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { redirect, useSearchParams } from 'next/navigation';
import React from 'react'
import { Button } from '../components/button/button';
import logo from '@/app/golivehub-purple.svg';
const Page = () => {
  const {isSignedIn} = useUser();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if(isSignedIn){
    redirect('/app');
  }
  return (
    <section className = 'flex h-screen w-screen items-center justify-center'>
      <div className = 'flex flex-col items-center space-y-6'>
        <Image src = {logo} alt = 'logo' width = {200} height = {200} />
        <h1 className = 'text-2xl font-bold'>Before accessing out app...</h1>
        {reason === 'session_replaced' && (
          <p className='rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800'>
            You were logged out because your account was active in another session.
          </p>
        )}
        <div className = 'flex items-center gap-8'>
          <SignedOut>
            <SignInButton forceRedirectUrl="/app">
              <Button variant = {'secondary'}>Log In</Button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/app">
              <Button variant = {'primary'}>Sign Up</Button>
              </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </section>
  )
}

export default Page
