import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  console.warn('⚠️ Warning: TURSO_DATABASE_URL belum diatur di .env.local');
}

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || '',
});

