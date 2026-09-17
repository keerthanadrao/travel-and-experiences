import { getDb } from './db';

export async function getChildLocationIds(locationId: string): Promise<string[]> {
  const db = await getDb();
  const results: string[] = [locationId];

  async function fetchChildren(parentId: string) {
    const children = await db.all('SELECT id FROM locations WHERE parent_id = ?', [parentId]);
    for (const child of children) {
      results.push(child.id);
      await fetchChildren(child.id);
    }
  }

  await fetchChildren(locationId);
  return results;
}

export async function resolveLocationAncestors(locationId: string): Promise<Array<{ id: string; name: string; level: string }>> {
  const db = await getDb();
  const ancestors: Array<{ id: string; name: string; level: string }> = [];

  let currentId: string | null = locationId;

  while (currentId) {
    const locRecord: { id: string; name: string; level: string; parent_id: string | null } | undefined = await db.get(
      'SELECT id, name, level, parent_id FROM locations WHERE id = ?',
      [currentId]
    );
    if (locRecord) {
      ancestors.unshift({ id: locRecord.id, name: locRecord.name, level: locRecord.level });
      currentId = locRecord.parent_id;
    } else {
      currentId = null;
    }
  }

  return ancestors;
}
