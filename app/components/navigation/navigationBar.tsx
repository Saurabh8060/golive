import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

import golivehubPurple from '@/app/golivehub-purple.svg';
import SearchBar from './searchBar';
import TrailingItems from './trailingItems';

export default async function NavigationBar() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const browseHref = isSignedIn ? '/app' : '/';

  return (
    <header className='relative z-[60]'>
      <nav className='w-full flex flex-col sm:flex-row text-black items-center justify-between bg-white p-2 border-b border-slate-300 gap-2'>
        <div className='flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start'>
          <div className='flex items-center gap-1'>
            <Link href={browseHref}>
              <Image src={golivehubPurple} alt='logo' width={32} height={32} />
            </Link>
            <Link href={browseHref} className='text-black font-bold'>
              Browse
            </Link>
          </div>
          <div className='sm:hidden'>
            <TrailingItems isSignedIn={isSignedIn} />
          </div>
        </div>
        {isSignedIn && (
          <div className='w-full sm:flex-1 sm:max-w-md md:max-w-lg'>
            <SearchBar />
          </div>
        )}
        <div className='hidden sm:block'>
          <TrailingItems isSignedIn={isSignedIn} />
        </div>
      </nav>
    </header>
  );
}
