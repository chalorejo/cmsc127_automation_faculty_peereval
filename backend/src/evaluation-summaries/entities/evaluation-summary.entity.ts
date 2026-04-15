import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EvaluationCycle } from '../../evaluation-cycles/entities/evaluation-cycle.entity';

@Entity('evaluation_summaries')
export class EvaluationSummary {
  @PrimaryGeneratedColumn()
  summary_id: number;

  @ManyToOne(() => EvaluationCycle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycle_id' })
  cycle: EvaluationCycle;

  @Column({ type: 'int' })
  cycle_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluatee_id' })
  evaluatee: User;

  @Column({ type: 'int' })
  evaluatee_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  average_score: number;

  @Column({ type: 'boolean' })
  is_satisfactory: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'chair_sign_id' })
  chairSign: User;

  @Column({ type: 'int', nullable: true })
  chair_sign_id: number;
  
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dean_sign_id' })
  deanSign: User;

  @Column({ type: 'int', nullable: true })
  dean_sign_id: number;

  @Column({ type: 'varchar', length: 512, nullable: true })
  document_url: string;
}