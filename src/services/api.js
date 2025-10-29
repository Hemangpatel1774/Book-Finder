const BASE = 'https://openlibrary.org';

// Search the OpenLibrary. type can be: 'title' (default), 'author', 'subject', or 'all'
export async function searchBooks(query, { page = 1, type = 'title' } = {}) {
  if (!query) return { docs: [], numFound: 0 };
  const q = encodeURIComponent(query);
  let url;
  if (type === 'author') {
    url = `${BASE}/search.json?author=${q}&page=${page}`;
  } else if (type === 'subject') {
    // subject search uses a different endpoint
    url = `${BASE}/subjects/${q}.json?limit=50&offset=${(page - 1) * 50}`;
  } else {
    // title or default
    url = `${BASE}/search.json?title=${q}&page=${page}`;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function getWorkById(workId) {
  const res = await fetch(`${BASE}/works/${workId}.json`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

export async function getAuthorById(authorId) {
  const res = await fetch(`${BASE}/authors/${authorId}.json`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}

// Helper to fetch subject details (optional)
export async function getSubject(subject) {
  const res = await fetch(`${BASE}/subjects/${encodeURIComponent(subject)}.json`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}
