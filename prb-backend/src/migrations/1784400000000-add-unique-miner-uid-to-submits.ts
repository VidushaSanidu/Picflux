import { MigrationInterface, QueryRunner, TableUnique } from 'typeorm';

export class AddUniqueMinerUidToSubmits1784400000000 implements MigrationInterface {
  name = 'AddUniqueMinerUidToSubmits1784400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createUniqueConstraint(
      'prb_submits',
      new TableUnique({
        name: 'UQ_prb_submits_miner_uid',
        columnNames: ['miner_uid'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('prb_submits', 'UQ_prb_submits_miner_uid');
  }
}
