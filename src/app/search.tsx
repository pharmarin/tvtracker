"use client";

import { search, upsertMovie, upsertShow } from "@/app/actions";
import { routes } from "@/app/safe-routes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useAsyncAction } from "@/lib/use-async-hook";
import { CommandLoading } from "cmdk";
import { debounce } from "lodash-es";
import { ArrowRight, Loader2Icon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const Search = ({
  movieIds,
  showIds,
}: {
  movieIds: number[];
  showIds: number[];
}) => {
  const router = useRouter();
  const [addingShows, setAddingShows] = useState<number[]>([]);
  const [addingMovies, setAddingMovies] = useState<number[]>([]);
  const [{ data, isLoading: isSearching }, execute] = useAsyncAction(search);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executeDebounced = useCallback(debounce(execute, 1000), []);

  return (
    <CommandDialog open={true} onOpenChange={() => true} shouldFilter={false}>
      <CommandInput
        onValueChange={(value) => executeDebounced({ query: value })}
        placeholder="Recherchez une série ou un film..."
      />
      <CommandList>
        {isSearching && (
          <CommandLoading className="flex items-center justify-center text-sm mt-4">
            Chargement en cours...
          </CommandLoading>
        )}
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        {data?.myShows && data.myShows.length > 0 && (
          <CommandGroup heading="Mes séries">
            {data.myShows.map((show) => (
              <CommandItem
                key={show.id}
                onSelect={() =>
                  router.push(
                    routes.showSingle({
                      showId: show.id,
                    }),
                  )
                }
                value={`${show.id}`}
              >
                <Image
                  alt={`${show.name} poster`}
                  className="w-12 h-fit mr-4"
                  src={
                    show.poster
                      ? `https://image.tmdb.org/t/p/w500${show.poster}`
                      : ""
                  }
                  height={500}
                  width={500}
                />
                <span className="font-bold">{show.name}</span>
                <CommandShortcut>
                  <ArrowRight />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {data?.myMovies && data.myMovies.length > 0 && (
          <CommandGroup heading="Mes films">
            {data.myMovies.map((movie) => (
              <CommandItem
                key={movie.id}
                onSelect={() =>
                  router.push(
                    routes.movieSingle({
                      movieId: movie.id,
                    }),
                  )
                }
                value={`${movie.id}`}
              >
                <Image
                  alt={`${movie.title} poster`}
                  className="w-12 h-fit mr-4"
                  src={
                    movie.poster
                      ? `https://image.tmdb.org/t/p/w500${movie.poster}`
                      : ""
                  }
                  height={500}
                  width={500}
                />
                <span className="font-bold">{movie.title}</span>
                <CommandShortcut>
                  <ArrowRight />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {data?.tmdbShows && data.tmdbShows.length > 0 && (
          <CommandGroup heading="Séries TMDB">
            {data.tmdbShows.map((show) => {
              if (!show.id) {
                return null;
              }

              const isAdding = addingShows.includes(show.id);
              const isAdded = showIds.includes(show.id);

              return (
                <CommandItem
                  key={show.id}
                  disabled={isAdding}
                  onSelect={async () => {
                    if (isAdding) {
                      return;
                    }
                    if (isAdded) {
                      router.push(routes.showSingle({ showId: show.id ?? 0 }));
                    } else {
                      setAddingShows((state) => [...state, show.id ?? 0]);
                      await upsertShow({ showId: show.id ?? 0 });
                      setAddingShows((state) => [
                        ...state.filter((adding) => adding !== show.id),
                      ]);
                    }
                  }}
                  value={`${show.id}`}
                >
                  <Image
                    alt={`${show.name} poster`}
                    className="w-12 h-fit mr-4"
                    src={
                      show.poster_path
                        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                        : ""
                    }
                    height={500}
                    width={500}
                  />
                  <span className="font-bold">{show.name}</span>
                  <CommandShortcut>
                    {isAdding ? (
                      <Loader2Icon className="animate-spin" />
                    ) : showIds.includes(show.id) ? (
                      <ArrowRight />
                    ) : (
                      <PlusIcon />
                    )}
                  </CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        {data?.tmdbMovies && data.tmdbMovies.length > 0 && (
          <CommandGroup heading="Films TMDB">
            {data.tmdbMovies.map((movie) => {
              if (!movie.id) {
                return null;
              }

              const isAdding = addingMovies.includes(movie.id);
              const isAdded = movieIds.includes(movie.id);

              return (
                <CommandItem
                  key={movie.id}
                  disabled={isAdding}
                  onSelect={async () => {
                    if (isAdding) {
                      return;
                    }
                    if (isAdded) {
                      router.push(
                        routes.movieSingle({ movieId: movie.id ?? 0 }),
                      );
                    } else {
                      setAddingMovies((state) => [...state, movie.id ?? 0]);
                      await upsertMovie({ movieId: movie.id ?? 0 });
                      setAddingMovies((state) => [
                        ...state.filter((adding) => adding !== movie.id),
                      ]);
                    }
                  }}
                  value={`${movie.id}`}
                >
                  <Image
                    alt={`${movie.title} poster`}
                    className="w-12 h-fit mr-4"
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : ""
                    }
                    height={500}
                    width={500}
                  />
                  <span className="font-bold">{movie.title}</span>
                  <CommandShortcut>
                    {isAdding ? (
                      <Loader2Icon className="animate-spin" />
                    ) : movieIds.includes(movie.id) ? (
                      <ArrowRight />
                    ) : (
                      <PlusIcon />
                    )}
                  </CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default Search;
