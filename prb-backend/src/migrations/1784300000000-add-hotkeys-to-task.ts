import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddHotkeysToTask1784300000000 implements MigrationInterface {
  name = 'AddHotkeysToTask1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'prb_task',
      new TableColumn({
        name: 'hotkeys',
        type: 'jsonb',
        isNullable: false,
        default: "'[]'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('prb_task', 'hotkeys');
  }
}
