'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../button/button';
import { Mail, User } from '../icons';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
} from '@clerk/nextjs';

const TrailingItems = () => {
  return (
    <div className="flex items-center gap-2 h-10">
      {/* Mail icon */}
      <button className="text-black rounded-full hover:bg-slate-200 p-2 cursor-pointer">
        <Mail />
      </button>

      {/* When user is signed out */}
      <SignedOut>
        <SignInButton>
          <Button variant="secondary" size="sm">
            Log In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button variant="primary" size="sm">
            Sign Up
          </Button>
        </SignUpButton>
      </SignedOut>

      {/* When user is signed in */}
      <SignedIn>
        <SignOutButton>
          <Button variant="secondary" size="sm">
            Log Out
          </Button>
        </SignOutButton>
      </SignedIn>

      {/* Profile/User icon */}
      <Link href="/app/dashboard">
        <Button variant="icon" size="sm">
          <User />
        </Button>
      </Link>
    </div>
  );
};

export default TrailingItems;
