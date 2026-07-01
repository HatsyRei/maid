import * as SQLite from 'expo-sqlite';
import { MessageNode } from 'message-nodes';

let db: SQLite.SQLiteDatabase | null = null;

// Signature of each row as it was last persisted (id -> signature). Lets us
// write only the nodes that actually changed instead of rewriting the whole
// table on every save.
const lastSaved = new Map<string, string>();

// Serializes saves so overlapping async writes cannot interleave transactions
// or corrupt the signature cache.
let writeChain: Promise<void> = Promise.resolve();

function rowSignature(node: MessageNode<string, Record<string, any>>, metadataJson: string): string {
  return JSON.stringify([
    node.role,
    node.content,
    node.root,
    node.parent ?? null,
    node.child ?? null,
    metadataJson,
  ]);
}

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

export function saveLocalMessages(mappings: Record<string, MessageNode<string, Record<string, any>>>): Promise<void> {
  const run = writeChain.then(() => persistLocalMessages(mappings));
  // Keep the chain alive even if a save rejects, so later writes still run.
  writeChain = run.catch(() => {});
  return run;
}

async function persistLocalMessages(mappings: Record<string, MessageNode<string, Record<string, any>>>): Promise<void> {
  const database = await getDb();
  const nodes = Object.values(mappings);

  // Diff the current state against what we last wrote.
  const currentIds = new Set<string>();
  const upserts: Array<{ node: MessageNode<string, Record<string, any>>; metadataJson: string; signature: string }> = [];

  for (const node of nodes) {
    currentIds.add(node.id);
    const metadataJson = JSON.stringify(node.metadata ?? {});
    const signature = rowSignature(node, metadataJson);
    if (lastSaved.get(node.id) !== signature) {
      upserts.push({ node, metadataJson, signature });
    }
  }

  const deletes: string[] = [];
  for (const id of lastSaved.keys()) {
    if (!currentIds.has(id)) {
      deletes.push(id);
    }
  }

  if (upserts.length === 0 && deletes.length === 0) {
    return;
  }

  await database.withTransactionAsync(async () => {
    for (const id of deletes) {
      await database.runAsync('DELETE FROM messages WHERE id = ?', [id]);
    }

    for (const { node, metadataJson } of upserts) {
      await database.runAsync(
        `INSERT OR REPLACE INTO messages (id, role, content, root, parent, child, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [node.id, node.role, node.content, node.root, node.parent ?? null, node.child ?? null, metadataJson]
      );
    }
  });

  // Only update the cache once the transaction has committed successfully.
  for (const id of deletes) {
    lastSaved.delete(id);
  }
  for (const { node, signature } of upserts) {
    lastSaved.set(node.id, signature);
  }
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
  lastSaved.clear();
  for (const row of rows) {
    const metadata = row.metadata ? JSON.parse(row.metadata) : {};
    const node: MessageNode<string, Record<string, any>> = {
      id: row.id,
      role: row.role,
      content: row.content,
      root: row.root,
      parent: row.parent ?? undefined,
      child: row.child ?? undefined,
      metadata,
    };
    mappings[row.id] = node;
    // Seed the cache so the next save only writes what actually changed.
    lastSaved.set(row.id, rowSignature(node, JSON.stringify(metadata)));
  }

  return mappings;
}
