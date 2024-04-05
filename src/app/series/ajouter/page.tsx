"use client";

import { searchShow, upsertShow } from "@/app/series/ajouter/actions";
import LoadingButton from "@/components/loading-button";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";

const AddShowPage = () => {
  const { execute, result } = useAction(searchShow);

  return (
    <div className="space-y-4">
      <form
        action={execute}
        className="flex w-full flex-row items-center justify-center gap-4"
      >
        <input name="query" />
        <LoadingButton>Chercher</LoadingButton>
      </form>
      <div className="space-y-4 max-w-3xl">
        {result.data?.map((result) => {
          if (!result.id) {
            return null;
          }

          const upsertShowWithId = upsertShow.bind(null, { showId: result.id });

          return (
            <div
              key={result.id}
              className="flex flex-row gap-4 rounded-lg bg-white bg-opacity-30 p-4"
            >
              <Image
                alt={`${result.name} poster`}
                className="w-24"
                src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
                height={500}
                width={500}
              />
              <div className="flex-1 flex-col">
                <div className="text-xl font-bold text-white">
                  {result.name}
                </div>
                <div className="text-purple-200">{result.overview}</div>
              </div>
              {result.id && (
                <form action={upsertShowWithId}>
                  <LoadingButton>Ajouter à mes séries</LoadingButton>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddShowPage;
