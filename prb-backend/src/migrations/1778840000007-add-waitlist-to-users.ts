import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWaitlistToUsers1778840000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prb_users" ADD COLUMN IF NOT EXISTS "waitlist" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prb_users" DROP COLUMN "waitlist"`);
  }
}
