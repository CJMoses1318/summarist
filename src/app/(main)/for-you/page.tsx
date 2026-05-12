import { ForYouClient } from "./ForYouClient";
import { fetchBooksCached } from "@/lib/books-api";

export default async function ForYouPage() {
  try {
    const [selectedList, recommended, suggested] = await Promise.all([
      fetchBooksCached("selected"),
      fetchBooksCached("recommended"),
      fetchBooksCached("suggested"),
    ]);

    return (
      <ForYouClient
        selected={selectedList.at(0) ?? null}
        recommended={recommended}
        suggested={suggested}
        error={null}
      />
    );
  } catch {
    return (
      <ForYouClient
        selected={null}
        recommended={[]}
        suggested={[]}
        error="Could not load books."
      />
    );
  }
}
