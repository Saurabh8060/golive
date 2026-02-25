'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../button/button';
import { SignInButton } from '@clerk/nextjs';
import { User } from '../icons';

const TrailingItems = ({ isSignedIn }: { isSignedIn: boolean }) => {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.body.dataset.onboardingVisible === 'true';
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ visible?: boolean }>;
      setIsOnboardingVisible(Boolean(customEvent.detail?.visible));
    };

    window.addEventListener('onboarding-visibility-changed', handler);
    return () => {
      window.removeEventListener('onboarding-visibility-changed', handler);
    };
  }, []);

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
      {!isSignedIn ? (
        <SignInButton forceRedirectUrl="/app">
          <Button variant="secondary" size="sm">
            Log In
          </Button>
        </SignInButton>
      ) : (
        <>
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            Log Out
          </Button>
          {!isOnboardingVisible && (
            <Link href="/app/dashboard">
              <Button variant="icon" size="sm">
                <User /> Go live
              </Button>
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default TrailingItems;
