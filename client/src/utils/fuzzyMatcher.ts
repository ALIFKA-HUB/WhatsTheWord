export interface FuzzyMatchOptions {
  maxDistance?: number;
}

/**
 * Normalizes text for Indonesian language matching:
 * - Converts to lowercase
 * - Strips punctuation and special characters
 * - Normalizes whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>@+\\|[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates the Levenshtein distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Determines whether guessed string is a fuzzy match for target string.
 * Default rule:
 * - Length < 4: exact match (tolerance 0)
 * - Length 4-7: tolerance <= 1
 * - Length > 7: tolerance <= 2
 */
export function isFuzzyMatch(
  guessed: string,
  target: string,
  options?: FuzzyMatchOptions
): boolean {
  const normalizedGuessed = normalizeText(guessed);
  const normalizedTarget = normalizeText(target);

  if (normalizedGuessed === normalizedTarget) {
    return true;
  }

  if (!normalizedGuessed || !normalizedTarget) {
    return false;
  }

  const lenGuessed = normalizedGuessed.length;
  const lenTarget = normalizedTarget.length;
  let tolerance = 0;

  if (options && options.maxDistance !== undefined) {
    tolerance = options.maxDistance;
  } else {
    const minLength = Math.min(lenGuessed, lenTarget);
    const maxLength = Math.max(lenGuessed, lenTarget);

    if (minLength < 4) {
      tolerance = 0;
    } else if (maxLength <= 7) {
      tolerance = 1;
    } else {
      tolerance = 2;
    }
  }

  const distance = levenshteinDistance(normalizedGuessed, normalizedTarget);
  return distance <= tolerance;
}

export class FuzzyMatcher {
  static isMatch(guessed: string, target: string, options?: FuzzyMatchOptions): boolean {
    return isFuzzyMatch(guessed, target, options);
  }

  static distance(a: string, b: string): number {
    return levenshteinDistance(normalizeText(a), normalizeText(b));
  }

  static normalize(text: string): string {
    return normalizeText(text);
  }
}
