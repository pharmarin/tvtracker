"use server"

import tmdb from "@/app/tmdb"
import { action } from "@/server/safe-action"
import { z } from "zod"

export const searchShow = action(z.object({
  query: z.string()
}), async ({query}) => await tmdb
      .searchTv({ query, language: "fr" })
      .then((response) => response?.results ?? []))