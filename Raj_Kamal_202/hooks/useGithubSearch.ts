import { useState, useEffect, useCallback } from 'react';
import { Trie } from '../lib/trie';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  language: string;
  owner: {
    avatar_url: string;
    login: string;
  };
}

export function useGitHubSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trie] = useState(() => new Trie());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [seenRepos] = useState(new Set<number>());

  const searchRepositories = useCallback(async (query: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/github?q=${encodeURIComponent(query)}&page=${pageNum}`);
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      
      // Filter out duplicates
      const newRepos = (data.items || [])
        .filter((item: any) => !seenRepos.has(item.id))
        .map((item: any) => {
          seenRepos.add(item.id);
          return {
            id: item.id,
            name: item.name,
            full_name: item.full_name,
            description: item.description,
            stargazers_count: item.stargazers_count,
            forks_count: item.forks_count,
            html_url: item.html_url,
            language: item.language,
            owner: {
              avatar_url: item.owner?.avatar_url,
              login: item.owner?.login,
            },
          };
        });

      // Sort repositories by stars in descending order
      newRepos.sort((a: Repository, b: Repository) => b.stargazers_count - a.stargazers_count);

      if (pageNum === 1) {
        seenRepos.clear(); // Clear seen repos when starting a new search
        newRepos.forEach(repo => seenRepos.add(repo.id));
        setRepositories(newRepos);
      } else {
        setRepositories(prev => [...prev, ...newRepos]);
      }

      setTotalCount(data.total_count || 0);
      setHasMore(newRepos.length === 10);

      // Populate trie with repository names
      newRepos.forEach((repo: Repository) => trie.insert(repo.name));
    } catch (err) {
      setError('An error occurred while fetching repositories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [trie, seenRepos]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        setPage(1);
        searchRepositories(searchTerm, 1);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, searchRepositories]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      setSuggestions(trie.search(searchTerm).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, trie]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      searchRepositories(searchTerm, nextPage);
    }
  }, [loading, hasMore, page, searchTerm, searchRepositories]);

  return {
    searchTerm,
    setSearchTerm,
    repositories,
    suggestions,
    loading,
    error,
    loadMore,
    hasMore,
    totalCount,
  };
}

