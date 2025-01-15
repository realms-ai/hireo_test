import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/SearchBar";
import { RepositoryCard } from "@/components/RepositoryCard";
import { Repository, searchRepositories } from "@/lib/github-service";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Repository[]>([]);
  const { toast } = useToast();

  const { data: repositories, isLoading, error } = useQuery({
    queryKey: ["repositories", searchQuery],
    queryFn: () => searchQuery ? searchRepositories(searchQuery) : Promise.resolve([]),
    enabled: !!searchQuery,
  });

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (repository: Repository) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === repository.id);
      const newFavorites = isFavorite
        ? prev.filter(fav => fav.id !== repository.id)
        : [...prev, repository];
      
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: repository.full_name,
      });
      
      return newFavorites;
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">GitHub Repository Search</h1>
          <p className="text-muted-foreground">
            Search for repositories and save your favorites
          </p>
        </div>

        <SearchBar onSearch={handleSearch} repositories={repositories || []} />

        {isLoading && (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center text-destructive">
            An error occurred while fetching repositories
          </div>
        )}

        {repositories && repositories.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Search Results</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {repositories.map(repository => (
                <RepositoryCard
                  key={repository.id}
                  repository={repository}
                  isFavorite={favorites.some(fav => fav.id === repository.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Favorites</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map(repository => (
                <RepositoryCard
                  key={repository.id}
                  repository={repository}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}