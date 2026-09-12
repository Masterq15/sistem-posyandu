/**
 * In-Memory Search Index (Search by Index)
 * Tokenizes searchable fields and generates prefix index maps
 * for sub-millisecond O(1) query lookups without sequential scans.
 */

export class SearchIndex<T> {
  private items: T[] = [];
  // Token map: token / prefix -> Set of indices in `items` array
  private index: Map<string, Set<number>> = new Map();
  private getFields: (item: T) => (string | number | null | undefined)[];

  constructor(getFields: (item: T) => (string | number | null | undefined)[]) {
    this.getFields = getFields;
  }

  /**
   * Set source items and build the token/prefix index
   */
  public setSource(items: T[]) {
    this.items = items;
    this.rebuild();
  }

  public getItems(): T[] {
    return this.items;
  }

  private rebuild() {
    this.index.clear();

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const fields = this.getFields(item);
      const itemTokens = new Set<string>();

      for (const field of fields) {
        if (field === null || field === undefined) continue;
        const normalized = String(field).toLowerCase().trim();
        if (!normalized) continue;

        // 1. Split text into individual words
        const words = normalized.split(/[\s,./\-_|()]+/);

        for (const word of words) {
          if (!word) continue;
          itemTokens.add(word);

          // Index prefixes for instant typeahead / prefix matching (e.g. "ahm" -> "ahmad")
          const maxLen = Math.min(word.length, 25);
          for (let len = 1; len <= maxLen; len++) {
            itemTokens.add(word.substring(0, len));
          }
        }

        // 2. Numerical sequences (e.g. NIK, No HP, Usia)
        const digitStr = normalized.replace(/\D/g, "");
        if (digitStr.length >= 2) {
          itemTokens.add(digitStr);
          for (let len = 2; len <= digitStr.length; len++) {
            itemTokens.add(digitStr.substring(0, len));
          }
        }
      }

      // Map each token to this item index
      for (const token of itemTokens) {
        let set = this.index.get(token);
        if (!set) {
          set = new Set<number>();
          this.index.set(token, set);
        }
        set.add(i);
      }
    }
  }

  /**
   * Search by query string using index map.
   * Multi-word queries perform rapid Set intersection.
   */
  public search(query: string): T[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.items;

    const queryTokens = q.split(/[\s,./\-_|()]+/).filter(Boolean);
    if (queryTokens.length === 0) return this.items;

    let matchingIndices: Set<number> | null = null;

    for (const token of queryTokens) {
      let tokenMatches = this.index.get(token);

      // If token not found in prefix index, perform substring match
      if (!tokenMatches || tokenMatches.size === 0) {
        const fallbackMatches = new Set<number>();
        for (let i = 0; i < this.items.length; i++) {
          const fields = this.getFields(this.items[i]);
          const found = fields.some((f) => {
            if (f === null || f === undefined) return false;
            return String(f).toLowerCase().includes(token);
          });
          if (found) {
            fallbackMatches.add(i);
          }
        }
        if (fallbackMatches.size === 0) {
          return []; // Token not found in any record
        }
        tokenMatches = fallbackMatches;
      }

      if (matchingIndices === null) {
        matchingIndices = new Set(tokenMatches);
      } else {
        // Set intersection
        const next = new Set<number>();
        for (const idx of matchingIndices) {
          if (tokenMatches.has(idx)) {
            next.add(idx);
          }
        }
        matchingIndices = next;
        if (matchingIndices.size === 0) return [];
      }
    }

    if (!matchingIndices || matchingIndices.size === 0) return [];

    const result: T[] = [];
    for (const idx of matchingIndices) {
      result.push(this.items[idx]);
    }
    return result;
  }
}
