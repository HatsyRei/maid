import * as SQLite from 'expo-sqlite';
import { MessageNode } from 'message-nodes';

let db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('messages.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        root TEXT NOT NULL,
        parent TEXT,
        child TEXT,
        metadata TEXT
      );
    `);
  }
  return db;
}

export async function saveLocalMessages(mappings: Record<string, MessageNode<string, Record<string, any>>>): Promise<void> {
  const database = await getDb();
  const nodes = Object.values(mappings);

  await database.withTransactionAsync(async () => {
    // Remove nodes that no longer exist
    const ids = nodes.map(n => `'${n.id.replace(/'/g, "''")}'`).join(',');
    if (ids.length > 0) {
      await database.execAsync(`DELETE FROM messages WHERE id NOT IN (${ids})`);
    } else {
      await database.execAsync('DELETE FROM messages');
    }

    for (const node of nodes) {
      const metadataJson = JSON.stringify(node.metadata ?? {});

      await database.runAsync(
        `INSERT OR REPLACE INTO messages (id, role, content, root, parent, child, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [node.id, node.role, node.content, node.root, node.parent ?? null, node.child ?? null, metadataJson]
      );
    }
  });
}

export async function loadLocalMessages(): Promise<Record<string, MessageNode<string, Record<string, any>>>> {
  const database = await getDb();

  const rows = await database.getAllAsync<{
    id: string;
    role: string;
    content: string;
    root: string;
    parent: string | null;
    child: string | null;
    metadata: string | null;
  }>('SELECT * FROM messages');

  const mappings: Record<string, MessageNode<string, Record<string, any>>> = {};
  for (const row of rows) {
    const metadata = row.metadata ? JSON.parse(row.metadata) : {};
    mappings[row.id] = {
      id: row.id,
      role: row.role,
      content: row.content,
      root: row.root,
      parent: row.parent ?? undefined,
      child: row.child ?? undefined,
      metadata,
    };
  }

  return mappings;
}
