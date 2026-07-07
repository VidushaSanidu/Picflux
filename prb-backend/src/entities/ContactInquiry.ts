import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prb_contact_inquiries')
export class ContactInquiry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'work_email', type: 'varchar', length: 320 })
  workEmail!: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName!: string | null;

  @Column({ name: 'company_website', type: 'varchar', length: 2048, nullable: true })
  companyWebsite!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role!: string | null;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}