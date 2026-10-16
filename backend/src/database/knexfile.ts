import type { Knex } from 'knex';
import { join } from 'path';

if (!process.env.DATABASE_URL) process.loadEnvFile(join(__dirname, '..', '..', '.env'));

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: { directory: join(__dirname, '..', 'migrations'), loadExtensions: ['.ts'] },
};

export default config;
