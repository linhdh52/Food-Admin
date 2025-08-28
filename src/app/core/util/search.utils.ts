export type SearchMode = 'AND' | 'OR';

export interface SearchOptions {
  mode?: SearchMode;          // 'AND' (mặc định): tất cả token phải khớp; 'OR': 1 token khớp là đủ
  noDiacritics?: boolean;     // bỏ dấu tiếng Việt
  caseSensitive?: boolean;    // phân biệt hoa thường (mặc định: false)
  trim?: boolean;             // trim + gộp khoảng trắng
  collapseSpaces?: boolean;
}

const DEFAULT_OPTS: Required<Omit<SearchOptions, 'mode'>> = {
  noDiacritics: true,
  caseSensitive: false,
  trim: true,
  collapseSpaces: true,
};

export function viNorm(val: any, opts: Omit<SearchOptions, 'mode'> = {}): string {
  const o = { ...DEFAULT_OPTS, ...opts };
  if (val === null || val === undefined) return '';
  let s = String(val);
  if (!o.caseSensitive) s = s.toLowerCase();

  if (o.noDiacritics) {
    s = s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
  if (o.collapseSpaces) s = s.replace(/\s+/g, ' ');
  if (o.trim) s = s.trim();
  return s;
}

export function tokenize(q: string, opts?: Omit<SearchOptions, 'mode'>): string[] {
  const norm = viNorm(q ?? '', opts);
  return norm.split(' ').filter(Boolean);
}

export function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, k) => (acc != null ? acc[k] : undefined), obj) ?? '';
}

export function matchRow(
  row: any,
  keys: string[],
  query: string,
  opts: SearchOptions = {}
): boolean {
  const { mode = 'AND', ...rest } = opts;
  const tokens = tokenize(query, rest);
  if (tokens.length === 0) return true;

  const haystack = keys
    .map(k => viNorm(getByPath(row, k), rest))
    .join(' ');

  return mode === 'AND'
    ? tokens.every(t => haystack.includes(t))
    : tokens.some(t => haystack.includes(t));
}

export function filterRows<T extends Record<string, any>>(
  rows: T[],
  keys: string[],
  query: string,
  opts: SearchOptions = {}
): T[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter(r => matchRow(r, keys, query, opts));
}

export function buildIndex<T extends Record<string, any>>(
  rows: T[],
  keys: string[],
  opts: Omit<SearchOptions, 'mode'> = {}
): Array<T & { _haystack: string }> {
  return rows.map(r => ({
    ...r,
    _haystack: keys.map(k => viNorm(getByPath(r, k), opts)).join(' ')
  }));
}

export function filterWithIndex<T extends { _haystack: string }>(
  indexed: T[],
  query: string,
  opts: SearchOptions = {}
): T[] {
  const { mode = 'AND', ...rest } = opts;
  const tokens = tokenize(query, rest);
  if (tokens.length === 0) return indexed;
  return indexed.filter(it =>
    mode === 'AND'
      ? tokens.every(t => it._haystack.includes(t))
      : tokens.some(t => it._haystack.includes(t))
  );
}
