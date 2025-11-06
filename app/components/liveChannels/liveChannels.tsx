import { Tables } from '@/database/database.types'
import React, { useState } from 'react'
import { ArrowRight } from '../icons';
import Image from 'next/image';
import Sample_Stream_Image from '../../../public/sample-image.png';
const LiveChannels = ({livestreams}: {livestreams: Tables<'livestreams'>[]}) => {
    const [expanded, setExpanded] = useState(true);
return (
  <div
    className={`bg-golivehub-ice text-gray-500 p-2 flex flex-col gap-1 overflow-y-scroll ${
      expanded ? 'min-w-xs' : ''
    }`}
  >
    <div
      className={`flex items-center pb-2 text-black ${
        expanded ? 'justify-between' : 'justify-center'
      }`}
    >
      {expanded && (
        <h2 className="text-sm uppercase font-bold">Live Channels</h2>
      )}
      <button
        className={`text-sm text-secondary cursor-pointer rounded-full hover:bg-gray-200 p-1 transition-all duration-150 ease-in-out ${
          expanded ? '' : 'rotate-180'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <ArrowRight />
      </button>
    </div>

    {livestreams.map((livestream) => (
      <button
        key={livestream.id} // Fixed: was 'livestreams.id'
        className="flex items-center gap-2 text-secondary cursor-pointer"
        onClick={() => {
          console.log(`Clicked on ${livestream.name}`);
        }}
      >
        <Image
          src={livestream.profile_image_url || Sample_Stream_Image}
          alt={livestream.name}
          width={40}
          height={40}
          className="rounded-full"
        />
        {expanded && (
          <>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-black text-left">
                {livestream.name}
              </h3>
              <p className="text-xs text-left">
                {livestream.categories.join(', ')}
              </p>
            </div>
            <div className="flex items-center justify-start gap-1 ml-auto">
              <div className="size-2 bg-red-500 rounded-full" />
            </div>
          </>
        )}
      </button>
    ))}
  </div>
);
};
export default LiveChannels;
// import { Tables } from '@/database/database.types'
// import React from 'react'
// import { ArrowRight } from '../icons';
// import Image from 'next/image';
// import Sample_Stream_Image from '../../../public/sample-image.png';

// interface LiveChannelsProps {
//   livestreams: Tables<'livestreams'>[];
//   expanded: boolean;
//   setExpanded: (expanded: boolean) => void;
// }

// const LiveChannels = ({ livestreams, expanded, setExpanded }: LiveChannelsProps) => {
    
// return (
//   <div
//     className={`fixed top-0 left-0 h-screen bg-golivehub-ice text-gray-500 p-2 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out z-40 shadow-lg ${
//       expanded ? 'w-64 sm:w-80' : 'w-16'
//     }`}
//   >
//     <div
//       className={`flex items-center pb-2 text-black transition-all duration-300 ${
//         expanded ? 'justify-between' : 'justify-center'
//       }`}
//     >
//       <h2 className={`text-xs sm:text-sm uppercase font-bold whitespace-nowrap transition-all duration-300 ${
//         expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
//       }`}>
//         Live Channels
//       </h2>
//       <button
//         className={`text-sm text-secondary cursor-pointer rounded-full hover:bg-gray-200 p-1 transition-transform duration-300 ease-in-out flex-shrink-0 ${
//           expanded ? 'rotate-180' : ''
//         }`}
//         onClick={() => setExpanded(!expanded)}
//         aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
//       >
//         <ArrowRight />
//       </button>
//     </div>

//     <div className="flex flex-col gap-1 overflow-y-auto">
//       {livestreams.map((livestream) => (
//         <button
//           key={livestream.id}
//           className="flex items-center gap-2 text-secondary cursor-pointer hover:bg-gray-200 rounded p-1 transition-colors"
//           onClick={() => {
//             console.log(`Clicked on ${livestream.name}`);
//           }}
//         >
//           <div className="flex-shrink-0">
//             <Image
//               src={livestream.profile_image_url || Sample_Stream_Image}
//               alt={livestream.name}
//               width={40}
//               height={40}
//               className="rounded-full"
//             />
//           </div>
//           <div className={`flex items-center gap-2 flex-1 min-w-0 transition-all duration-300 ${
//             expanded ? 'opacity-100 visible' : 'opacity-0 invisible w-0'
//           }`}>
//             <div className="flex flex-col gap-1 flex-1 min-w-0">
//               <h3 className="text-xs sm:text-sm font-bold text-black text-left truncate">
//                 {livestream.name}
//               </h3>
//               <p className="text-xs text-left truncate">
//                 {livestream.categories.join(', ')}
//               </p>
//             </div>
//             <div className="flex items-center justify-center flex-shrink-0">
//               <div className="size-2 bg-red-500 rounded-full" />
//             </div>
//           </div>
//         </button>
//       ))}
//     </div>
//   </div>
// );
// };

// export default LiveChannels