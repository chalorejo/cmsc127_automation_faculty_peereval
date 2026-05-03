import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { EvaluationSummary } from './entities/evaluation-summary.entity';
import { UserRole } from '../users/entities/user.entity';

type StoredEvaluatorResponse = {
  evaluator_id: number;
  evaluator_name: string;
  score: number | null;
  text_response: string | null;
};

type StoredQuestionStatistic = {
  question_id: number;
  question_text: string;
  question_type: string;
  order_in_section: number;
  evaluator_responses: StoredEvaluatorResponse[];
  average_score: number;
};

type StoredSectionStatistic = {
  section_id: number | null;
  section_name: string;
  order: number;
  average_score: number;
  standard_deviation: number;
  questions: StoredQuestionStatistic[];
};

type StoredCommentGroup = {
  question_id: number;
  question_text: string;
  comments: Array<{
    evaluator_id: number;
    evaluator_name: string;
    text_response: string;
    visibility: 'chair_only';
  }>;
};

@Injectable()
export class EvaluationSummariesService {
  constructor(
    @InjectRepository(EvaluationSummary) private summaryRepo: Repository<EvaluationSummary>,
  ) {}

  private roundToTwoDecimals(value: number) {
    return Math.round(value * 100) / 100;
  }

  private formatDecimal(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      return '0.00';
    }

