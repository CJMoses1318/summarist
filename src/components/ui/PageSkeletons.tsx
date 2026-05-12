import { SkeletonBlock } from "@/components/ui/Skeleton";

import styles from "./PageSkeletons.module.css";

function TileCardSkeleton() {
  return (
    <div className={styles.tileCard} aria-hidden>
      <SkeletonBlock height={150} width={100} style={{ marginBottom: 0, borderRadius: 8 }} />
      <SkeletonBlock height={16} width="100%" style={{ maxWidth: 180, marginBottom: 0 }} />
      <SkeletonBlock height={13} width="72%" style={{ maxWidth: 120, marginBottom: 0 }} />
      <SkeletonBlock height={12} width="60%" style={{ marginBottom: 0 }} />
    </div>
  );
}

/** For-you layout: selected banner + two horizontal shelves */
export function ForYouPageSkeleton() {
  return (
    <main className="pagePad" aria-busy aria-label="Loading recommendations">
      <div className={styles.sectionTitleBar}>
        <SkeletonBlock height={22} width="72%" />
      </div>
      <div className={styles.selectedBanner}>
        <SkeletonBlock height={168} style={{ marginBottom: 0 }} />
      </div>

      <div style={{ marginTop: 28 }}>
        <div className={styles.sectionTitleBar}>
          <SkeletonBlock height={22} width="55%" />
        </div>
        <div className={styles.subTitleBar}>
          <SkeletonBlock height={15} width="48%" />
        </div>
        <div className={styles.booksTrack}>
          <TileCardSkeleton />
          <TileCardSkeleton />
          <TileCardSkeleton />
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className={styles.sectionTitleBar}>
          <SkeletonBlock height={22} width="42%" />
        </div>
        <div className={styles.subTitleBar}>
          <SkeletonBlock height={15} width="38%" />
        </div>
        <div className={styles.booksTrack}>
          <TileCardSkeleton />
          <TileCardSkeleton />
          <TileCardSkeleton />
        </div>
      </div>
    </main>
  );
}

/** Book detail hero + about section */
export function BookDetailPageSkeleton() {
  return (
    <main className="bookDetailPage pagePad" aria-busy aria-label="Loading book">
      <div className={styles.bookHero}>
        <div className={styles.bookHeroText}>
          <SkeletonBlock height={34} width="90%" />
          <SkeletonBlock height={20} width="40%" style={{ marginTop: 4 }} />
          <SkeletonBlock height={16} width="100%" style={{ marginTop: 14 }} />
          <div className={styles.metaRow}>
            <SkeletonBlock height={22} width={88} style={{ marginBottom: 0, borderRadius: 6 }} />
            <SkeletonBlock height={22} width={88} style={{ marginBottom: 0, borderRadius: 6 }} />
            <SkeletonBlock height={22} width={88} style={{ marginBottom: 0, borderRadius: 6 }} />
          </div>
          <div className={styles.actionsRow}>
            <SkeletonBlock height={44} width={118} style={{ marginBottom: 0, borderRadius: 8 }} />
            <SkeletonBlock height={44} width={118} style={{ marginBottom: 0, borderRadius: 8 }} />
          </div>
          <SkeletonBlock height={18} width={220} style={{ marginTop: 16 }} />
        </div>
        <div className={styles.bookCoverCol}>
          <SkeletonBlock
            height={300}
            width={200}
            className={styles.bookCover}
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>
      <section style={{ marginTop: 28 }}>
        <SkeletonBlock height={22} width={200} />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <SkeletonBlock height={32} width={72} style={{ marginBottom: 0, borderRadius: 999 }} />
          <SkeletonBlock height={32} width={88} style={{ marginBottom: 0, borderRadius: 999 }} />
          <SkeletonBlock height={32} width={64} style={{ marginBottom: 0, borderRadius: 999 }} />
        </div>
        <SkeletonBlock height={14} style={{ marginTop: 14 }} />
        <SkeletonBlock height={14} />
        <SkeletonBlock height={14} width="92%" />
        <SkeletonBlock height={14} width="88%" />
        <SkeletonBlock height={14} width="70%" />
      </section>
    </main>
  );
}

