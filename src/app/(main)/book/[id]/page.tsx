import { BookDetailClient } from "./BookDetailClient";
import { fetchBookByIdCached } from "@/lib/books-api";

type BookPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function BookDetailPage({ params }: BookPageProps) {
  const resolved = await Promise.resolve(params);
  const id = typeof resolved.id === "string" ? resolved.id : "";
  const book = id ? await fetchBookByIdCached(id) : null;

  return <BookDetailClient key={id} book={book} />;
}
