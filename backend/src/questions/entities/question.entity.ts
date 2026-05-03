import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuestionSection } from './question-section.entity';

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

  @ManyToOne(() => QuestionSection, (section) => section.questions, { nullable: true })
  @JoinColumn({ name: 'section_id' })
  section: QuestionSection;

  @Column({ type: 'int', nullable: true })
  section_id: number;

  @Column({ type: 'int', default: 0 })
  order_in_section: number;
}