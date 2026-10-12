import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';

if (!process.env.DATABASE_URL) process.loadEnvFile();

export default new DataSource(databaseConfig(process.env.DATABASE_URL!));
