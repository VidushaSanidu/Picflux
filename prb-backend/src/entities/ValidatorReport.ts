import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface NetworkBlock {
  total_miners: number;
  available_miners: number;
  avg_score: number;
  avg_rmse: number;
  avg_norm: number;
  success_count: number;
}

export interface MinerData {
  uid: number;
  hotkey: string;
  coldkey: string;
  incentive: number;
  avg_score: number;
  last_score: number;
  rmse: number;
  norm: number;
  result: 'valid' | 'timeout' | 'rejected';
  image_url: string;
}

@Entity('leaderboard_validator_reports')
export class ValidatorReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'validator_hotkey', type: 'varchar', unique: true })
  validatorHotkey!: string;

  @Column({ name: 'task_id', type: 'varchar' })
  taskId!: string;

  @Column({ name: 'validator_timestamp', type: 'timestamptz' })
  validatorTimestamp!: Date;

  @Column({ type: 'jsonb' })
  network!: NetworkBlock;

  @Column({ type: 'jsonb' })
  miners!: MinerData[];

  @Column({ type: 'double precision', default: 1.0 })
  stake!: number;

  @CreateDateColumn({ name: 'received_at' })
  receivedAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
