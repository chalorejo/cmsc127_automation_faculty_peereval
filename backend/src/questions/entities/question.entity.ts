import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum QuestionType {
  LIKERT = 'LIKERT',
  OPEN_ENDED = 'OPEN_ENDED',
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  question_id: number;

  @Column({ type: 'text' })
  question_text: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: 'boolean', default: true })
  is_required: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}