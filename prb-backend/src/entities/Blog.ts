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

export enum BlogStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ARCHIVED = 'archived',
  EDITED = 'edited',
}

@Entity('prb_blogs')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 256, nullable: false })
  title!: string;

  @Column({ name: 'cover_image_key', type: 'varchar', length: 1024, nullable: false })
  coverImageKey!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ type: 'varchar', length: 300, unique: true, nullable: false })
  slug!: string;

  @Column({ type: 'enum', enum: BlogStatus, default: BlogStatus.PENDING })
  status!: BlogStatus;

  @Column({ type: 'varchar', length: 100, nullable: false })
  category!: string;

  @Column({ name: 'published_date', type: 'timestamptz', nullable: true })
  publishedDate!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate!: Date;
}
