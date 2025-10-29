import { useState, useEffect, useRef, useCallback } from 'react';
import { searchBooks } from '../services/api';

// Hook that supports debounced search, pagination and load more
export default function useFetchBooks({ initialQuery = '', initialType = 'title', debounceMs = 500 } = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(0);
  const timeoutRef = useRef(null);
  const lastFetchRef = useRef({ q: '', t: '', p: 1 });

  const fetchFor = useCallback(async (q, opts = {}) => {
    const { page: p = 1, type: ty = type } = opts;
    setLoading(true);
    setError(null);
    try {
      const result = await searchBooks(q, { page: p, type: ty });
      // OpenLibrary returns different shapes for subjects vs search. Normalize to docs array.
      let docs = [];
      if (!result) docs = [];
      else if (result.docs) docs = result.docs;
      else if (result.works) docs = result.works; // subject endpoint
      else docs = [];

      // Set pagination metadata when available
      let totalResults = 0;
      let pageSize = docs.length;
      if (result && typeof result.numFound === 'number') totalResults = result.numFound;
      if (result && typeof result.work_count === 'number') totalResults = result.work_count;
      // For subject endpoint, the page size is controlled by our 'limit' param (50)
      if (ty === 'subject') pageSize = result.works ? result.works.length : pageSize;
      setTotal(totalResults);
      setPerPage(pageSize || 0);

      // For regular page navigation we replace the current page results.
      // loadMore will explicitly append when requested.
      setBooks(docs);
      lastFetchRef.current = { q, t: ty, p };
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [type]);

  // Debounced query effect
  useEffect(() => {
    if (!query) {
      setBooks([]);
      setError(null);
      setPage(1);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchFor(query, { page: 1, type });
    }, debounceMs);

    return () => clearTimeout(timeoutRef.current);
  }, [query, type, debounceMs, fetchFor]);
  useEffect(() => {
    console.log(books);
  }, [books])
  
  const loadMore = useCallback(() => {
    if (perPage > 0 && total > 0) {
      const maxPage = Math.ceil(total / perPage);
      if (page >= maxPage) return;
    }
    const next = page + 1;
    // Append next page results to current list
    setLoading(true);
    (async () => {
      try {
        const q = query || lastFetchRef.current.q;
        const result = await searchBooks(q, { page: next, type });
        let docs = [];
        if (!result) docs = [];
        else if (result.docs) docs = result.docs;
        else if (result.works) docs = result.works;

        // update metadata
        let totalResults = total;
        let pageSize = docs.length;
        if (result && typeof result.numFound === 'number') totalResults = result.numFound;
        if (result && typeof result.work_count === 'number') totalResults = result.work_count;
        if (type === 'subject') pageSize = result.works ? result.works.length : pageSize;
        setTotal(totalResults);
        setPerPage(pageSize || 0);

        setBooks((prev) => [...prev, ...docs]);
        setPage(next);
        lastFetchRef.current = { q, t: type, p: next };
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [page, fetchFor, query, type, perPage, total]);

  const gotoPage = useCallback((p) => {
    if (!p || p < 1) return;
    setPage(p);
    fetchFor(query || lastFetchRef.current.q, { page: p, type });
  }, [fetchFor, query, type]);

  const prevPage = useCallback(() => {
    if (page <= 1) return;
    const prev = page - 1;
    setPage(prev);
    fetchFor(query || lastFetchRef.current.q, { page: prev, type });
  }, [page, fetchFor, query, type]);

  const reset = useCallback(() => {
    setQuery('');
    setBooks([]);
    setPage(1);
    setError(null);
  }, []);

  const hasMore = perPage > 0 ? (page * perPage) < total : false;
  return { query, setQuery, type, setType, page, books, loading, error, loadMore, gotoPage, prevPage, hasMore, total, perPage, reset };
}
