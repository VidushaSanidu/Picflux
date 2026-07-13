import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateApiKeys1784000000000 implements MigrationInterface {
  name = 'CreateApiKeys1784000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prb_api_keys',
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
            name: 'api_user',
            type: 'varchar',
            length: '256',
            isNullable: false,
          },
          {
            name: 'api_key',
            type: 'varchar',
            length: '128',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'last_used',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'used_count',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'created_date',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_date',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('prb_api_keys');
  }
}
