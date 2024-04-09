"use client";

import { search, upsertMovie, upsertShow } from "@/app/actions";
import { routes } from "@/app/safe-routes";
import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Search = ({ viewedIds }: { viewedIds: number[] }) => {
  const router = useRouter();

  const { execute, result } = useAction(search);

  return (
    <div className="space-y-4">
      <form
        action={execute}
        className="flex w-full flex-row items-center justify-center gap-4"
      >
        <Input
          className="text-[16px]"
          name="query"
          placeholder="Rechercher un média"
          type="search"
        />
        <LoadingButton>Chercher</LoadingButton>
      </form>
      <div className="space-y-4 max-w-3xl">
        {result.data?.map((result) => {
          if (!result.id || result.media_type === "person") {
            return null;
          }

          const isShow = result.media_type === "tv";
          const isAdded = viewedIds.includes(result.id);

          const upsertWithId = isShow
            ? upsertShow.bind(null, { showId: result.id })
            : upsertMovie.bind(null, { movieId: result.id });

          const title = isShow ? result.name : result.title;

          return (
            <div
              key={result.id}
              className="flex flex-row gap-4 rounded-lg bg-white bg-opacity-30 p-4"
            >
              <Image
                alt={`${title} poster`}
                className="w-24 h-fit"
                src={
                  result.poster_path
                    ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
                    : ""
                }
                height={500}
                width={500}
              />
              <div className="flex-1 flex-col">
                <div className="text-xl font-bold text-white flex items-start justify-between">
                  <div>
                    <div>{title}</div>
                    <div className="text-sm italic text-opacity-50">
                      {isShow ? "Série" : "Film"}
                    </div>
                  </div>
                  {result.id &&
                    (isAdded ? (
                      <Button
                        onClick={() =>
                          result.id &&
                          router.push(
                            isShow
                              ? routes.showSingle({ showId: result.id })
                              : routes.movieSingle({ movieId: result.id }),
                          )
                        }
                      >
                        Détails
                      </Button>
                    ) : (
                      <form action={upsertWithId}>
                        <LoadingButton>
                          <PlusIcon className="inline sm:hidden" />
                          <span className="hidden sm:inline">
                            Ajouter à mes {isShow ? "séries" : "films"}
                          </span>
                        </LoadingButton>
                      </form>
                    ))}
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

export default Search;
