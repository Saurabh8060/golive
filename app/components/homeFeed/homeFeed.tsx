import { Tables } from "@/database/database.types";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";
import Badge from "./badge";
import { categories } from "@/lib/types/category";

const HomeFeed = ({
  livestreams,
}: {
  livestreams: Tables<"livestreams">[];
}) => {
  return (
    <div className="bh-white w-full h-full text-gray-400 overflow-y-scroll">
      <section className="p-4">
        <h2 className="text-lg text-golivehub-purple p-2 tracking-tight">
          Live on GoLiveHub
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {livestreams.map((livestream) => (
            <button
              key={livestream.id}
              onClick={() => {
                console.log("redirecting to /app/", livestream.user_name);
                redirect(`/app/${livestream.user_name}`);
              }}
              className="cursor-pointer"
            >
              <div className="relative bg-golivehub-purple aspect-video">
                <div className="absolute top-0 left-0 w-full h-full hover-raise">
                  <Image
  src={livestream.profile_image_url}
  alt={livestream.name}
  fill
  style={{ objectFit: 'cover' }}
/>

                  <p className="absolute top-2 left-2 bg-red-600 text-white uppercase text-sm font-semibold px-1">
                    Live
                  </p>
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm text-gray-500 font-semibold pb-1 text-start">
                  {livestream.name}
                </h3>
                <p className="text-sm text-start text-gray-500">
                  {livestream.user_name}
                </p>
                <p className="flex items-center gap-2 pt-0.5">
                  {livestream.categories.map((category, index) => (
                    <Badge text={category} key={index} />
                  ))}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className = 'p-4'>
        <h2 className = 'text-lg p-2 tracking-tight'>
            <span className = 'text-golivehub-purple'>Categories</span> we think you&apos;ll like
        </h2>
<div className="grid grid-cols-6 gap-3">
  {categories.map((category) => (
    <div key={category.id}>
      <div className="relative bg-golivehub-purple aspect-[3/4]">
        <div className="absolute top-0 left-0 w-full h-full hover-raise">
          <Image
            src={category.image}
            alt={category.name}
            layout="fill"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 py-2">
        <p className="text-sm font-semibold text-gray-500">
          {category.name}
        </p>

        {category.tags && (
          <div className="flex items-center flex-wrap gap-2">
            {category.tags.map((tag) => (
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
