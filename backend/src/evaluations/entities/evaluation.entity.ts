import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  JoinColumn, 
  OneToOne 
} from 'typeorm';
import { Nomination } from '../../nominations/entities/nomination.entity';

export enum EvaluationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn()
  evaluation_id: number;

  @OneToOne(() => Nomination, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nomination_id' })
  nomination: Nomination;

  @Column({ type: 'int' })
  nomination_id: number;

  @Column({
    type: 'enum',
    enum: EvaluationStatus,
    default: EvaluationStatus.PENDING,
  })
  status: EvaluationStatus;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}