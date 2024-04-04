import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const myShows = await db.show.findMany({});

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="font-semibold text-3xl mb-4">Mes séries</h2>
        <Link href={routes.showAdd()}>Ajouter</Link>
      </div>
      <div className="grid grid-cols-5 gap-4 max-w-3xl">
        {myShows.map(async (show) => {
          return (
            <Link
              key={show.id}
              className="flex justify-top flex-col"
              href={routes.showSingle({
                showId: show.id,
              })}
            >
              <Image
                alt={`${show.name} poster`}
                className="rounded-lg"
                src={`https://image.tmdb.org/t/p/w500${show.poster}`}
                height={500}
                width={500}
              />
              <div className="font-bold text-center">{show.name}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
