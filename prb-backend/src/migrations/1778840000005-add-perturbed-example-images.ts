import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerturbedExampleImages1778840000005 implements MigrationInterface {
  name = 'AddPerturbedExampleImages1778840000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_jobs"
        ADD COLUMN "perturbedExampleImageKeys" text[] NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_jobs"
        DROP COLUMN "perturbedExampleImageKeys"
    `);
  }
}
