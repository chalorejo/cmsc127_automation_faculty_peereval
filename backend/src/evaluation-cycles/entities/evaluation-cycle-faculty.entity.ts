import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, Column } from 'typeorm';
import { EvaluationCycle } from './evaluation-cycle.entity';
import { User } from '../../users/entities/user.entity';

@Entity('evaluation_cycle_faculty')
@Unique(['cycle_id', 'user_id'])
export class EvaluationCycleFaculty {
  @PrimaryGeneratedColumn()
  assignment_id: number;

  @ManyToOne(() => EvaluationCycle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycle_id' })
  cycle: EvaluationCycle;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  cycle_id: number;

  @Column({ type: 'int' })
  user_id: number;
}
