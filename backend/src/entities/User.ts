import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash', nullable: true, type: 'varchar' })
  passwordHash!: string | null;

  @Column({ name: 'google_id', nullable: true, unique: true, type: 'varchar', length: 255 })
  googleId!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'profile_image', nullable: true, type: 'text' })
  profileImage!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
