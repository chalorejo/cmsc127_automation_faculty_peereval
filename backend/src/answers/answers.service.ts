import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { Evaluation, EvaluationStatus } from '../evaluations/entities/evaluation.entity';
import { MagicLink } from '../magic-links/entities/magic-link.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer) private answerRepo: Repository<Answer>,
    private dataSource: DataSource,
  ) {}

  async submitAnswers(evaluatorId: number, dto: SubmitEvaluationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify the evaluation belongs to this evaluator
      const evaluation = await queryRunner.manager.findOne(Evaluation, {
        where: { evaluation_id: dto.evaluation_id },
        relations: ['nomination'], // Need to join to check evaluator_id
      });

      if (!evaluation) throw new BadRequestException('Evaluation not found.');
      if (evaluation.nomination.evaluator_id !== evaluatorId) {
        throw new UnauthorizedException('You are not authorized to submit this evaluation.');
      }
      if (evaluation.status === EvaluationStatus.COMPLETED) {
        throw new BadRequestException('This evaluation has already been completed.');
      }

      // 2. Save Answers
      const answersToSave = dto.answers.map(ans => 
        this.answerRepo.create({
          evaluation_id: dto.evaluation_id,
          question_id: ans.question_id,
          numeric_score: ans.numeric_score,
          text_response: ans.text_response,
        })
      );
      await queryRunner.manager.save(answersToSave);

      // 3. Update Evaluation Status
      evaluation.status = EvaluationStatus.COMPLETED;
      evaluation.completed_at = new Date();
      await queryRunner.manager.save(evaluation);

      // 4. Invalidate Magic Link
      if (dto.magic_token_id) {
        await queryRunner.manager.update(MagicLink, dto.magic_token_id, { is_used: true });
      }

      await queryRunner.commitTransaction();
      
      // BONUS: Here is where you would emit an event or call a function to check 
      // if this was the 3rd completed evaluation, thereby triggering the Summary generation!

      return { message: 'Evaluation submitted successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err; // e.g., if Unique constraint (eval_id + question_id) fails
    } finally {
      await queryRunner.release();
    }
  }
}