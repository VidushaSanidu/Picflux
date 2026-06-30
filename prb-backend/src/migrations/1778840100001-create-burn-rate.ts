import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBurnRate1778840100001 implements MigrationInterface {
  name = 'CreateBurnRate1778840100001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'leaderboard_burn_rates',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'burn_rate',
            type: 'double precision',
            isNullable: false,
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

    // Insert the singleton default row
    await queryRunner.query(
      `INSERT INTO "leaderboard_burn_rates" ("id", "burn_rate") VALUES (1, 0.0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('leaderboard_burn_rates');
  }
}
