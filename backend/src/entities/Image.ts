import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum ImageStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'uploader_user_id' })
  uploaderUserId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploader_user_id' })
  uploader!: User;

  @Column({ type: 'enum', enum: ImageStatus, default: ImageStatus.PENDING })
  status!: ImageStatus;

  @Column({ nullable: true, type: 'text' })
  title!: string | null;

  @Column({ nullable: true, type: 'text' })
  location!: string | null;

  @Column({ type: 'text', array: true })
  tags!: string[];

  /** The object key inside the R2 bucket */
  @Column({ name: 'storage_key' })
  storageKey!: string;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'approved_by_id', nullable: true, type: 'uuid' })
  approvedById!: string | null;

  @Column({ name: 'approved_at', nullable: true, type: 'timestamptz' })
  approvedAt!: Date | null;

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason!: string | null;

  @Column({ default: false })
  featured!: boolean;
}
