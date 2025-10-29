import { getCoverImageUrl } from '../utils/helpers';

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7.5-4.873-10-7.2C-0.5 10.8 3 6 7 6c2.1 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 4 0 7.5 4.8 5 7.8C19.5 16.127 12 21 12 21z"
        fill={filled ? '#e11d48' : 'none'}
        stroke="#e11d48"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export default function BookCard({ book, onOpen, onToggleFavorite, isFavorite = false }) {
  if (!book) return null;

  // Normalize fields from OpenLibrary different response shapes
  const workKey = book.key || book.cover_edition_key || book.id || '';
  const workId = typeof workKey === 'string' ? workKey.replace('/works/', '').replace('/books/', '') : workKey;
  const coverId = book.cover_i || book.cover_id || (book.cover ? null : null);
  const cover = getCoverImageUrl(coverId);
  const title = book.title || book.title_suggest || 'Untitled';

  // Derive author names (array) from multiple possible shapes returned by OpenLibrary
  const deriveAuthors = (b) => {
    if (!b) return [];
    let names = [];
    if (Array.isArray(b.author_name) && b.author_name.length) names = names.concat(b.author_name);
    if (typeof b.by_statement === 'string' && b.by_statement.trim()) names.push(b.by_statement.replace(/^by\s+/i, '').trim());
    if (Array.isArray(b.authors) && b.authors.length) {
      const aNames = b.authors.map((a) => {
        if (!a) return null;
        if (typeof a === 'string') return a;
        if (a.name) return a.name;
        if (a.author && a.author.name) return a.author.name;
        return null;
      }).filter(Boolean);
      names = names.concat(aNames);
    }
    if (Array.isArray(b.contributors) && b.contributors.length) {
      const cNames = b.contributors.map((c) => c.name || null).filter(Boolean);
      names = names.concat(cNames);
    }
    if (b.author && typeof b.author === 'string') names.push(b.author);
    // dedupe
    names = Array.from(new Set(names));
    return names;
  };

  const authors = deriveAuthors(book);
  const year = book.first_publish_year || book.first_publish || book.publish_year?.[0] || '';
  const excerpt = book.first_sentence || book.description || book.subtitle || '';

  return (
    <article className="book-card" aria-labelledby={`title-${workId}`} tabIndex={0}>
      <div className="cover-wrap">
        <img className="cover-img" src={cover} alt={title} />
        <button
          className={`fav-btn ${isFavorite ? 'fav--active' : ''}`}
          onClick={() => onToggleFavorite && onToggleFavorite(book)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      </div>

      <div className="book-info">
        <h3 id={`title-${workId}`} className="book-title" title={title}>{title}</h3>
        <p className="book-author" title={authors && authors.length ? authors.join(', ') : undefined}>
          {authors && authors.length ? (
            <>
              <span className="author-badge">{authors[0].split(' ').map(s => s[0]).slice(0,2).join('')}</span>
              <span className="author-text">{authors[0]}</span>
            </>
          ) : (
            <><span className="author-badge">A</span><span className="author-text">Unknown</span></>
          )}
        </p>
        <div className="meta-row">
          {year && <span className="publish-year">{year}</span>}
        </div>

        {excerpt && <p className="book-excerpt">{typeof excerpt === 'string' ? excerpt : (excerpt.value || '')}</p>}

        <div className="card-actions">
          <button className="btn btn-primary" style={{width: '100%'}} onClick={() => onOpen && onOpen(workId)} aria-label={`Open details for ${title}`}>
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
