import { useState, useEffect } from 'react';
import BookCard from './BookCard';

export default function Favorites({ onOpen, items: propItems, onToggleFavorite }) {
  const [items, setItems] = useState(propItems || []);

  // If parent passes items keep in sync, otherwise read from localStorage once
  useEffect(() => {
    if (Array.isArray(propItems)) {
      setItems(propItems);
      return;
    }
    try {
      const raw = localStorage.getItem('bf:favorites');
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [propItems]);

  if (!items || items.length === 0) return <p>No favorites yet.</p>;

  return (
    <div className="book-list favorites-list">
      {items.map((b, idx) => (
        <BookCard
          key={b.key || b.cover_edition_key || idx}
          book={b}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
          isFavorite={true}
        />
      ))}
    </div>
  );
}
