import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PrbUserRole {
  GENERAL = 'general',
  GRANTED = 'granted',
  ADMIN = 'admin',
}

@Entity('prb_users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash', nullable: true, type: 'varchar' })
  passwordHash!: string | null;

  @Column({ name: 'google_id', nullable: true, unique: true, type: 'varchar', length: 255 })
  googleId!: string | null;

  @Column({ type: 'enum', enum: PrbUserRole, default: PrbUserRole.GENERAL })
  role!: PrbUserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
