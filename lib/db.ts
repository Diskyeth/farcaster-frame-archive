import pg from 'pg';
const { Pool } = pg;

// Create a new Pool instance using the Neon Postgres connection URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Export query method directly with proper TypeScript types
export async function query(text: string, params: any[]) {
  console.log('Connecting to database with URL:', process.env.DATABASE_URL ? '[URL is defined]' : '[URL is undefined]');
  
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Also export the pool for advanced usage
export default pool;