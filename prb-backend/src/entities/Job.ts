import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum JobStatus {
  WAITING = 'WAITING',
  CLASSIFIED = 'CLASSIFIED',
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
}

@Entity('prb_jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** ID of the user who uploaded this job */
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  /** R2 storage key for the user-uploaded image */
  @Column({ type: 'varchar', nullable: false })
  userImageKey!: string;

  /** Job processing status */
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.WAITING })
  status!: JobStatus;

  /** R2 storage keys for example images — set via PATCH */
  @Column({ type: 'text', array: true, default: [] })
  exampleImageKeys!: string[];

  /** R2 storage key for the processed (perturbed) image — set via PATCH */
  @Column({ type: 'varchar', nullable: true, default: null })
  processedImageKey!: string | null;

  /** R2 storage keys for perturbed example images — set via PATCH (Call 2) */
  @Column({ type: 'text', array: true, default: [] })
  perturbedExampleImageKeys!: string[];

  /** Model confidence score for the original image — set via PATCH */
  @Column({ type: 'double precision', nullable: true, default: null })
  initialModelScore!: number | null;

  /** Predicted class for the original image — set via PATCH */
  @Column({ type: 'varchar', nullable: true, default: null })
  initialClass!: string | null;

  /** Predicted class after perturbation — set via PATCH */
  @Column({ type: 'varchar', nullable: true, default: null })
  afterClass!: string | null;

  /** Model confidence score after perturbation — set via PATCH */
  @Column({ type: 'double precision', nullable: true, default: null })
  afterScore!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
