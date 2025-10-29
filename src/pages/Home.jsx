import { useState ,useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import BookList from '../components/BookList';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (q) => {
    setError('');
    setLoading(true);
    try {
      // placeholder: integrate with services/api.js
      // Use q in a simple demo result to avoid unused-variable lint
      setBooks(q ? [{ title: `Results for "${q}"`, author: 'Various' }] : []);
    } catch {
      setError('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };
  return (
    <main>
      <SearchBar onSearch={handleSearch} />
      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      <BookList books={books} />
    </main>
  );
}
