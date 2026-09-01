import type { Snippet } from "../types";

export const groupBy: Snippet = {
  slug: "group-by",
  title: "groupBy",
  description:
    "Groups an array of items into a record keyed by the result of a selector function.",
  createdAt: "2026-08-29",
  code: `function groupBy<T, K extends PropertyKey>(
  items: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

const users = [
  { name: "Ann", role: "admin" },
  { name: "Bo", role: "user" },
  { name: "Cy", role: "admin" },
];

groupBy(users, (u) => u.role);
// { admin: [Ann, Cy], user: [Bo] }
`,
};
