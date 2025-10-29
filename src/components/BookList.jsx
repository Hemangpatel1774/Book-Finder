import BookCard from './BookCard';
// import emptyIllustration from '../assets/images/empty-illustration.svg';
import emptyIllustration from '../assets/images/robot-finding-data.svg';

export default function BookList({ books = [], loading = false, onOpen, onToggleFavorite, favorites = [] }) {
  if (loading) return null; // Loader is shown by parent while fetching
  if (!books || books.length === 0) {
    return (
      <div className="empty-state">
        <img src={emptyIllustration} alt="No results" className="empty-illustration" />
        <div className="empty-text">
          <h3>No results found</h3>
          <p>Try searching a different title, author, or subject.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-list">
      {books.map((b, idx) => (
        <BookCard
          key={b.key || b.cover_edition_key || b.id || idx}
          book={b}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.some((f) => (f.key || f.cover_edition_key || f.id) === (b.key || b.cover_edition_key || b.id))}
        />
      ))}
    </div>
  );
}
