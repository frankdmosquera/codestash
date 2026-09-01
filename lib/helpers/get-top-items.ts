// get-top-items.ts
// → helpers/get-top-items.ts

interface WithRecency {
  createdAt?: string;
}

/**
 * Returns up to `count` items: most recent first, then fills any
 * remaining slots randomly from items with no recency signal.
 * If there aren't enough items to reach `count`, just returns what exists.
 */
export function getTopItems<T extends WithRecency>(items: T[], count = 8): T[] {
  if (items.length <= count) return items;

  const dated = items.filter((item) => item.createdAt);
  const undated = items.filter((item) => !item.createdAt);

  const sortedByRecency = [...dated].sort(
    (a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
  );

  if (sortedByRecency.length >= count) {
    return sortedByRecency.slice(0, count);
  }

  const remainingSlots = count - sortedByRecency.length;
  return [...sortedByRecency, ...shuffle(undated).slice(0, remainingSlots)];
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
