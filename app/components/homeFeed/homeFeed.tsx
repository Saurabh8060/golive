import { Tables } from "@/database/database.types";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";
import Badge from "./badge";
import { categories } from "@/lib/types/category";
import Sample_Stream_Image from '../../../public/sample-image.png';
import { useDatabase } from "@/contexts/databaseContext";
import { useSession } from "@clerk/nextjs";

const HomeFeed = ({
  livestreams,
}: {
  livestreams: Tables<"livestreams">[];
}) => {
  const { session } = useSession();

  return (
    <div className="bg-white w-full h-full text-gray-400 overflow-y-scroll">
      <section className="p-4">
        <h2 className="text-lg text-golivehub-purple p-2 tracking-tight">
          Live on GoLiveHub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {livestreams.map((livestream) => (
            <>
            {console.log(livestream)}
            <button
              key={livestream.id}
              onClick={() => {
                console.log("redirecting to /app/", livestream.user_id);
                if(session?.user.id == livestream?.user_id){
                  redirect(`/app/dashboard`)
                }else{
                  redirect(`/app/${livestream.user_id}`);
                }

                
              }}
              className="cursor-pointer"
            >
              <div className="relative bg-golivehub-purple aspect-video">
                <div className="absolute top-0 left-0 w-full h-full hover-raise">
                  <Image
                    src={livestream.profile_image_url || Sample_Stream_Image} 
                    alt={livestream.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <p className="absolute top-2 left-2 bg-red-600 text-white uppercase text-xs sm:text-sm font-semibold px-1 rounded">
                    Live
                  </p>
                </div>
              </div>
              <div className="flex flex-col pt-2">
                <h3 className="text-sm text-gray-500 font-semibold pb-1 text-start line-clamp-1">
                  {livestream.name}
                </h3>
                <p className="text-sm text-start text-gray-500">
                  {livestream.creator_name}
                </p>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  {livestream.categories.map((category, index) => (
                    <Badge text={category} key={index} />
                  ))}
                </div>
              </div>
            </button>
            </>
          ))}
        </div>
      </section>
      
      <section className='p-4'>
        <h2 className='text-lg p-2 tracking-tight'>
          <span className='text-golivehub-purple'>Categories</span> we think you&apos;ll like
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {categories.map((category) => (
            <div key={category.id} className="cursor-pointer">
              <div className="relative bg-golivehub-purple aspect-[3/4]">
                <div className="absolute top-0 left-0 w-full h-full hover-raise">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 py-2">
                <p className="text-sm font-semibold text-gray-500 line-clamp-2">
                  {category.name}
                </p>

                {category.tags && (
                  <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                    {category.tags.slice(0, 3).map((tag) => (
                      <Badge text={tag} key={tag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeFeed;