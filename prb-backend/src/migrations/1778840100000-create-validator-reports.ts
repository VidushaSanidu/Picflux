import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateValidatorReports1778840100000 implements MigrationInterface {
  name = 'CreateValidatorReports1778840100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'leaderboard_validator_reports',
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
            name: 'validator_hotkey',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'task_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'validator_timestamp',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'network',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'miners',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'stake',
            type: 'double precision',
            default: '1.0',
          },
          {
            name: 'received_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('leaderboard_validator_reports');
  }
}
