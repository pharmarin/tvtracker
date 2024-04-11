import { routes } from "@/app/safe-routes";
import { updateShow } from "@/app/series/utils";
import { db } from "@/server/db";
import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  const { job, skip } = routes.jobs.$parseSearchParams(
    Object.fromEntries(url.searchParams.entries()),
  );

  if (!job) {
    void fetch(
      `${url.protocol}//${url.host}${routes.jobs({ search: { job: "REFRESH_SHOWS" } })}`,
    );

    return new Response("Background jobs started");
  }

  if (job === "REFRESH_SHOWS") {
    const show = await db.show.findFirst({
      orderBy: { id: "asc" },
      take: 1,
      skip: skip ?? 0,
      select: { id: true, name: true, episodeCount: true, seasonCount: true },
    });

    if (!show) {
      return new Response("Job done");
    }

    const updated = await updateShow(show);
    console.log(
      updated
        ? `Mise à jour de : ${show.name}`
        : `Série déjà à jour : ${show.name}`,
    );

    void fetch(
      `${url.protocol}//${url.host}${routes.jobs({ search: { job: "REFRESH_SHOWS", skip: (skip ?? 0) + 1 } })}`,
    );

    return new Response();
  }

  return new Response();
};
