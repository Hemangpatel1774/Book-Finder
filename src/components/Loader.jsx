export default function Loader() {
  return (
    <div className="loader loader-center" role="status" aria-live="polite">
      <div className="book-loader" aria-hidden="true">
        <div className="book">
          <div className="page front" />
          <div className="page middle" />
          <div className="page back" />
        </div>
      </div>
      <span className="loader-label">Loading books…</span>
    </div>
  );
}
