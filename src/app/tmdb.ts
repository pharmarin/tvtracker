import { env } from "@/env";
import { MovieDb } from "moviedb-promise";

const apiKey = env.TMDB_SECRET;

const tmdb = new MovieDb(apiKey);

export default tmdb;
