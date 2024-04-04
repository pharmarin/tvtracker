import { db } from "@/server/db";
import Image from "next/image";

export default async function HomePage() {
  const myShows = await db.show.findMany({});

  return (
    <div>
      <h2 className="font-semibold text-3xl mb-4">Mes séries</h2>
      <div className="grid grid-cols-5 gap-4 max-w-3xl">
        {myShows.map(async (show) => {
          return (
            <div key={show.id} className="flex justify-top flex-col">
              <Image
                alt={`${show.name} poster`}
                className="rounded-lg"
                src={`https://image.tmdb.org/t/p/w500${show.poster}`}
                height={500}
                width={500}
              />
              <div className="font-bold text-center">{show.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
