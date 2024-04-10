import MovieHome from "app/films/home";
import ShowHome from "app/series/home";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";

const HomePage = async () => {
  return (
    <Tabs className="w-full max-w-screen-md" defaultValue="shows">
      <div className="flex justify-center">
        <TabsList>
          <TabsTrigger value="shows">Séries</TabsTrigger>
          <TabsTrigger value="movies">Films</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="shows">
        <ShowHome />
      </TabsContent>
      <TabsContent value="movies">
        <MovieHome />
      </TabsContent>
    </Tabs>
  );
};

export default HomePage;
