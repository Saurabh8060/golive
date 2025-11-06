import Image from 'next/image';
import Link from 'next/link';

import golivehubPurple from '@/app/golivehub-purple.svg';
import { EllipsisVertical } from '../icons';
import SearchBar from './searchBar';
import TrailingItems from './trailingItems';
import { Button } from '../button/button';

export default function NavigationBar() {
  return (
    <header>
      <nav className='w-full flex flex-col sm:flex-row text-black items-center justify-between bg-white p-2 border-b border-slate-300 gap-2'>
        <div className='flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start'>
          <div className='flex items-center gap-1'>
            <Link href={'/'}>
              <Image src={golivehubPurple} alt='logo' width={32} height={32} />
            </Link>
            <Link href={'/'} className='text-black font-bold'>
              Browse
            </Link>
            <Button variant={'icon'}>
              <EllipsisVertical />
            </Button>
          </div>
          <div className='sm:hidden'>
            <TrailingItems />
          </div>
        </div>

        <div className='w-full sm:flex-1 sm:max-w-md md:max-w-lg'>
          <SearchBar />
        </div>

        <div className='hidden sm:block'>
          <TrailingItems />
        </div>
      </nav>
    </header>
  );
}