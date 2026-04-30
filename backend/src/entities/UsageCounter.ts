import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity('usage_counters')
@Unique(['userId', 'date'])
export class UsageCounter {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /** ISO date string: YYYY-MM-DD */
  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'web_upload_count', default: 0 })
  webUploadCount!: number;

  @Column({ name: 'web_download_count', default: 0 })
  webDownloadCount!: number;

  @Column({ name: 'api_upload_count', default: 0 })
  apiUploadCount!: number;

  @Column({ name: 'api_download_count', default: 0 })
  apiDownloadCount!: number;
}
