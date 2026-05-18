import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserToJobs1778840000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_jobs"
        ADD COLUMN "user_id" uuid NULL,
        ADD CONSTRAINT "FK_prb_jobs_user_id"
          FOREIGN KEY ("user_id")
          REFERENCES "prb_users"("id")
          ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_jobs"
        DROP CONSTRAINT "FK_prb_jobs_user_id",
        DROP COLUMN "user_id"
    `);
  }
}
