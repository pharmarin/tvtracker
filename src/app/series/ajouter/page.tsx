import AddShowClient from "@/app/series/ajouter/client";
import { db } from "@/server/db";

const AddShowPage = async () => {
  const shows = await db.show.findMany({
    select: { id: true },
  });

  return <AddShowClient showIds={shows.map((show) => show.id)} />;
};

export default AddShowPage;
