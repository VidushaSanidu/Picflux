import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateBlogs1783600000000 implements MigrationInterface {
  name = 'CreateBlogs1783600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TYPE prb_blog_status AS ENUM ('pending', 'approved', 'archived', 'edited')");

    await queryRunner.createTable(
      new Table({
        name: 'prb_blogs',
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
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '256',
            isNullable: false,
          },
          {
            name: 'cover_image_key',
            type: 'varchar',
            length: '1024',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '300',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'status',
            type: 'prb_blog_status',
            isNullable: false,
            default: "'pending'",
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'published_date',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
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

    await queryRunner.createForeignKey(
      'prb_blogs',
      new TableForeignKey({
        name: 'FK_prb_blogs_user_id',
        columnNames: ['user_id'],
        referencedTableName: 'prb_users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'prb_blogs',
      new TableIndex({
        name: 'IDX_prb_blogs_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'prb_blogs',
      new TableIndex({
        name: 'IDX_prb_blogs_published_date',
        columnNames: ['published_date'],
      }),
    );

    await queryRunner.createIndex(
      'prb_blogs',
      new TableIndex({
        name: 'IDX_prb_blogs_user_id',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('prb_blogs', 'IDX_prb_blogs_user_id');
    await queryRunner.dropIndex('prb_blogs', 'IDX_prb_blogs_published_date');
    await queryRunner.dropIndex('prb_blogs', 'IDX_prb_blogs_status');

    await queryRunner.dropForeignKey('prb_blogs', 'FK_prb_blogs_user_id');
    await queryRunner.dropTable('prb_blogs');

    await queryRunner.query('DROP TYPE prb_blog_status');
  }
}
