import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePrbUsers1778840000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TYPE prb_user_role AS ENUM ('general', 'granted', 'admin')
    `);

    await queryRunner.query(`
      CREATE TABLE "prb_users" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "email"         varchar       NOT NULL,
        "password_hash" varchar,
        "google_id"     varchar(255)  UNIQUE,
        "role"          prb_user_role NOT NULL DEFAULT 'general',
        "created_at"    TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prb_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_prb_users_email" UNIQUE ("email")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prb_users"`);
    await queryRunner.query(`DROP TYPE prb_user_role`);
  }
}
