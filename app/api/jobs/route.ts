import { routes } from "@/app/safe-routes";
import { refreshShow } from "@/app/series/utils";
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
    await refreshShow(skip);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    void fetch(
      `${url.protocol}//${url.host}${routes.jobs({ search: { job: "REFRESH_SHOWS", skip: (skip ?? 0) + 1 } })}`,
    );

    return new Response();
  }

  return new Response();
};
