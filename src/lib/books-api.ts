import type { Book } from "@/types/book";

const API_BASE =
  "https://us-central1-summaristt.cloudfunctions.net";

async function fetchJson(url: string) {
  return fetch(url, { cache: "no-store" });
}

export async function fetchBooks(status: Book["status"]): Promise<Book[]> {
  const url = `${API_BASE}/getBooks?status=${status}`;
  const res = await fetchJson(url);
  if (!res.ok) throw new Error("Failed to load books");
  const data = (await res.json()) as unknown;
  if (status === "selected") {
    return data ? [data as Book] : [];
  }
  return Array.isArray(data) ? (data as Book[]) : [];
}

export async function fetchBookById(id: string): Promise<Book | null> {
  const url = `${API_BASE}/getBook?id=${encodeURIComponent(id)}`;
  const res = await fetchJson(url);
  if (!res.ok) return null;
  return (await res.json()) as Book;
}

export async function searchBooks(query: string): Promise<Book[]> {
  const q = query.trim();
  if (!q) return [];
  const url = `${API_BASE}/getBooksByAuthorOrTitle?search=${encodeURIComponent(q)}`;
  const res = await fetchJson(url);
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  return Array.isArray(data) ? (data as Book[]) : [];
}
