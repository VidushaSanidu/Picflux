import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusAndExampleImages1778840000003 implements MigrationInterface {
  name = 'AddStatusAndExampleImages1778840000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE prb_job_status AS ENUM ('WAITING', 'CLASSIFIED', 'PENDING', 'COMPLETE')
    `);

    await queryRunner.query(`
      ALTER TABLE "prb_jobs"
        ADD COLUMN "status" prb_job_status NOT NULL DEFAULT 'WAITING',
        ADD COLUMN "exampleImageKeys" text[] NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_jobs"
        DROP COLUMN "exampleImageKeys",
        DROP COLUMN "status"
    `);

    await queryRunner.query(`DROP TYPE prb_job_status`);
  }
}
