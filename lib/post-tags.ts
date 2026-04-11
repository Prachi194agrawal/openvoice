const MAX_TAGS = 20;
const MAX_TAG_LEN = 40;
const MAX_HASHTAGS = 30;
const MAX_HASHTAG_LEN = 60;

function normalizeTag(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_TAG_LEN);
}

/** Free-form labels (no leading # required). */
export function parseTagsInput(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of input.split(/[\s,]+/)) {
    const t = normalizeTag(part);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

/** Store without #; lowercase slug. */
export function parseHashtagsInput(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of input.split(/[\s,]+/)) {
    let t = part.trim().toLowerCase();
    if (t.startsWith("#")) t = t.slice(1);
    t = t.replace(/[^a-z0-9_-]/g, "");
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t.slice(0, MAX_HASHTAG_LEN));
    if (out.length >= MAX_HASHTAGS) break;
  }
  return out;
}
