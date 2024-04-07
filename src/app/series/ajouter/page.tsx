"use client";

import { searchShow, upsertShow } from "@/app/series/ajouter/actions";
import LoadingButton from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
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
        <Input name="query" placeholder="Rechercher une série" />
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
                className="w-24 h-fit"
                src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
                height={500}
                width={500}
              />
              <div className="flex-1 flex-col">
                <div className="text-xl font-bold text-white flex items-start justify-between">
                  <div>{result.name}</div>
                  {result.id && (
                    <form action={upsertShowWithId}>
                      <LoadingButton>
                        <PlusIcon className="inline sm:hidden" />
                        <span className="hidden sm:inline">
                          Ajouter à mes séries
                        </span>
                      </LoadingButton>
                    </form>
                  )}
                </div>
                <div className="text-purple-200">{result.overview}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddShowPage;
