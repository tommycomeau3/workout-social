import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://tommycomeau@localhost:5432/workout_social',
});

// Test the connection
pool.query('SELECT NOW()', (err: any, res: any) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

export default pool;