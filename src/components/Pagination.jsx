export default function Pagination({ onNext, onPrev, page, hasMore }) {
  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button onClick={onPrev} disabled={page <= 1} aria-label="Previous page">Prev</button>
      <span className="page-current" aria-current="page">{page}</span>
      <button onClick={onNext} disabled={!hasMore} aria-label="Next page">Next</button>
    </div>
  );
}
