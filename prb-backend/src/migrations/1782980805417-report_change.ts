import { MigrationInterface, QueryRunner } from "typeorm";

export class ReportChange1782980805417 implements MigrationInterface {
    name = 'ReportChange1782980805417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prb_jobs" DROP CONSTRAINT "FK_prb_jobs_user_id"`);
        await queryRunner.query(`ALTER TABLE "prb_users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" ADD "last_weight_update" double precision`);
        await queryRunner.query(`ALTER TYPE "public"."prb_user_role" RENAME TO "prb_user_role_old"`);
        await queryRunner.query(`CREATE TYPE "public"."prb_users_role_enum" AS ENUM('general', 'granted', 'admin')`);
        await queryRunner.query(`ALTER TABLE "prb_users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "prb_users" ALTER COLUMN "role" TYPE "public"."prb_users_role_enum" USING "role"::"text"::"public"."prb_users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "prb_users" ALTER COLUMN "role" SET DEFAULT 'general'`);
        await queryRunner.query(`DROP TYPE "public"."prb_user_role_old"`);
        await queryRunner.query(`ALTER TYPE "public"."prb_job_status" RENAME TO "prb_job_status_old"`);
        await queryRunner.query(`CREATE TYPE "public"."prb_jobs_status_enum" AS ENUM('WAITING', 'CLASSIFIED', 'PENDING', 'COMPLETE')`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ALTER COLUMN "status" TYPE "public"."prb_jobs_status_enum" USING "status"::"text"::"public"."prb_jobs_status_enum"`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ALTER COLUMN "status" SET DEFAULT 'WAITING'`);
        await queryRunner.query(`DROP TYPE "public"."prb_job_status_old"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" ALTER COLUMN "stake" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" DROP COLUMN "received_at"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" ADD "received_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "leaderboard_burn_rates" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_burn_rates" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ADD CONSTRAINT "FK_e6e96c81ceaf21e479cd4990d68" FOREIGN KEY ("user_id") REFERENCES "prb_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prb_jobs" DROP CONSTRAINT "FK_e6e96c81ceaf21e479cd4990d68"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_burn_rates" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_burn_rates" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" DROP COLUMN "received_at"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" ADD "received_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" ALTER COLUMN "stake" SET DEFAULT 1.0`);
        await queryRunner.query(`CREATE TYPE "public"."prb_job_status_old" AS ENUM('WAITING', 'CLASSIFIED', 'PENDING', 'COMPLETE')`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ALTER COLUMN "status" TYPE "public"."prb_job_status_old" USING "status"::"text"::"public"."prb_job_status_old"`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ALTER COLUMN "status" SET DEFAULT 'WAITING'`);
        await queryRunner.query(`DROP TYPE "public"."prb_jobs_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."prb_job_status_old" RENAME TO "prb_job_status"`);
        await queryRunner.query(`CREATE TYPE "public"."prb_user_role_old" AS ENUM('general', 'granted', 'admin')`);
        await queryRunner.query(`ALTER TABLE "prb_users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "prb_users" ALTER COLUMN "role" TYPE "public"."prb_user_role_old" USING "role"::"text"::"public"."prb_user_role_old"`);
        await queryRunner.query(`ALTER TABLE "prb_users" ALTER COLUMN "role" SET DEFAULT 'general'`);
        await queryRunner.query(`DROP TYPE "public"."prb_users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."prb_user_role_old" RENAME TO "prb_user_role"`);
        await queryRunner.query(`ALTER TABLE "leaderboard_validator_reports" DROP COLUMN "last_weight_update"`);
        await queryRunner.query(`ALTER TABLE "prb_users" ADD "username" character varying`);
        await queryRunner.query(`ALTER TABLE "prb_jobs" ADD CONSTRAINT "FK_prb_jobs_user_id" FOREIGN KEY ("user_id") REFERENCES "prb_users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
