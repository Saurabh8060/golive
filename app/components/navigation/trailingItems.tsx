'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../button/button';
import { User } from '../icons';

const TrailingItems = () => {
  const handleSignOut = async () => {
    const clerk = (window as unknown as { Clerk?: { loaded?: boolean; signOut?: (opts?: { redirectUrl?: string }) => Promise<void> } }).Clerk;
    if (clerk?.loaded && clerk.signOut) {
      await clerk.signOut({ redirectUrl: '/login' });
      return;
    }
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center gap-2 h-10">
      <Link href="/login">
        <Button variant="secondary" size="sm">
          Log In
        </Button>
      </Link>
      <Button variant="secondary" size="sm" onClick={handleSignOut}>
        Log Out
      </Button>
      <Link href="/app/dashboard">
        <Button variant="icon" size="sm">
          <User /> Go live
        </Button>
      </Link>
    </div>
  );
};

export default TrailingItems;
