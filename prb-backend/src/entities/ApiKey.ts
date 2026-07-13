import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Standalone API key used to authenticate external/service calls.
 * Intentionally has no relation to the `prb_users` table — it is managed
 * independently by admins.
 */
@Entity('prb_api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Human-readable label for who/what this key belongs to. */
  @Column({ name: 'api_user', type: 'varchar', length: 256, nullable: false })
  apiUser!: string;

  @Column({ name: 'api_key', type: 'varchar', length: 128, unique: true, nullable: false })
  apiKey!: string;

  @Column({ name: 'last_used', type: 'timestamptz', nullable: true })
  lastUsed!: Date | null;

  @Column({ name: 'used_count', type: 'integer', default: 0 })
  usedCount!: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate!: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate!: Date;
}
