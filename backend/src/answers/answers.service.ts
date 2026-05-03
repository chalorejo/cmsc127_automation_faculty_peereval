import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { Evaluation, EvaluationStatus } from '../evaluations/entities/evaluation.entity';
import { MagicLink, MagicLinkPurpose } from '../magic-links/entities/magic-link.entity';
import { EvaluationSummary } from '../evaluation-summaries/entities/evaluation-summary.entity';
import { QuestionType } from '../questions/entities/question.entity';

type EvaluatorResponse = {
  evaluator_id: number;
  evaluator_name: string;
  score: number | null;
  text_response: string | null;
};

type QuestionStatistic = {
  question_id: number;
  question_text: string;
  question_type: QuestionType;
  section_id: number | null;
  order_in_section: number;
  evaluator_responses: EvaluatorResponse[];
  average_score: number;
  questionScores?: number[];
};

type SectionStatistic = {
  section_id: number | null;
  section_name: string;
  order: number;
  average_score: number;
  standard_deviation: number;
  questions: QuestionStatistic[];
  sectionScores?: number[];
};

type OpenEndedComment = {
  question_id: number;
  question_text: string;
  comments: Array<{
    evaluator_id: number;
    evaluator_name: string;
    text_response: string;
    visibility: 'chair_only';
  }>;
};

