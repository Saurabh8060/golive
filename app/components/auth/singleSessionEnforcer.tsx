'use client';

import { useSession, useUser } from '@clerk/nextjs';
import { useClerk } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function SingleSessionEnforcer() {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { signOut } = useClerk();
  const signingOutRef = useRef(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!isUserLoaded || !isSessionLoaded || !isSignedIn || !user || !session) {
      return;
    }

    const enforceSingleSession = async () => {
      if (inFlightRef.current || signingOutRef.current) {
        return;
      }
      if (document.body.dataset.skipSessionEnforcer === 'true') {
        return;
      }

      inFlightRef.current = true;
      try {
        // Always refresh client-side session/user state before checking.
        await Promise.allSettled([user.reload(), session.reload?.()]);

        const sessions = await user.getSessions();
        const activeSessions = sessions.filter(
          (existingSession) =>
            existingSession.status === 'active' ||
            existingSession.status === 'pending'
        );

        if (activeSessions.length === 0) {
          return;
        }

        const sessionTimestamp = (value?: Date | null) =>
          value ? new Date(value).getTime() : 0;

        // Most recently active session is the only allowed one.
        const newestSession = [...activeSessions].sort(
          (a, b) => sessionTimestamp(b.lastActiveAt) - sessionTimestamp(a.lastActiveAt)
        )[0];

        if (newestSession.id !== session.id) {
          if (!signingOutRef.current) {
            signingOutRef.current = true;
            await signOut({ redirectUrl: '/login?reason=session_replaced' });
          }
          return;
        }

        const currentSession = sessions.find(
          (existingSession) => existingSession.id === session.id
        );
        const isCurrentSessionValid =
          currentSession &&
          (currentSession.status === 'active' ||
            currentSession.status === 'pending');

        if (!isCurrentSessionValid) {
          if (!signingOutRef.current) {
            signingOutRef.current = true;
            await signOut({ redirectUrl: '/login?reason=session_replaced' });
          }
          return;
        }

        const otherActiveSessions = sessions.filter(
          (existingSession) =>
            existingSession.id !== newestSession.id &&
            (existingSession.status === 'active' ||
              existingSession.status === 'pending')
        );

        await Promise.allSettled(
          otherActiveSessions.map((existingSession) => existingSession.revoke())
        );
      } catch (error) {
        console.error('[SingleSessionEnforcer] Failed to enforce policy', error);
      } finally {
        inFlightRef.current = false;
      }
    };

    void enforceSingleSession();
    const eventHandler = () => {
      void enforceSingleSession();
    };

    window.addEventListener('focus', eventHandler);
    window.addEventListener('popstate', eventHandler);
    window.addEventListener('hashchange', eventHandler);
    window.addEventListener('pageshow', eventHandler);
    document.addEventListener('visibilitychange', eventHandler);
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void enforceSingleSession();
      }
    }, 5000);

    return () => {
      window.removeEventListener('focus', eventHandler);
      window.removeEventListener('popstate', eventHandler);
      window.removeEventListener('hashchange', eventHandler);
      window.removeEventListener('pageshow', eventHandler);
      document.removeEventListener('visibilitychange', eventHandler);
      window.clearInterval(intervalId);
    };
  }, [isSessionLoaded, isSignedIn, isUserLoaded, session, signOut, user]);

  return null;
}
