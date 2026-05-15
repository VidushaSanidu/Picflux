import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('prb_jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** R2 storage key for the user-uploaded image */
  @Column({ type: 'varchar', nullable: false })
  userImageKey!: string;

  /** R2 storage key for the processed (perturbed) image — set via PATCH */
  @Column({ type: 'varchar', nullable: true, default: null })
  processedImageKey!: string | null;

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
