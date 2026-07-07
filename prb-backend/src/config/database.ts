import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config(); // load .env when invoked directly by the TypeORM CLI
import { Job } from '../entities/Job';
import { User } from '../entities/User';
import { ValidatorReport } from '../entities/ValidatorReport';
import { BurnRate } from '../entities/BurnRate';
import { ContactInquiry } from '../entities/ContactInquiry';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Job, User, ValidatorReport, BurnRate, ContactInquiry],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  migrationsTableName: 'prb_typeorm_migrations',
  synchronize: false,
  logging: false,
});
