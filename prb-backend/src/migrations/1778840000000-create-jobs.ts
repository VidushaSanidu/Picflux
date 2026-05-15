import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateJobs1778840000000 implements MigrationInterface {
  name = 'CreateJobs1778840000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'prb_jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userImageKey',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'processedImageKey',
            type: 'varchar',
            isNullable: true,
            default: null,
          },
          {
            name: 'initialModelScore',
            type: 'double precision',
            isNullable: true,
            default: null,
          },
          {
            name: 'initialClass',
            type: 'varchar',
            isNullable: true,
            default: null,
          },
          {
            name: 'afterClass',
            type: 'varchar',
            isNullable: true,
            default: null,
          },
          {
            name: 'afterScore',
            type: 'double precision',
            isNullable: true,
            default: null,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('prb_jobs');
  }
}
