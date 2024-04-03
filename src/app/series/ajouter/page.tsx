"use client";

import { searchShow } from "@/app/series/ajouter/actions";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useEffect } from "react";

const AddShowPage = () => {
  const { execute, result } = useAction(searchShow);

  useEffect(() => {
    execute({query: "the idol"})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      {/* <div className="flex w-full flex-row items-center justify-center gap-4">
        <input onChange={setSearch} value={search} />
        <button onPress={async () => setResults(await mutateAsync(search))}>
          Chercher
        </button>
      </div> */}
      <div className="space-y-4 max-w-3xl">
        {result.data?.map((result) => (
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
              <div className="text-xl font-bold text-white">{result.name}</div>
              <div className="text-purple-200">{result.overview}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddShowPage;
