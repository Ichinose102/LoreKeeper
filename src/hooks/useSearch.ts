import { useState, useEffect } from 'react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: string;
  score: number;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data: ApiResponse<SearchResult[]> = await response.json();

        if (data.ok) {
          setResults(data.data ?? []);
        } else {
          console.error("Erreur du backend :", data.error);
          setResults([]);
        }

      } catch (error) {
        console.error("Erreur de recherche:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return { query, setQuery, results, isSearching };
}