    return Number(value).toFixed(2);
  }

  private ensureCanViewSummary(summary: EvaluationSummary, requesterId: number, role: UserRole) {
    if (role === UserRole.FACULTY && summary.evaluatee_id !== requesterId) {
      throw new ForbiddenException('You can only access your own evaluation summaries.');
    }
  }

  private getStoredSections(summary: EvaluationSummary): StoredSectionStatistic[] {
    return Array.isArray(summary.section_statistics) ? (summary.section_statistics as StoredSectionStatistic[]) : [];
  }

  private getStoredComments(summary: EvaluationSummary): StoredCommentGroup[] {
    return Array.isArray(summary.open_ended_comments) ? (summary.open_ended_comments as StoredCommentGroup[]) : [];
  }

  private buildCommentPayload(summary: EvaluationSummary, role: UserRole) {
    const comments = this.getStoredComments(summary);

    if (role === UserRole.FACULTY) {
      return comments.map((entry) => ({
        question_id: entry.question_id,
        question_text: entry.question_text,
        comments: [],
      }));
    }

    return comments;
  }

  private buildPeerColumns(sections: StoredSectionStatistic[]) {
    const firstQuestion = sections.flatMap((section) => section.questions)[0];

    if (!firstQuestion) {
      return [];
    }

    return firstQuestion.evaluator_responses.map((response, index) => ({
      index: index + 1,
      evaluator_id: response.evaluator_id,
      evaluator_name: response.evaluator_name,
      label: `Peer ${index + 1}`,
    }));
  }

  async findMySummaries(evaluateeId: number) {
    return this.summaryRepo.find({
      where: { 
        evaluatee_id: evaluateeId,
        chair_sign_id: Not(IsNull()), // Must be signed by chair
        dean_sign_id: Not(IsNull()),  // Must be signed by dean
      },
      relations: ['cycle'], // Join the cycle to show the year
      order: { cycle: { year: 'DESC' } },
    });
  }

  async findPendingSignature(role: UserRole) {
    if (role === UserRole.DEP_CHAIR) {
      return this.summaryRepo.find({
        where: { chair_sign_id: IsNull() },
        relations: ['cycle', 'evaluatee'],
        order: { summary_id: 'ASC' },
      });
    }

    if (role === UserRole.DEAN) {
      return this.summaryRepo.find({
        where: {
          chair_sign_id: Not(IsNull()),
          dean_sign_id: IsNull(),
        },
        relations: ['cycle', 'evaluatee', 'chairSign'],
        order: { summary_id: 'ASC' },
      });
    }

    throw new ForbiddenException('Only Department Chair or Dean can access pending signatures.');
  }

  async signSummary(summaryId: number, signerId: number, role: UserRole) {
    const summary = await this.summaryRepo.findOne({ where: { summary_id: summaryId } });

    if (!summary) {
      throw new NotFoundException(`Evaluation summary #${summaryId} not found`);
    }

    if (role === UserRole.DEP_CHAIR) {
      if (summary.chair_sign_id) {
        throw new BadRequestException('This summary is already signed by a Department Chair.');
      }

      summary.chair_sign_id = signerId;
      await this.summaryRepo.save(summary);
      return { message: 'Summary signed by Department Chair.' };
    }

    if (role === UserRole.DEAN) {
      if (!summary.chair_sign_id) {
        throw new BadRequestException('Dean cannot sign before Department Chair signature.');
      }

      if (summary.dean_sign_id) {
        throw new BadRequestException('This summary is already signed by a Dean.');
      }

      summary.dean_sign_id = signerId;
      await this.summaryRepo.save(summary);
      return { message: 'Summary signed by Dean.' };
    }

    throw new ForbiddenException('Only Department Chair or Dean can sign summaries.');
  }

  async findByFacultyId(facultyId: number) {
    return this.summaryRepo.find({
      where: { evaluatee_id: facultyId },
      relations: ['cycle', 'evaluatee', 'chairSign', 'deanSign'],
      order: { cycle: { year: 'DESC' } },
    });
  }

  async getPdfData(summaryId: number, requesterId: number, role: UserRole) {
    const summary = await this.summaryRepo.findOne({
      where: { summary_id: summaryId },
      relations: ['cycle', 'evaluatee', 'chairSign', 'deanSign'],
    });

    if (!summary) {
      throw new NotFoundException(`Evaluation summary #${summaryId} not found`);
    }

    this.ensureCanViewSummary(summary, requesterId, role);

    const sections = this.getStoredSections(summary);

    return {
      summary_id: summary.summary_id,
      cycle_id: summary.cycle_id,
      cycle_year: summary.cycle?.year,
      evaluatee_id: summary.evaluatee_id,
      evaluatee_name: summary.evaluatee?.full_name,
      average_score: this.formatDecimal(summary.average_score),
      total_average: this.formatDecimal(summary.total_average ?? summary.average_score),
      is_satisfactory: summary.is_satisfactory,
      sections,
      peer_columns: this.buildPeerColumns(sections),
      open_ended_comments: this.buildCommentPayload(summary, role),
      signatures: {
        chair_sign_id: summary.chair_sign_id,
        dean_sign_id: summary.dean_sign_id,
        chair_signed_by: summary.chairSign?.full_name ?? null,
        dean_signed_by: summary.deanSign?.full_name ?? null,
      },
      document_url: summary.document_url,
    };
  }

  async getPdfStructure(summaryId: number, requesterId: number, role: UserRole) {
    const pdfData = await this.getPdfData(summaryId, requesterId, role);

    return {
      summary_id: pdfData.summary_id,
      cycle_year: pdfData.cycle_year,
      evaluatee_name: pdfData.evaluatee_name,
      total_average: pdfData.total_average,
      is_satisfactory: pdfData.is_satisfactory,
      peer_columns: pdfData.peer_columns,
      sections: pdfData.sections.map((section: StoredSectionStatistic) => ({
        section_id: section.section_id,
        section_name: section.section_name,
        average_score: this.formatDecimal(section.average_score),
        standard_deviation: this.formatDecimal(section.standard_deviation),
        questions: section.questions.map((question) => ({
          question_id: question.question_id,
          question_text: question.question_text,
          question_type: question.question_type,
          order_in_section: question.order_in_section,
          peer_scores: question.evaluator_responses.map((response) => response.score),
          evaluator_responses: question.evaluator_responses,
          average_score: this.formatDecimal(question.average_score),
        })),
      })),
      open_ended_comments: pdfData.open_ended_comments,
      signatures: pdfData.signatures,
      document_url: pdfData.document_url,
    };
  }
}