import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig = (url: string): DataSourceOptions => ({
  type: 'postgres',
  url,
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
});
