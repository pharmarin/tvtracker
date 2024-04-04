"use client";

import { searchShow, upsertShow } from "@/app/series/ajouter/actions";
import { Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";

const AddShowPage = () => {
  const { execute, result } = useAction(searchShow);

  useEffect(() => {
    const formData = new FormData();
    formData.append("query", "the idol");

    execute(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <form
        action={execute}
        className="flex w-full flex-row items-center justify-center gap-4"
      >
        <input name="query" />
        <SearchButton />
      </form>
      <div className="space-y-4 max-w-3xl">
        {result.data?.map((result) => {
          if (!result.id) {
            return null;
          }

          const addShowWithId = upsertShow.bind(null, { showId: result.id });

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
                <form action={addShowWithId}>
                  <AddShowButton />
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SearchButton = () => {
  const { pending } = useFormStatus();

  if (pending) {
    return;
  }

  return (
    <button
      onClick={(event) => pending && event.preventDefault()}
      type="submit"
    >
      {pending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Chercher"}
    </button>
  );
};

const AddShowButton = () => {
  const { pending } = useFormStatus();

  if (pending) {
    return;
  }

  return (
    <button
      onClick={(event) => pending && event.preventDefault()}
      type="submit"
    >
      {pending ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        "Ajouter à mes séries"
      )}
    </button>
  );
};

export default AddShowPage;
