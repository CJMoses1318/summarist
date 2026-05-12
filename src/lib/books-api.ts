import type { Book } from "@/types/book";

const API_BASE =
  "https://us-central1-summaristt.cloudfunctions.net";

const BOOK_CLIENT_CACHE_TTL_MS = 5 * 60 * 1000;
const bookClientCache = new Map<string, { expires: number; book: Book | null }>();
const bookClientInflight = new Map<string, Promise<Book | null>>();

async function fetchJson(url: string, init?: RequestInit) {
  return fetch(url, { cache: "no-store", ...init });
}

/** Avoids `res.json()` throwing on empty bodies (Unexpected end of JSON input). */
async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

/** Normalizes `getBooks?status=selected` payload: single object or one-element array. */
function selectedBooksFromPayload(data: unknown): Book[] {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return [first as Book];
    }
    return [];
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return [data as Book];
  }
  return [];
}

/**
 * Server Components only: cached at the data layer so repeat visits and
 * navigations avoid hitting Cloud Functions on every request.
 */
export async function fetchBookByIdCached(id: string): Promise<Book | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;
  const url = `${API_BASE}/getBook?id=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await parseJsonBody(res);
  return data && typeof data === "object" ? (data as Book) : null;
}

export async function fetchBooks(status: Book["status"]): Promise<Book[]> {
  const url = `${API_BASE}/getBooks?status=${status}`;
  const res = await fetchJson(url);
  if (!res.ok) throw new Error("Failed to load books");
  const data = await parseJsonBody(res);
  if (status === "selected") {
    return selectedBooksFromPayload(data);
  }
  return Array.isArray(data) ? (data as Book[]) : [];
}

/** Server Components: same shape as {@link fetchBooks} with HTTP caching. */
export async function fetchBooksCached(status: Book["status"]): Promise<Book[]> {
  const url = `${API_BASE}/getBooks?status=${status}`;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) throw new Error("Failed to load books");
  const data = await parseJsonBody(res);
  if (status === "selected") {
    return selectedBooksFromPayload(data);
  }
  return Array.isArray(data) ? (data as Book[]) : [];
}

async function fetchBookByIdUncached(id: string): Promise<Book | null> {
  const url = `${API_BASE}/getBook?id=${encodeURIComponent(id)}`;
  const res = await fetchJson(url);
  if (!res.ok) return null;
  const data = await parseJsonBody(res);
  return data && typeof data === "object" ? (data as Book) : null;
}

/** Client (and fallback): dedupes in-flight requests and short-TTL memoizes results. */
export async function fetchBookById(id: string): Promise<Book | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;

  const now = Date.now();
  const cached = bookClientCache.get(trimmed);
  if (cached && cached.expires > now) {
    return cached.book;
  }

  let inflight = bookClientInflight.get(trimmed);
  if (!inflight) {
    inflight = (async () => {
      const book = await fetchBookByIdUncached(trimmed);
      bookClientCache.set(trimmed, {
        book,
        expires: Date.now() + BOOK_CLIENT_CACHE_TTL_MS,
      });
      bookClientInflight.delete(trimmed);
      return book;
    })();
    bookClientInflight.set(trimmed, inflight);
  }

  return inflight;
}

export async function searchBooks(query: string): Promise<Book[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `${API_BASE}/getBooksByAuthorOrTitle?search=${encodeURIComponent(q)}`;
  const res = await fetchJson(url);
  if (!res.ok) return [];
  const data = await parseJsonBody(res);
  return Array.isArray(data) ? (data as Book[]) : [];
}