/** Reader + fixed audio dock placeholder */
export function PlayerPageSkeleton() {
  return (
    <div className="playerPage" aria-busy aria-label="Loading player">
      <main className="playerPage__reader pagePad">
        <SkeletonBlock height={30} width="85%" style={{ maxWidth: 560 }} />
        <div className="playerPage__rule" aria-hidden />
        <div className={styles.playerLines}>
          <SkeletonBlock height={14} />
          <SkeletonBlock height={14} />
          <SkeletonBlock height={14} width="96%" />
          <SkeletonBlock height={14} width="94%" />
          <SkeletonBlock height={14} width="88%" />
          <SkeletonBlock height={14} width="72%" />
        </div>
      </main>
      <div className={styles.audioDockSk} aria-hidden>
        <SkeletonBlock height={56} width={56} style={{ marginBottom: 0, borderRadius: 8 }} />
        <div className={styles.audioDockBars}>
          <SkeletonBlock height={10} width="45%" style={{ marginBottom: 0 }} />
          <SkeletonBlock height={6} width="100%" style={{ marginBottom: 0 }} />
        </div>
      </div>
    </div>
  );
}

export function LibraryPageSkeleton() {
  return (
    <main className="pagePad" aria-busy aria-label="Loading library">
      <SkeletonBlock height={28} width={160} />
      <SkeletonBlock height={14} width="100%" style={{ maxWidth: 520, marginTop: 8 }} />
      <SkeletonBlock height={14} width="85%" style={{ maxWidth: 480 }} />
      <div style={{ marginTop: 28 }}>
        <SkeletonBlock height={22} width={140} />
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.libraryRow}>
            <SkeletonBlock height={132} width={88} style={{ marginBottom: 0, borderRadius: 6 }} />
            <div className={styles.libraryLines}>
              <SkeletonBlock height={18} width="75%" />
              <SkeletonBlock height={14} width="40%" style={{ marginTop: 8 }} />
              <SkeletonBlock height={12} width="90%" style={{ marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <SkeletonBlock height={22} width={160} />
        <div className={styles.libraryRow} style={{ marginTop: 12 }}>
          <SkeletonBlock height={132} width={88} style={{ marginBottom: 0, borderRadius: 6 }} />
          <div className={styles.libraryLines}>
            <SkeletonBlock height={18} width="70%" />
            <SkeletonBlock height={14} width="36%" style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>
    </main>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div aria-busy aria-label="Searching">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={styles.searchRow}>
          <SkeletonBlock height={66} width={44} style={{ marginBottom: 0, borderRadius: 6 }} />
          <div className={styles.searchText}>
            <SkeletonBlock height={15} width="78%" style={{ marginBottom: 8 }} />
            <SkeletonBlock height={13} width="52%" style={{ marginBottom: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Matches choose-plan pricing panel while Firebase initializes */
export function ChoosePlanPageSkeleton() {
  return (
    <main className="plan" aria-busy aria-label="Loading">
      <div className="wrapper wrapper__full">
        <div className={styles.planHeader}>
          <SkeletonBlock height={28} width="100%" style={{ marginBottom: 12 }} />
          <SkeletonBlock height={18} width="85%" />
          <SkeletonBlock height={200} style={{ marginTop: 20, borderRadius: 12 }} />
        </div>
        <div className={styles.planCards}>
          <SkeletonBlock height={96} className={styles.planCard} />
          <SkeletonBlock height={96} className={styles.planCard} />
          <SkeletonBlock height={48} width={200} style={{ marginTop: 8 }} />
        </div>
        <SkeletonBlock height={14} width="70%" style={{ marginTop: 24 }} />
        <SkeletonBlock height={14} width="55%" />
      </div>
    </main>
  );
}

/** Settings shell: heading + sections */
export function SettingsPageSkeleton() {
  return (
    <main className="settingsPage pagePad" aria-busy aria-label="Loading settings">
      <SkeletonBlock height={36} width={180} />
      <SkeletonBlock height={2} width="100%" style={{ marginBottom: 18, borderRadius: 0 }} />
      <SkeletonBlock height={18} width={220} />
      <SkeletonBlock height={22} width={120} style={{ marginTop: 8 }} />
      <SkeletonBlock height={44} width={200} style={{ marginTop: 14 }} />
      <SkeletonBlock height={1} width="100%" style={{ margin: "22px 0", borderRadius: 0, opacity: 0.5 }} />
      <SkeletonBlock height={18} width={80} />
      <SkeletonBlock height={20} width="85%" style={{ marginTop: 8 }} />
    </main>
  );
}
