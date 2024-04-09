import MovieHome from "@/app/films/home";
import Search from "@/app/search";
import ShowHome from "@/app/series/home";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/server/db";

const HomePage = async () => {
  const medias = await db.$transaction([
    db.show.findMany({
      select: { id: true },
    }),
    db.movie.findMany({
      select: { id: true },
    }),
  ]);

  return (
    <Tabs className="w-full max-w-screen-md" defaultValue="shows">
      <div className="flex justify-center">
        <TabsList>
          <TabsTrigger value="shows">Séries</TabsTrigger>
          <TabsTrigger value="movies">Films</TabsTrigger>
          <TabsTrigger value="add">Ajouter</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="shows">
        <ShowHome />
      </TabsContent>
      <TabsContent value="movies">
        <MovieHome />
      </TabsContent>
      <TabsContent value="add">
        <Search viewedIds={medias.flat().map((media) => media.id)} />
      </TabsContent>
    </Tabs>
  );
};

export default HomePage;
