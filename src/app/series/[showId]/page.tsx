import { routes } from "@/app/safe-routes";
import { upsertShow } from "@/app/series/ajouter/actions";
import LoadingButton from "@/components/loading-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { db } from "@/server/db";
import { switchShowStatus } from "@/server/tmdb";
import Image from "next/image";
import { notFound } from "next/navigation";

const ShowPage = async ({ params }: { params: unknown }) => {
  try {
    const { showId } = routes.showSingle.$parseParams(params);
    const show = await db.show.findFirstOrThrow({
      where: { id: showId },
      include: { seasons: { include: { episodes: true } } },
    });

    const upsertShowWithId = upsertShow.bind(null, { showId: show.id });

    return (
      <div className="max-w-3xl w-full space-y-4">
        <div className="flex flex-row space-x-4">
          <Image
            alt={`${show.name} poster`}
            className="rounded-lg w-48"
            src={`https://image.tmdb.org/t/p/w500${show.poster}`}
            height={500}
            width={500}
          />
          <div>
            <h2 className="text-3xl font-bold mb-4">{show.name}</h2>
            <p>Status : {switchShowStatus(show.status)}</p>
            <p>Nombre de saisons : {show.seasonCount}</p>
            <p>Nombre d&apos;épisodes : {show.episodeCount}</p>
            <p>
              Pays d&apos;origine :{" "}
              {show.originalCountry &&
                (JSON.parse(show.originalCountry) as string[])?.join(", ")}{" "}
              ({show.originalLanguage})
            </p>
            <form className="mt-4" action={upsertShowWithId}>
              <LoadingButton>Mettre à jour</LoadingButton>
            </form>
          </div>
        </div>
        <div>
          <Accordion type="single" collapsible defaultValue="season-1">
            {show.seasons.map((season) => (
              <AccordionItem
                key={season.id}
                className="border-b-0"
                value={`season-${season.number}`}
              >
                <AccordionTrigger className="bg-white bg-opacity-50 rounded-t-lg px-4 font-bold">
                  {season.name}
                </AccordionTrigger>
                <AccordionContent className="bg-white bg-opacity-25 pb-0 rounded-b-lg divide-y">
                  {season.episodes.map((episode) => (
                    <div key={episode.id} className="p-4">
                      <p className="font-semibold">
                        {episode.number} - {episode.name}{" "}
                        <span className="font-normal">
                          ({episode.airDate?.toLocaleDateString(["fr"])})
                        </span>
                      </p>
                      <p>{episode.overview}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default ShowPage;
