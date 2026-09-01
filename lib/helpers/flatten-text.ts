// Flattens **bold**/`code` markers out of a string, for plain-text search matching.
export function flattenText(text: string): string {
  return text.replace(/\*\*|`/g, "");
}
