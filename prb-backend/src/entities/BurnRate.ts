import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('leaderboard_burn_rates')
export class BurnRate {
  @PrimaryColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'burn_rate', type: 'double precision' })
  burnRate!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
