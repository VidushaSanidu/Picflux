import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1777713113100 implements MigrationInterface {
    name = 'Initial1777713113100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "profile_image" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "key_hash" character varying NOT NULL, "key_prefix" character varying(8) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "revoked_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_57384430aa1959f4578046c9b81" UNIQUE ("key_hash"), CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."images_status_enum" AS ENUM('Pending', 'Approved', 'Rejected')`);
        await queryRunner.query(`CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "uploader_user_id" uuid NOT NULL, "status" "public"."images_status_enum" NOT NULL DEFAULT 'Pending', "title" text, "location" text, "tags" text array NOT NULL, "storage_key" character varying NOT NULL, "mime_type" character varying NOT NULL, "size_bytes" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "approved_by_id" uuid, "approved_at" TIMESTAMP WITH TIME ZONE, "rejection_reason" text, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usage_counters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "date" date NOT NULL, "web_upload_count" integer NOT NULL DEFAULT '0', "web_download_count" integer NOT NULL DEFAULT '0', "api_upload_count" integer NOT NULL DEFAULT '0', "api_download_count" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_2a32c246317aab61a42f7cada54" UNIQUE ("user_id", "date"), CONSTRAINT "PK_fb39db314fa8fc2b6653f2f4e31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('UPLOAD', 'DOWNLOAD', 'APPROVE', 'REJECT', 'LOGIN', 'REGISTER', 'API_KEY_CREATE', 'API_KEY_REVOKE')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "action" "public"."audit_logs_action_enum" NOT NULL, "image_id" uuid, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "metadata" jsonb, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "api_keys" ADD CONSTRAINT "FK_a3baee01d8408cd3c0f89a9a973" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_0b15293c4b6de8b2fc88db3ad6c" FOREIGN KEY ("uploader_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usage_counters" ADD CONSTRAINT "FK_c9fa4c48ed77252ef609b6b45bd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usage_counters" DROP CONSTRAINT "FK_c9fa4c48ed77252ef609b6b45bd"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_0b15293c4b6de8b2fc88db3ad6c"`);
        await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_a3baee01d8408cd3c0f89a9a973"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "usage_counters"`);
        await queryRunner.query(`DROP TABLE "images"`);
        await queryRunner.query(`DROP TYPE "public"."images_status_enum"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
