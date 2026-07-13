import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('prb_submits')
export class Submit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'miner_uid', type: 'integer', nullable: false })
  minerUid!: number;

  @Column({ name: 'image_url', type: 'varchar', nullable: false })
  imageUrl!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
