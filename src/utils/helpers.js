export function getCoverImageUrl(coverId, size = 'M') {
  if (!coverId) return '/book-placeholder.svg';
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
