import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.resolve(__dirname, '../server/src/data/defaultWordPacks.ts');
const clientPath = path.resolve(__dirname, '../client/src/data/defaultWordPacks.ts');

if (!fs.existsSync(serverPath)) {
  console.error(`Canonical source file not found: ${serverPath}`);
  process.exit(1);
}

const serverCode = fs.readFileSync(serverPath, 'utf-8');

// Replace .js extension in relative import for client bundler compatibility
const clientCode = serverCode.replace(
  "from '../types/game.types.js';",
  "from '../types/game.types';"
);

fs.writeFileSync(clientPath, clientCode, 'utf-8');
console.log('✅ Synchronized defaultWordPacks from server to client successfully.');
