'use client';

import { useSession, useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';

type DebugState = {
  step: string;
  details: string;
};

export default function DebugAuthPage() {
  const { isLoaded: isSessionLoaded, session } = useSession();
  const { isLoaded: isUserLoaded, user } = useUser();
  const [states, setStates] = useState<DebugState[]>([]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const canRun = useMemo(
    () => isSessionLoaded && isUserLoaded && Boolean(session),
    [isSessionLoaded, isUserLoaded, session]
  );

  useEffect(() => {
    if (!canRun || !session) return;

    let cancelled = false;
    const push = (step: string, details: string) => {
      if (cancelled) return;
      setStates((prev) => [...prev, { step, details }]);
    };

    const run = async () => {
      setStates([]);
      push('User', `id=${user?.id ?? 'missing'}`);
      push(
        'Env',
        `url=${supabaseUrl ? 'present' : 'missing'} anonKey=${supabaseAnonKey ? 'present' : 'missing'}`
      );

      let token: string | null = null;
      try {
        token = await session.getToken({ template: 'supabase' });
        push('Clerk token', token ? `ok length=${token.length}` : 'empty token');
      } catch (error) {
        push(
          'Clerk token',
          `ERROR: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      if (!supabaseUrl || !supabaseAnonKey) {
        push('Supabase fetch', 'skipped: missing env');
        return;
      }

      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseAnonKey,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const text = await res.text();
        push('Supabase fetch', `status=${res.status} body=${text.slice(0, 250)}`);
      } catch (error) {
        push(
          'Supabase fetch',
          `ERROR: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [canRun, session, supabaseAnonKey, supabaseUrl, user?.id]);

  return (
    <main className="min-h-screen bg-white p-4 text-black">
      <h1 className="text-lg font-semibold">Auth Diagnostics</h1>
      <p className="mt-1 text-sm text-gray-600">
        Open this page on the failing device and share the results.
      </p>
      <div className="mt-4 space-y-2">
        {states.map((item, index) => (
          <div key={`${item.step}-${index}`} className="rounded border p-2 text-sm">
            <div className="font-semibold">{item.step}</div>
            <div className="break-all">{item.details}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
