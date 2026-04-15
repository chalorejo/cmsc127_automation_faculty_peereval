import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EvaluationCycle } from '../../evaluation-cycles/entities/evaluation-cycle.entity';

export enum NominationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('nominations')
export class Nomination {
  @PrimaryGeneratedColumn()
  nomination_id: number;

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

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: User;

  @Column({ type: 'int' })
  evaluator_id: number;

  @Column({
    type: 'enum',
    enum: NominationStatus,
    default: NominationStatus.PENDING,
  })
  status: NominationStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;

  @Column({ type: 'int', nullable: true })
  approved_by: number;
}