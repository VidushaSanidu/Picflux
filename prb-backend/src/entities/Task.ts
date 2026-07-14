import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

export enum TaskStatus {
  OPEN = 'open',
  DISABLED = 'disabled',
  VALIDATING = 'validating',
}

/** A single ranked hotkey entry. `minerId` is the hotkey's index (rank) in the submitted array. */
export interface TaskHotkey {
  minerId: number;
  hotkey: string;
}

/**
 * Single-row table describing the current active task. `POST /api/v1/task`
 * always overwrites this one row rather than appending a new one.
 */
@Entity('prb_task')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'varchar', nullable: false })
  taskId!: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: false })
  imageUrl!: string;

  @Column({ type: 'enum', enum: TaskStatus, nullable: false })
  status!: TaskStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  hotkeys!: TaskHotkey[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
