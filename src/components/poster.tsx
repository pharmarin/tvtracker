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
  imageUrl: string;
  title: string;
  subtitle?: ReactNode;
}) => {
  return (
    <div>
      <div className="relative">
        <Image
          alt={imageAlt}
          className="rounded-lg"
          src={imageUrl}
          height={500}
          width={500}
        />
        {badges && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center flex-col text-center">
            {badges}
          </div>
        )}
      </div>
      <div className="font-bold text-center truncate">{title}</div>
      {subtitle && (
        <div className="flex flex-col text-xs text-center italic text-opacity-50">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default Poster;
