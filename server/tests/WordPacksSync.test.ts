import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  DEFAULT_WORD_PAIRS as serverPairs,
  CATEGORIES as serverCategories,
} from '../src/data/defaultWordPacks.js';

describe('Word Packs Single Source of Truth Synchronization', () => {
  const clientFilePath = path.resolve(__dirname, '../../client/src/data/defaultWordPacks.ts');
  const serverFilePath = path.resolve(__dirname, '../src/data/defaultWordPacks.ts');

  it('client defaultWordPacks.ts should exist', () => {
    expect(fs.existsSync(clientFilePath)).toBe(true);
  });

  it('client defaultWordPacks.ts should match server defaultWordPacks.ts pairs', () => {
    const clientContent = fs.readFileSync(clientFilePath, 'utf-8');

    // Verify all server pairs exist in client
    expect(serverPairs.length).toBeGreaterThan(50);
    expect(serverPairs.length).toBe(64);

    // Verify uniqueness of server IDs
    const pairIds = serverPairs.map((p) => p.id);
    const uniqueIds = new Set(pairIds);
    expect(uniqueIds.size).toBe(serverPairs.length);

    // Verify all categories exist in client
    for (const cat of serverCategories) {
      expect(clientContent).toContain(cat);
    }

    // Verify each pair's ID, category, civilian word, and undercover word in client
    for (const pair of serverPairs) {
      expect(clientContent).toContain(`id: '${pair.id}'`);
      expect(clientContent).toContain(`category: '${pair.category}'`);
      expect(clientContent).toContain(`civilianWord: '${pair.civilianWord}'`);
      expect(clientContent).toContain(`undercoverWord: '${pair.undercoverWord}'`);
    }
  });

  it('client content matches canonical server content except import extension', () => {
    const serverContent = fs.readFileSync(serverFilePath, 'utf-8');
    const clientContent = fs.readFileSync(clientFilePath, 'utf-8');

    // Normalizing newlines for cross-platform robustness
    const normalizedServer = serverContent
      .replace(/\r\n/g, '\n')
      .replace("from '../types/game.types.js';", "from '../types/game.types';");
    const normalizedClient = clientContent.replace(/\r\n/g, '\n');

    expect(normalizedClient).toBe(normalizedServer);
  });
});
