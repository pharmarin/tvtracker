import { routes } from "@/app/safe-routes";
import { setDropShow } from "@/app/series/[showId]/actions";
import DeleteButton from "@/app/series/[showId]/delete-button";
import ToggleButton from "@/app/series/[showId]/toggle-button";
import { updateShowAction } from "@/app/series/actions";
import LoadingButton from "@/components/loading-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { db } from "@/server/db";
import { switchShowStatus } from "@/server/tmdb";
import { HandIcon, HandshakeIcon, RefreshCcwIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

const ShowPage = async ({ params }: { params: unknown }) => {
  try {
    const { showId } = routes.showSingle.$parseParams(params);
    const show = await db.show.findFirstOrThrow({
      where: { id: showId },
      include: {
        seasons: {
          include: { episodes: { orderBy: { number: "asc" } } },
          orderBy: { number: "asc" },
        },
      },
    });

    const upsertShowWithId = updateShowAction.bind(null, { showId: show.id });
    const setDropShowWithId = setDropShow.bind(null, {
      showId: show.id,
      dropped: show.dropped ?? false,
    });

    const firstUncheckedEpisode = show.seasons
      .map((season) => season.episodes)
      .flat()
      .find((episode) => !episode.checked);
    const uncheckedEpisodeIds: number[] = [];

    return (
      <div className="max-w-3xl w-full space-y-4">
        <div className="flex flex-row space-x-4">
          <Image
            alt={`${show.name} poster`}
            className="rounded-lg w-48 max-w-[33%]"
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
            <div className="flex mt-4 flex-col gap-2 md:flex-row">
              <form action={upsertShowWithId}>
                <LoadingButton className="w-full space-x-2">
                  <RefreshCcwIcon /> <span>Mettre à jour</span>
                </LoadingButton>
              </form>
              <form action={setDropShowWithId}>
                <LoadingButton className="w-full space-x-2">
                  {show.dropped ? (
                    <>
                      <HandshakeIcon /> <span>Reprendre</span>
                    </>
                  ) : (
                    <>
                      <HandIcon /> <span>Abandonner</span>
                    </>
                  )}
                </LoadingButton>
              </form>
              <DeleteButton showId={show.id} showName={show.name ?? ""} />
            </div>
          </div>
        </div>
        <div>
          <Accordion
            type="multiple"
            className="space-y-4"
            defaultValue={
              firstUncheckedEpisode
                ? [`season-${firstUncheckedEpisode?.seasonId}`]
                : show.seasons.map((season) => `season-${season.id}`)
            }
          >
            {show.seasons.map((season) => (
              <AccordionItem
                key={season.id}
                className="border-b-0"
                value={`season-${season.id}`}
              >
                <AccordionTrigger className="bg-white bg-opacity-50 rounded-t-lg px-4 font-bold data-[state=closed]:rounded-b-lg">
                  {season.name}
                </AccordionTrigger>
                <AccordionContent className="bg-white bg-opacity-25 pb-0 rounded-b-lg divide-y">
                  {season.episodes.map((episode) => {
                    if (!episode.checked) {
                      uncheckedEpisodeIds.push(episode.id);
                    }

                    return (
                      <div
                        key={episode.id}
                        className="p-4 flex flex-row items-center"
                      >
                        <div className="w-full flex-initial">
                          <p className="font-semibold">
                            {episode.number} - {episode.name}{" "}
                            <span className="font-normal">
                              ({episode.airDate?.toLocaleDateString(["fr"])})
                            </span>
                          </p>
                          <p className="line-clamp-1 sm:line-clamp-none hover:line-clamp-none">
                            {episode.overview}
                          </p>
                        </div>
                        <div className="flex-0 w-10 items-center">
                          <ToggleButton
                            checked={episode.checked ?? false}
                            episodeId={episode.id}
                            previousUnchecked={uncheckedEpisodeIds.some(
                              (id) => id < episode.id,
                            )}
                            showId={show.id}
                          />
                        </div>
                      </div>
                    );
                  })}
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
