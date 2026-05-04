import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeaturedToImages1777713113101 implements MigrationInterface {
  name = 'AddFeaturedToImages1777713113101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "images" ADD "featured" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'SET_FEATURED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "featured"`);
    // Postgres does not support removing enum values natively;
    // a full enum recreation would be required if rollback is needed.
  }
}
