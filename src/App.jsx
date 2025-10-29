import { useState, useCallback, useEffect } from 'react';
import './styles/components.css';
import SearchBar from './components/SearchBar';
import BookList from './components/BookList';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import Favorites from './components/Favorites';
import Modal from './components/Modal';
import useFetchBooks from './hooks/useFetchBooks';
import { getWorkById, getAuthorById } from './services/api';
import { getCoverImageUrl } from './utils/helpers';
import Pagination from './components/Pagination';

export default function App() {
  const [view, setView] = useState('search'); // 'search' | 'favorites'
  const { query, setQuery, type, setType, books, loading, error, gotoPage, prevPage, hasMore, page, total, perPage } = useFetchBooks({ debounceMs: 500 });
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bf:favorites') || '[]'); } catch { return []; }
  });

  const saveFavorites = (next) => {
    setFavorites(next);
    localStorage.setItem('bf:favorites', JSON.stringify(next));
  };

  const toggleFavorite = useCallback((book) => {
    const key = book.key || book.cover_edition_key || book.id;
    const exists = favorites.some((f) => (f.key || f.cover_edition_key || f.id) === key);
    const next = exists ? favorites.filter((f) => (f.key || f.cover_edition_key || f.id) !== key) : [book, ...favorites];
    saveFavorites(next);
  }, [favorites]);

  const openDetails = useCallback(async (workId) => {
    if (!workId) return;
    setModalOpen(true);
    setDetail({ loading: true });
    try {
      const w = await getWorkById(workId);
      // fetch first author details (if available)
      let author = null;
      if (Array.isArray(w.authors) && w.authors[0] && w.authors[0].author?.key) {
        const aid = w.authors[0].author.key.replace('/authors/', '');
        try {
          author = await getAuthorById(aid);
        } catch (e) {
          // Non-fatal: author details are optional
          console.debug('author fetch failed', e);
        }
      }
      setDetail({ loading: false, work: w, author });
    } catch (err) {
      setDetail({ loading: false, error: err.message || String(err) });
    }
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setDetail(null);
  };

  const deriveAuthorsFromWork = (work, firstAuthor) => {
    const out = [];
    if (!work) return out;
    // prefer the fetched author details if available
    if (firstAuthor && firstAuthor.name) out.push({ name: firstAuthor.name, key: firstAuthor.key || null });
    if (Array.isArray(work.authors)) {
      work.authors.forEach((a) => {
        if (!a) return;
        if (a.name) out.push({ name: a.name, key: a.key || null });
        else if (a.author && a.author.name) out.push({ name: a.author.name, key: a.author.key || null });
        // skip entries that only have a key but no name — we only want author names
      });
    }
    // dedupe by name/key
    const seen = new Set();
    return out.filter((it) => {
      const id = (it.name || '') + '::' + (it.key || '');
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  // On mount, set an initial random subject so the grid isn't empty.
  // Run only once — do not re-run when the user clears the search.
  useEffect(() => {
    if (query) return; // if user already typed something, don't override
    const subjects = ['fiction', 'fantasy', 'mystery', 'science_fiction', 'history', 'romance', 'thriller', 'children', 'biography', 'science'];
    const pick = subjects[Math.floor(Math.random() * subjects.length)];
    setType('subject');
    setQuery(pick);
    // Intentionally run this effect only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app container">
      <header className="app-header">
        <h1>Book Finder</h1>
        <nav>
          <button onClick={() => setView('search')} className={view === 'search' ? 'active' : ''}>Search</button>
          <button onClick={() => setView('favorites')} className={view === 'favorites' ? 'active' : ''}>Favorites ({favorites.length})</button>
        </nav>
      </header>

      {view === 'search' && (
        <section>
          <SearchBar value={query} onChange={setQuery} type={type} onTypeChange={setType} />
          {loading && <Loader />}
          {error && <ErrorMessage message={error} />}
          <BookList books={books} loading={loading} onOpen={openDetails} onToggleFavorite={toggleFavorite} favorites={favorites} />
          {books && books.length > 0 && (
            <div className='pagination-main'>
              <Pagination onNext={() => gotoPage(page + 1)} onPrev={prevPage} page={page} hasMore={hasMore} />
              {perPage > 0 && total > 0 && (
                <div className="pager-info">Page {page} of {Math.ceil(total / perPage)}</div>
              )}
            </div>
          )}
        </section>
      )}

      {view === 'favorites' && (
        <section className="favorites-section">
          <h2>Your favorites</h2>
          <Favorites onOpen={openDetails} items={favorites} onToggleFavorite={toggleFavorite} />
        </section>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={detail?.work?.title || 'Details'}>
        {detail?.loading && <Loader />}
        {detail?.error && <ErrorMessage message={detail.error} />}
        {detail?.work && (
          <div className="details">
            <div className="details-cover">
              <img src={getCoverImageUrl(detail.work.covers?.[0], 'L')} alt={detail.work.title} />
            </div>
            <div className="details-meta">
              <h2 className="details-title">{detail.work.title}</h2>
              {(() => {
                const authors = deriveAuthorsFromWork(detail.work, detail.author);
                const first = authors && authors.length ? authors[0].name : null;
                return (
                  <p className="details-author" title={authors && authors.length ? authors.map(a => a.name).join(', ') : undefined}>
                    {first ? (
                      <>
                        <span className="details-author-avatar">{first.split(' ').map(s => s[0]).slice(0,2).join('')}</span>
                        <span className="details-author-name">{first}</span>
                      </>
                    ) : (
                      <><span className="details-author-avatar">A</span><span className="details-author-name">Unknown</span></>
                    )}
                  </p>
                );
              })()}
              {detail.work.subtitle && <p className="details-subtitle">{detail.work.subtitle}</p>}
              {detail.work.description && (
                <div className="details-description">{typeof detail.work.description === 'string' ? detail.work.description : detail.work.description.value}</div>
              )}

              {detail.work.subjects && (
                <div className="details-subjects">
                  <strong>Subjects</strong>
                  <ul>{detail.work.subjects.slice(0, 12).map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              )}

              <div className="details-actions">
                <a className="btn btn-ghost" href={`https://openlibrary.org${detail.work.key}`} target="_blank" rel="noreferrer">Open on OpenLibrary</a>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
