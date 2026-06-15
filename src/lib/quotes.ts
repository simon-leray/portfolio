/**
 * Replace straight/smart quotation marks with Swiss guillemets.
 * Straight single quotes are left alone to avoid breaking apostrophes.
 */
export function replaceQuotes(text: string): string {
  if (!text) return text;
  return text
    // Straight double quotes → « »
    .replace(/"([^"]*)"/g, '« $1 »')
    // Smart/curly double quotes " " → « »
    .replace(/“([^”]*)”/g, '« $1 »')
    // German low-9 opening „ with closing " → « »
    .replace(/„([^“”]*)”/g, '« $1 »')
    // Smart/curly single quotes ' ' → ‹ ›
    .replace(/‘([^’]*)’/g, '‹ $1 ›');
}

/**
 * Walk a Portable Text block array and apply replaceQuotes to every text span.
 * Call this before passing a PT value to <PortableText>.
 */
export function replaceQuotesInPtBlocks(blocks: unknown[]): unknown[] {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((block) => {
    const b = block as Record<string, unknown>;
    if (b._type !== 'block') return block;
    return {
      ...b,
      children: Array.isArray(b.children)
        ? b.children.map((child) => {
            const c = child as Record<string, unknown>;
            if (c._type !== 'span' || typeof c.text !== 'string') return child;
            return { ...c, text: replaceQuotes(c.text) };
          })
        : b.children,
    };
  });
}
