import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerification1778840000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_users"
        ADD COLUMN "is_verified" boolean NOT NULL DEFAULT false,
        ADD COLUMN "verification_token" varchar NULL,
        ADD COLUMN "verification_token_expires_at" timestamp NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_users"
        DROP COLUMN "verification_token_expires_at",
        DROP COLUMN "verification_token",
        DROP COLUMN "is_verified"
    `);
  }
}
