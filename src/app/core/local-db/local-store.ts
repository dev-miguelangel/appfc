/**
 * LocalStore — simula tablas relacionales usando localStorage.
 * Cada tabla se guarda como JSON array bajo la clave "ldb_<tabla>".
 */
export class LocalStore {
  private prefix = 'ldb_';

  // Lee todos los registros de una tabla
  all<T extends Record<string, unknown>>(table: string): T[] {
    try {
      return JSON.parse(localStorage.getItem(this.key(table)) ?? '[]') as T[];
    } catch {
      return [];
    }
  }

  // Inserta o actualiza por campo 'id'
  upsert<T extends Record<string, unknown>>(table: string, record: T): T {
    const rows = this.all<T>(table);
    const idx = rows.findIndex(r => r['id'] === record['id']);
    if (idx >= 0) {
      rows[idx] = { ...rows[idx], ...record };
    } else {
      rows.push(record);
    }
    this.save(table, rows);
    return record;
  }

  // Busca un registro por campo = valor
  findOne<T extends Record<string, unknown>>(
    table: string,
    field: string,
    value: unknown,
  ): T | null {
    return (this.all<T>(table).find(r => r[field] === value) ?? null);
  }

  // Busca todos los registros que cumplen field = value
  findMany<T extends Record<string, unknown>>(
    table: string,
    field: string,
    value: unknown,
  ): T[] {
    return this.all<T>(table).filter(r => r[field] === value);
  }

  // Elimina por id
  delete(table: string, id: string): void {
    const rows = this.all(table).filter(r => r['id'] !== id);
    this.save(table, rows);
  }

  // Limpia toda la tabla (util para tests)
  clear(table: string): void {
    localStorage.removeItem(this.key(table));
  }

  private key(table: string): string {
    return `${this.prefix}${table}`;
  }

  private save(table: string, rows: unknown[]): void {
    localStorage.setItem(this.key(table), JSON.stringify(rows));
  }
}

export const localStore = new LocalStore();
