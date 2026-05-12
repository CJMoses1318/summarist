import { PlayerClient } from "./PlayerClient";
import { fetchBookByIdCached } from "@/lib/books-api";

type PlayerPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function PlayerPage({ params }: PlayerPageProps) {
  const resolved = await Promise.resolve(params);
  const id = typeof resolved.id === "string" ? resolved.id : "";
  const book = id ? await fetchBookByIdCached(id) : null;

  return <PlayerClient key={id} book={book} />;
}
