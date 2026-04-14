import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  Unique 
} from 'typeorm';
import { Evaluation } from '../../evaluations/entities/evaluation.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('answers')
@Unique(['evaluation_id', 'question_id'])
export class Answer {
  @PrimaryGeneratedColumn()
  answer_id: number;

  @ManyToOne(() => Evaluation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: Evaluation;

  @Column({ type: 'int' })
  evaluation_id: number;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'int' })
  question_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  numeric_score: number;

  @Column({ type: 'text', nullable: true })
  text_response: string;
}