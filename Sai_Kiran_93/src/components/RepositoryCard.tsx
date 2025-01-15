import { Star, GitFork, Bookmark, BookmarkCheck } from "lucide-react";
import { Repository } from "@/lib/github-service";
import { cn } from "@/lib/utils";

interface RepositoryCardProps {
  repository: Repository;
  isFavorite: boolean;
  onToggleFavorite: (repo: Repository) => void;
}

export function RepositoryCard({ repository, isFavorite, onToggleFavorite }: RepositoryCardProps) {
  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:text-primary"
              >
                {repository.full_name}
              </a>
            </div>
          </div>
          <p className="mt-2 text-muted-foreground line-clamp-2">
            {repository.description || "No description available"}
          </p>
        </div>
        <button
          onClick={() => onToggleFavorite(repository)}
          className={cn(
            "ml-4 p-2 rounded-full transition-colors",
            isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-500"
          )}
        >
          {isFavorite ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="w-4 h-4" />
          <span>{repository.stargazers_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <GitFork className="w-4 h-4" />
          <span>{repository.forks_count.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}