type GeneratedSummaryData = {
  cycle_id: number;
  evaluatee_id: number;
  average_score: number;
  total_average: number;
  is_satisfactory: boolean;
  section_statistics: SectionStatistic[];
  open_ended_comments: OpenEndedComment[];
};

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer) private answerRepo: Repository<Answer>,
    private dataSource: DataSource,
  ) {}

  async submitAnswers(evaluatorId: number, dto: SubmitEvaluationDto, tokenId?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify the evaluation belongs to this evaluator
      const evaluation = await queryRunner.manager.findOne(Evaluation, {
        where: { evaluation_id: dto.evaluation_id },
        relations: ['nomination', 'nomination.evaluator', 'nomination.evaluatee', 'nomination.cycle'],
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

      // 4. Invalidate evaluation magic link from JWT payload (if present)
      if (tokenId) {
        const token = await queryRunner.manager.findOne(MagicLink, {
          where: {
            token_id: tokenId,
            user_id: evaluatorId,
            purpose: MagicLinkPurpose.EVALUATION,
            is_used: false,
          },
        });

        if (!token || token.expires_at <= new Date()) {
          throw new BadRequestException('Invalid, expired, or already used evaluation magic link.');
        }

        await queryRunner.manager.update(MagicLink, tokenId, { is_used: true });
      }

      // 5. Generate the summary if this completion finished the full set of evaluations
      await this.generateSummaryIfComplete(queryRunner, evaluation.evaluation_id);

      await queryRunner.commitTransaction();

      return { message: 'Evaluation submitted successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err; // e.g., if Unique constraint (eval_id + question_id) fails
    } finally {
      await queryRunner.release();
    }
  }

  private roundToTwoDecimals(value: number) {
    return Math.round(value * 100) / 100;
  }

  private calculateAverage(values: number[]) {
    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((sum, current) => sum + current, 0);
    return this.roundToTwoDecimals(total / values.length);
  }

  private calculateStandardDeviation(values: number[]) {
    if (values.length <= 1) {
      return 0;
    }

    const mean = values.reduce((sum, current) => sum + current, 0) / values.length;
    const squaredDifferences = values.reduce((sum, current) => sum + Math.pow(current - mean, 2), 0);
    const variance = squaredDifferences / (values.length - 1);
    return this.roundToTwoDecimals(Math.sqrt(variance));
  }

  private async generateSummaryIfComplete(queryRunner: ReturnType<DataSource['createQueryRunner']>, evaluationId: number) {
    const evaluation = await queryRunner.manager.findOne(Evaluation, {
      where: { evaluation_id: evaluationId },
      relations: ['nomination', 'nomination.evaluatee', 'nomination.cycle'],
    });

    if (!evaluation) {
      throw new BadRequestException('Evaluation not found while generating summary.');
    }

    const evaluateeId = evaluation.nomination.evaluatee_id;
    const cycleId = evaluation.nomination.cycle_id;

    const summaryExists = await queryRunner.manager.findOne(EvaluationSummary, {
      where: {
        evaluatee_id: evaluateeId,
        cycle_id: cycleId,
      },
    });

    if (summaryExists) {
      return;
    }

    const completionCounts = await queryRunner.manager
      .createQueryBuilder(Evaluation, 'evaluation')
      .innerJoin('evaluation.nomination', 'nomination')
      .where('nomination.evaluatee_id = :evaluateeId', { evaluateeId })
      .andWhere('nomination.cycle_id = :cycleId', { cycleId })
      .select('COUNT(evaluation.evaluation_id)', 'total_count')
      .addSelect(
        'COUNT(CASE WHEN evaluation.status = :completedStatus THEN 1 END)',
        'completed_count',
      )
      .setParameter('completedStatus', EvaluationStatus.COMPLETED)
      .getRawOne<{ total_count: string; completed_count: string }>();

    const totalCount = Number(completionCounts?.total_count ?? 0);
    const completedCount = Number(completionCounts?.completed_count ?? 0);

    if (totalCount === 0 || completedCount !== totalCount) {
      return;
    }

    const completedAnswers = await queryRunner.manager
      .createQueryBuilder(Answer, 'answer')
      .innerJoinAndSelect('answer.question', 'question')
      .leftJoinAndSelect('question.section', 'section')
      .innerJoinAndSelect('answer.evaluation', 'evaluation')
      .innerJoinAndSelect('evaluation.nomination', 'nomination')
      .innerJoinAndSelect('nomination.evaluator', 'evaluator')
      .where('nomination.evaluatee_id = :evaluateeId', { evaluateeId })
      .andWhere('nomination.cycle_id = :cycleId', { cycleId })
      .andWhere('evaluation.status = :completedStatus', { completedStatus: EvaluationStatus.COMPLETED })
      .orderBy('COALESCE(section.order, 999999)', 'ASC')
      .addOrderBy('question.order_in_section', 'ASC')
      .addOrderBy('evaluator.full_name', 'ASC')
      .getMany();

    const sections = new Map<number | null, SectionStatistic & { sectionScores: number[] }>();
    const questionMap = new Map<number, QuestionStatistic & { questionScores: number[] }>();
    const openEndedMap = new Map<number, OpenEndedComment>();
    const allScores: number[] = [];

    for (const answer of completedAnswers) {
      const question = answer.question;
      const section = question.section;
      const score = answer.numeric_score !== null && answer.numeric_score !== undefined
        ? Number(answer.numeric_score)
        : null;

      if (!questionMap.has(question.question_id)) {
        questionMap.set(question.question_id, {
          question_id: question.question_id,
          question_text: question.question_text,
          question_type: question.type,
          section_id: section?.id ?? null,
          order_in_section: question.order_in_section ?? 0,
          evaluator_responses: [],
          average_score: 0,
          questionScores: [],
        });
      }

      const questionEntry = questionMap.get(question.question_id)!;
      questionEntry.evaluator_responses.push({
        evaluator_id: answer.evaluation.nomination.evaluator_id,
        evaluator_name: answer.evaluation.nomination.evaluator.full_name,
        score,
        text_response: answer.text_response ?? null,
      });

      if (score !== null) {
        questionEntry.questionScores.push(score);
        allScores.push(score);
      }

      if (question.type === QuestionType.OPEN_ENDED && answer.text_response?.trim()) {
        if (!openEndedMap.has(question.question_id)) {
          openEndedMap.set(question.question_id, {
            question_id: question.question_id,
            question_text: question.question_text,
            comments: [],
          });
        }

        const commentEntry = openEndedMap.get(question.question_id)!;
        commentEntry.comments.push({
          evaluator_id: answer.evaluation.nomination.evaluator_id,
          evaluator_name: answer.evaluation.nomination.evaluator.full_name,
          text_response: answer.text_response,
          visibility: 'chair_only',
        });
      }

      const sectionKey = section?.id ?? null;
      if (!sections.has(sectionKey)) {
        sections.set(sectionKey, {
          section_id: section?.id ?? null,
          section_name: section?.name ?? 'Uncategorized',
          order: section?.order ?? 999999,
          average_score: 0,
          standard_deviation: 0,
          questions: [],
          sectionScores: [],
        });
      }

      const sectionEntry = sections.get(sectionKey)!;
      if (score !== null) {
        sectionEntry.sectionScores.push(score);
      }
    }

    for (const questionEntry of questionMap.values()) {
      questionEntry.evaluator_responses.sort((left, right) => left.evaluator_name.localeCompare(right.evaluator_name));
      questionEntry.average_score = this.calculateAverage(questionEntry.questionScores);
    }

    for (const sectionEntry of sections.values()) {
      sectionEntry.questions = Array.from(questionMap.values())
        .filter((question) => question.section_id === sectionEntry.section_id)
        .sort((left, right) => left.order_in_section - right.order_in_section);
      sectionEntry.average_score = this.calculateAverage(sectionEntry.sectionScores);
      sectionEntry.standard_deviation = this.calculateStandardDeviation(sectionEntry.sectionScores);
    }

    const orderedQuestions = Array.from(questionMap.values()).map(({ questionScores, ...question }) => question);
    const orderedSections = Array.from(sections.values()).map(({ sectionScores, ...section }) => ({
      ...section,
      questions: orderedQuestions.filter((question) => question.section_id === section.section_id),
    })).sort((left, right) => left.order - right.order);
    const totalAverage = this.calculateAverage(allScores);

    const summaryData: GeneratedSummaryData = {
      cycle_id: cycleId,
      evaluatee_id: evaluateeId,
      average_score: totalAverage,
      total_average: totalAverage,
      is_satisfactory: totalAverage >= 3.6,
      section_statistics: orderedSections,
      open_ended_comments: Array.from(openEndedMap.values()),
    };

    await queryRunner.manager.save(EvaluationSummary, {
      cycle_id: summaryData.cycle_id,
      evaluatee_id: summaryData.evaluatee_id,
      average_score: summaryData.average_score,
      total_average: summaryData.total_average,
      is_satisfactory: summaryData.is_satisfactory,
      section_statistics: summaryData.section_statistics,
      open_ended_comments: summaryData.open_ended_comments,
    });
  }
}