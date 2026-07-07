import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateContactInquiries1783500000000 implements MigrationInterface {
  name = 'CreateContactInquiries1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prb_contact_inquiries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'work_email',
            type: 'varchar',
            length: '320',
            isNullable: false,
          },
          {
            name: 'company_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'company_website',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.query(
      'CREATE INDEX "IDX_prb_contact_inquiries_created_at" ON "prb_contact_inquiries" ("created_at" DESC)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_prb_contact_inquiries_is_read" ON "prb_contact_inquiries" ("is_read")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_prb_contact_inquiries_is_read"');
    await queryRunner.query('DROP INDEX "public"."IDX_prb_contact_inquiries_created_at"');
    await queryRunner.dropTable('prb_contact_inquiries');
  }
}