import { useState, useEffect } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await window.electronAPI.search.query(query);
        
        // 🟢 LA CORRECTION EST ICI : On vérifie "response.ok" et on prend "response.data"
        if (response.ok) {
          setResults(response.data);
        } else {
          console.error("Erreur du backend :", response.error);
          setResults([]);
        }
        
      } catch (error) {
        console.error("Erreur de recherche IPC:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return { query, setQuery, results, isSearching };
}