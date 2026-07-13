import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSubmits1784200000000 implements MigrationInterface {
  name = 'CreateSubmits1784200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prb_submits',
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
            name: 'miner_uid',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'image_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
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
    await queryRunner.dropTable('prb_submits');
  }
}
