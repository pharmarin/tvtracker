import Image from "next/image";
import type { ReactNode } from "react";

const Poster = ({
  badges,
  imageAlt,
  imageUrl,
  title,
  subtitle,
}: {
  badges?: ReactNode;
  imageAlt: string;
  imageUrl: string | null;
  title: string;
  subtitle?: ReactNode;
}) => {
  return (
    <div>
      <div className="relative">
        {imageUrl ? (
          <Image
            alt={imageAlt}
            className="rounded-lg"
            src={imageUrl}
            height={500}
            width={500}
          />
        ) : (
          <div className="bg-gray-200 w-20 h-16 rounded"></div>
        )}
        {badges && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center flex-col text-center">
            {badges}
          </div>
        )}
      </div>
      <div className="font-bold text-center line-clamp-2 leading-4 mt-2">
        {title}
      </div>
      {subtitle && (
        <div className="flex flex-col text-xs text-center italic text-opacity-50">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default Poster;
