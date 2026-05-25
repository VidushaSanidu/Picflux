import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameAndNameToUsers1778840000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_users"
        ADD COLUMN "name" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "prb_users"
        DROP COLUMN "name"
    `);
  }
}
