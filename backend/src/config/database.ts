import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { APIKey } from '../entities/APIKey';
import { Image } from '../entities/Image';
import { UsageCounter } from '../entities/UsageCounter';
import { AuditLog } from '../entities/AuditLog';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, APIKey, Image, UsageCounter, AuditLog],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
