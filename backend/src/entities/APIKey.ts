import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('api_keys')
export class APIKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /** SHA-256 hex of the raw key */
  @Column({ name: 'key_hash', unique: true })
  keyHash!: string;

  /** First 8 chars of the raw key — safe to display */
  @Column({ name: 'key_prefix', length: 8 })
  keyPrefix!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'revoked_at', nullable: true, type: 'timestamptz' })
  revokedAt!: Date | null;
}
