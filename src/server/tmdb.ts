import { env } from "@/env";
import { MovieDb } from "moviedb-promise";

const apiKey = env.TMDB_SECRET;

const tmdb = new MovieDb(apiKey);

export const ShowStatus = {
  Canceled: "Terminé",
  "In Production": "En production",
  Planned: "Planifié",
  "Post Production": "En post-production",
  Released: "Sorti",
  Rumored: "Rumeur",
};

export const switchShowStatus = (status: string | null) => {
  switch (status) {
    case "Ended":
      return "Terminé";
    case "Canceled":
      return "Annulé";
    case "In Production":
      return "En production";
    case "Planned":
      return "Planifié";
    case "Returning Series":
      return "Suite attendue";
    case "Post Production":
      return "En post-production";
    case "Released":
      return "Sorti";
    case "Rumored":
      return "Rumeur";
    default:
      return status;
  }
};

export default tmdb;
