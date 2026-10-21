import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString = (process.env.DATABASE_URL || 'postgres://9a864143dccf0d87d380fce7260ade8701501717ae6e7c0b582fa6094a25279a:sk_AQGyczjWHdKjWi5Py9EnY@pooled.db.prisma.io:5432/postgres?sslmode=verify-full').replace('sslmode=require', 'sslmode=verify-full');

// Preserve pool across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __postgres_pool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
} else {
  if (!global.__postgres_pool) {
    global.__postgres_pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  pool = global.__postgres_pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' && duration > 500) {
      console.log('Executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

export default pool;
