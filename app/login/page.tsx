"use client";
import { SignedOut, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import React from 'react'
import { Button } from '../components/button/button';
import logo from '@/app/golivehub-purple.svg';
const page = () => {
  const {isSignedIn} = useUser();

  if(isSignedIn){
    redirect('/app');
  }
  return (
    <section className = 'flex h-screen w-screen items-center justify-center'>
      <div className = 'flex flex-col items-center space-y-6'>
        <Image src = {logo} alt = 'logo' width = {200} height = {200} />
        <h1 className = 'text-2xl font-bold'>Before accessing out app...</h1>
        <div className = 'flex items-center gap-8'>
          <SignedOut>
            <SignInButton>
              <Button variant = {'secondary'}>Log In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant = {'primary'}>Sign Up</Button>
              </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </section>
  )
}

export default page
