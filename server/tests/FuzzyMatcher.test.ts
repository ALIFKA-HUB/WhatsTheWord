import { describe, it, expect } from 'vitest';
import { FuzzyMatcher, isFuzzyMatch, levenshteinDistance, normalizeText } from '../src/engine/FuzzyMatcher.js';

describe('FuzzyMatcher', () => {
  describe('normalizeText', () => {
    it('should convert text to lowercase and trim spaces', () => {
      expect(normalizeText('  Kopi  ')).toBe('kopi');
      expect(normalizeText('MIE AYAM')).toBe('mie ayam');
    });

    it('should remove punctuation and special characters', () => {
      expect(normalizeText('kucing!')).toBe('kucing');
      expect(normalizeText('lumba-lumba')).toBe('lumbalumba');
      expect(normalizeText('teh, botol.')).toBe('teh botol');
    });

    it('should collapse multiple spaces into a single space', () => {
      expect(normalizeText('mie   goreng   spesial')).toBe('mie goreng spesial');
    });
  });

  describe('levenshteinDistance', () => {
    it('should calculate distance 0 for identical strings', () => {
      expect(levenshteinDistance('kopi', 'kopi')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('should calculate distance for single edit operations', () => {
      expect(levenshteinDistance('kopi', 'topi')).toBe(1); // substitution
      expect(levenshteinDistance('kopi', 'kpi')).toBe(1);  // deletion
      expect(levenshteinDistance('kopi', 'kopis')).toBe(1); // insertion
    });

    it('should calculate distance for complex differences', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('martabak', 'terangbulan')).toBe(8);
    });
  });

  describe('isFuzzyMatch', () => {
    describe('Short strings (length < 4): exact match only', () => {
      it('should match exact strings regardless of casing and whitespace', () => {
        expect(isFuzzyMatch('Teh', 'teh')).toBe(true);
        expect(isFuzzyMatch('  AIR  ', 'air')).toBe(true);
        expect(isFuzzyMatch('CAT', 'cat')).toBe(true);
      });

      it('should reject typos for words with length < 4', () => {
        expect(isFuzzyMatch('Teh', 'Tek')).toBe(false);
        expect(isFuzzyMatch('Air', 'Ait')).toBe(false);
        expect(isFuzzyMatch('Bus', 'Bua')).toBe(false);
      });
    });

    describe('Medium strings (length 4 - 7): tolerance <= 1', () => {
      it('should match exact and 1-typo words', () => {
        expect(isFuzzyMatch('Dokter', 'Dokter')).toBe(true);
        expect(isFuzzyMatch('Dokter', 'Doktr')).toBe(true); // 1 deletion
        expect(isFuzzyMatch('Dokter', 'Dotter')).toBe(true); // 1 substitution
        expect(isFuzzyMatch('Kucing', 'Kucikg')).toBe(true); // 1 substitution
        expect(isFuzzyMatch('Kucing', 'Kucingg')).toBe(true); // 1 insertion
      });

      it('should reject words with 2 or more typos', () => {
        expect(isFuzzyMatch('Dokter', 'Dottxr')).toBe(false); // 2 edits
        expect(isFuzzyMatch('Kucing', 'Kudang')).toBe(false); // 2 edits
      });
    });

    describe('Long strings (length > 7): tolerance <= 2', () => {
      it('should match exact and up to 2-typo words', () => {
        expect(isFuzzyMatch('Perpustakaan', 'Perpustakaan')).toBe(true);
        expect(isFuzzyMatch('Perpustakaan', 'Perpustkaan')).toBe(true); // 1 deletion
        expect(isFuzzyMatch('Perpustakaan', 'Perpustkan')).toBe(true);  // 2 deletions
        expect(isFuzzyMatch('Komputer', 'Komputr')).toBe(true);         // 1 deletion
        expect(isFuzzyMatch('Komputer', 'Komputre')).toBe(true);        // 2 edits
        expect(isFuzzyMatch('Komputer', 'Komptr')).toBe(true);          // 2 deletions
        expect(isFuzzyMatch('Supermarket', 'Supermarkit')).toBe(true);  // 1 substitution
      });

      it('should reject words with 3 or more typos', () => {
        expect(isFuzzyMatch('Perpustakaan', 'Perpus')).toBe(false); // > 2 edits
        expect(isFuzzyMatch('Supermarket', 'Superminimart')).toBe(false);
      });
    });

    describe('Custom maxDistance option', () => {
      it('should respect custom maxDistance when provided', () => {
        expect(isFuzzyMatch('Teh', 'Tek', { maxDistance: 1 })).toBe(true);
        expect(isFuzzyMatch('Perpustakaan', 'Perpustkaan', { maxDistance: 0 })).toBe(false);
      });
    });

    describe('FuzzyMatcher static class wrapper', () => {
      it('should expose isMatch method identically', () => {
        expect(FuzzyMatcher.isMatch('Bakso', 'Bakso')).toBe(true);
        expect(FuzzyMatcher.isMatch('Bakso', 'Bakzo')).toBe(true);
        expect(FuzzyMatcher.isMatch('Bakso', 'Gorengan')).toBe(false);
      });
    });
  });
});
