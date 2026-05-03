import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('evaluation_cycles')
export class EvaluationCycle {
  @PrimaryGeneratedColumn()
  cycle_id: number;

  @Column({ type: 'int', unique: true })
  year: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 5 })
  max_evaluations_per_faculty: number;
}