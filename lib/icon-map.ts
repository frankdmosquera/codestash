import {
  Anchor,
  BookOpen,
  Blocks,
  FileCode2,
  Folder,
  Wrench,
  type LucideIcon,
} from "lucide-react";

// Named (tree-shakeable) imports — deliberately small right now, covering
// only the categories that actually exist. The planned icon picker (any
// lucide-react icon, not just this curated set) needs a different
// resolution strategy to avoid importing the whole ~1500-icon library into
// the client bundle — check `lucide-react/dynamic` (per-icon lazy import
// by name) when building that; don't just widen this map to `import *`.
export const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Anchor,
  Wrench,
  Blocks,
  FileCode2,
};

export const DEFAULT_ICON: LucideIcon = Folder;

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? DEFAULT_ICON;
}
