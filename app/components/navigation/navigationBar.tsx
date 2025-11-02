import { SignedIn, SignedOut, SignIn, SignInButton, SignOutButton } from '@clerk/nextjs'
import React from 'react'

const NavigationBar = () => {
  return (
    <header>
        <nav className = 'w-full flex text-black items-center justify-between bg-white p-2 border-b border-slate-300'>
            <SignedOut>
                <SignInButton>
                </SignInButton>
            </SignedOut>
             <SignedIn>
                <SignOutButton />
             </SignedIn>
        </nav>
    </header>
  )
}

export default NavigationBar
