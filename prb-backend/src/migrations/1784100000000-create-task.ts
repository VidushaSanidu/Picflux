import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTask1784100000000 implements MigrationInterface {
  name = 'CreateTask1784100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TYPE prb_task_status AS ENUM ('open', 'disabled', 'validating')");

    await queryRunner.createTable(
      new Table({
        name: 'prb_task',
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
            name: 'task_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'image_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'prb_task_status',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('prb_task');
    await queryRunner.query('DROP TYPE prb_task_status');
  }
}
