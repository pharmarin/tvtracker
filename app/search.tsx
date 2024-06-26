"use client";

import { search as searchAction } from "@/app/actions";
import { createBookAction } from "@/app/books/actions";
import { createMovieAction } from "@/app/films/actions";
import { routes } from "@/app/safe-routes";
import { createShowAction } from "@/app/series/actions";
import { Button } from "@/components/ui/button";
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
import { ArrowRight, Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const SearchImage = ({ alt, src }: { alt: string; src?: string }) =>
  src ? (
    <Image
      alt={alt}
      className="shrink-0 w-12 h-fit mr-4"
      src={src}
      height={500}
      width={500}
    />
  ) : (
    <div className="shrink-0 w-12 h-16 mr-4 bg-gray-200 rounded"></div>
  );

const Search = ({
  bookIds,
  movieIds,
  showIds,
}: {
  bookIds: { id: string; gapiId: string }[];
  movieIds: {
    id: string;
    tmdbId: number;
  }[];
  showIds: {
    id: string;
    tmdbId: number;
  }[];
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addingShows, setAddingShows] = useState<number[]>([]);
  const [addingMovies, setAddingMovies] = useState<number[]>([]);
  const [addingBooks, setAddingBooks] = useState<string[]>([]);
  const [{ data, isLoading: isSearching, reset }, execute] =
    useAsyncAction(searchAction);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executeDebounced = useCallback(debounce(execute, 1000), []);

  const redirectTo = (dest: string) => {
    setOpen(false);
    router.push(dest as Route);
    setSearch("");
    reset();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="ghost">
        <SearchIcon />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          onValueChange={async (value) => {
            setSearch(value);
            await executeDebounced({ query: value });
          }}
          placeholder="Recherchez une série ou un film..."
          value={search}
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
                    redirectTo(
                      routes.showSingle({
                        showId: show.id,
                      }),
                    )
                  }
                  value={`${show.id}`}
                >
                  <SearchImage
                    alt={`${show.name} poster`}
                    src={
                      show.poster
                        ? `https://image.tmdb.org/t/p/w500${show.poster}`
                        : undefined
                    }
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
                    redirectTo(
                      routes.movieSingle({
                        movieId: movie.id,
                      }),
                    )
                  }
                  value={`${movie.id}`}
                >
                  <SearchImage
                    alt={`${movie.title} poster`}
                    src={
                      movie.poster
                        ? `https://image.tmdb.org/t/p/w500${movie.poster}`
                        : undefined
                    }
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
                const isAdded = showIds
                  .map((show) => show.tmdbId)
                  .includes(show.id);

                return (
                  <CommandItem
                    key={show.id}
                    disabled={isAdding}
                    onSelect={async () => {
                      if (isAdding) {
                        return;
                      }
                      if (!isAdded) {
                        setAddingShows((state) => [...state, show.id ?? 0]);
                        const createdShowId = await createShowAction({
                          tmdbShowId: show.id ?? 0,
                        });
                        setAddingShows((state) => [
                          ...state.filter((adding) => adding !== show.id),
                        ]);

                        redirectTo(
                          routes.showSingle({
                            showId: createdShowId.data ?? "",
                          }),
                        );
                      } else {
                        redirectTo(
                          routes.showSingle({
                            showId:
                              showIds.find((media) => media.tmdbId === show.id)
                                ?.id ?? "",
                          }),
                        );
                      }
                    }}
                    value={`${show.id}`}
                  >
                    <SearchImage
                      alt={`${show.name} poster`}
                      src={
                        show.poster_path
                          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                          : undefined
                      }
                    />
                    <span className="font-bold">{show.name}</span>
                    <CommandShortcut>
                      {isAdding ? (
                        <Loader2Icon className="animate-spin" />
                      ) : isAdded ? (
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
                const isAdded = movieIds
                  .map((movie) => movie.tmdbId)
                  .includes(movie.id);

                return (
                  <CommandItem
                    key={movie.id}
                    disabled={isAdding}
                    onSelect={async () => {
                      if (isAdding) {
                        return;
                      }
                      if (!isAdded) {
                        setAddingMovies((state) => [...state, movie.id ?? 0]);
                        const createdMovieId = await createMovieAction({
                          tmdbMovieId: movie.id ?? 0,
                        });
                        setAddingMovies((state) => [
                          ...state.filter((adding) => adding !== movie.id),
                        ]);

                        redirectTo(
                          routes.movieSingle({
                            movieId: createdMovieId.data ?? "",
                          }),
                        );
                      } else {
                        redirectTo(
                          routes.movieSingle({
                            movieId:
                              movieIds.find(
                                (media) => media.tmdbId === movie.id,
                              )?.id ?? "",
                          }),
                        );
                      }
                    }}
                    value={`${movie.id}`}
                  >
                    <SearchImage
                      alt={`${movie.title} poster`}
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : undefined
                      }
                    />
                    <span className="font-bold">{movie.title}</span>
                    <CommandShortcut>
                      {isAdding ? (
                        <Loader2Icon className="animate-spin" />
                      ) : isAdded ? (
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
          {data?.apiBooks && data.apiBooks.length > 0 && (
            <CommandGroup heading="Livres Google API">
              {data.apiBooks.map((book) => {
                if (!book.id) {
                  return null;
                }

                const isAdding = addingBooks.includes(book.id);
                const isAdded = bookIds
                  .map((media) => media.gapiId)
                  .includes(book.id);

                return (
                  <CommandItem
                    key={book.id}
                    disabled={isAdding}
                    onSelect={async () => {
                      if (isAdding) {
                        return;
                      }
                      if (!isAdded) {
                        setAddingBooks((state) => [...state, book.id ?? ""]);
                        const createdBookId = await createBookAction({
                          bookId: book.id ?? "",
                        });
                        setAddingBooks((state) => [
                          ...state.filter((adding) => adding !== book.id),
                        ]);

                        redirectTo(
                          routes.bookSingle({
                            bookId: createdBookId.data ?? "",
                          }),
                        );
                      } else {
                        redirectTo(
                          routes.bookSingle({
                            bookId:
                              bookIds.find((media) => media.gapiId === book.id)
                                ?.id ?? "",
                          }),
                        );
                      }
                    }}
                    value={`${book.id}`}
                  >
                    <SearchImage
                      alt={`${book.volumeInfo?.title} poster`}
                      src={book.volumeInfo?.imageLinks?.thumbnail}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold line-clamp-1">
                        {book.volumeInfo?.title}
                      </span>
                      <span className="italic">
                        {book.volumeInfo?.authors?.join(", ")}
                      </span>
                    </div>
                    <CommandShortcut>
                      {isAdding ? (
                        <Loader2Icon className="animate-spin" />
                      ) : isAdded ? (
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
    </>
  );
};

export default Search;
