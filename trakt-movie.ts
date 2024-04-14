import { db } from "@/server/db";
import { upsertMovie } from "./app/actions";
import movies from "./watched_movies.json";

const importer = async () => {
  for (const movie of movies) {
    await upsertMovie({ movieId: movie.movie.ids.tmdb });

    console.log("Imported: ", movie.movie.title);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await db.movie.updateMany({
    data: {
      checked: true,
    },
  });
};

await importer();
