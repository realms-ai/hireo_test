import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Repository } from "@/lib/github-service";
import { Trie } from "@/lib/trie";

interface SearchBarProps {
  onSearch: (query: string) => void;
  repositories: Repository[];
}

export function SearchBar({ onSearch, repositories }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Repository[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const trie = useRef(new Trie());

  useEffect(() => {
    // Rebuild trie when repositories change
    trie.current = new Trie();
    repositories.forEach(repo => {
      trie.current.insert(repo.name, repo);
    });
  }, [repositories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      const results = trie.current.search(value);
      setSuggestions(results.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Repository) => {
    setQuery(suggestion.name);
    onSearch(suggestion.name);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search GitHub repositories..."
          className="w-full px-4 py-3 pl-12 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-background border rounded-lg shadow-lg z-10">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium">{suggestion.full_name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {suggestion.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}