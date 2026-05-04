import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config(); // load .env when invoked directly by the TypeORM CLI
import { User } from '../entities/User';
import { APIKey } from '../entities/APIKey';
import { Image } from '../entities/Image';
import { UsageCounter } from '../entities/UsageCounter';
import { AuditLog } from '../entities/AuditLog';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, APIKey, Image, UsageCounter, AuditLog],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});
