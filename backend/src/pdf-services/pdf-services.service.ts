import { Injectable } from '@nestjs/common';
import { CreatePdfServiceDto } from './dto/create-pdf-service.dto';
import { UpdatePdfServiceDto } from './dto/update-pdf-service.dto';
import { EvaluationSummariesService } from '../evaluation-summaries/evaluation-summaries.service';
import { UserRole } from '../users/entities/user.entity';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';

type PdfPeerColumn = {
  index: number;
  evaluator_id: number;
  evaluator_name: string;
  label: string;
};

type PdfStructure = {
  summary_id: number;
  cycle_year: number;
  evaluatee_name: string;
  total_average: string;
  is_satisfactory: boolean;
  peer_columns: PdfPeerColumn[];
  sections: Array<{
    section_id: number | null;
    section_name: string;
    average_score: string;
    standard_deviation: string;
    questions: Array<{
      question_id: number;
      question_text: string;
      question_type: string;
      order_in_section: number;
      peer_scores: Array<number | null>;
      evaluator_responses: any[];
      average_score: string;
    }>;
  }>;
  open_ended_comments: Array<{
    question_id: number;
    question_text: string;
    comments: Array<{
      evaluator_id: number;
      evaluator_name: string;
      text_response: string;
      visibility: string;
    }>;
  }>;
  signatures: {
    chair_sign_id: number | null;
    dean_sign_id: number | null;
    chair_signed_by: string | null;
    dean_signed_by: string | null;
  };
  document_url: string | null;
};

@Injectable()
export class PdfServicesService {
  constructor(private readonly summariesService: EvaluationSummariesService) {}

  async generateEvaluationSummaryPdf(
    summaryId: number,
    requesterId: number,
    role: UserRole,
  ): Promise<Buffer> {
    const structure = await this.summariesService.getPdfStructure(summaryId, requesterId, role);

    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Evaluation Summary</title>
        <style>
          body { font-family: 'Times New Roman', Arial, sans-serif; margin: 28px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 22px; }
          th, td { border: 1px solid #000; padding: 8px 10px; vertical-align: top; }
          th { background-color: #f2f2f2; text-align: center; }
          .section-header td { background-color: #e6f0ff; font-weight: bold; }
          .section-summary td { background-color: #f9f9f9; font-style: italic; }
          .question-row td:first-child { padding-left: 20px; }
          .total-row td { font-weight: bold; background-color: #d9ead3; }
          .comment-section { margin-top: 24px; border-top: 1px solid #ccc; padding-top: 14px; }
          .comment-section h3 { margin-bottom: 12px; }
          .comment-question { margin-bottom: 8px; }
          .signatures { margin-top: 34px; display: flex; justify-content: space-between; }
          .signature-label { display: inline-block; min-width: 140px; }
        </style>
      </head>
      <body>
        <h2 style="text-align:center; margin-bottom: 18px;">Faculty Peer Evaluation Summary</h2>
        <table>
          <thead>
            <tr>
              <th style="width:32%;">Area of Evaluation</th>
              {{#each peer_columns}}
                <th style="width:12%;">{{label}}</th>
              {{/each}}
              <th style="width:14%;">Average per question</th>
              <th style="width:18%;">Average & Standard Deviation</th>
            </tr>
          </thead>
          <tbody>
            {{#each sections}}
              <tr class="section-header">
                <td><strong>{{section_name}}</strong></td>
                {{#each ../peer_columns}}<td></td>{{/each}}
                <td></td>
                <td>{{average_score}} ± {{standard_deviation}}</td>
              </tr>
              {{#each questions}}
                <tr class="question-row">
                  <td>{{question_text}}</td>
                  {{#each peer_scores}}
                    <td>{{#if (isDefined this)}}{{this}}{{else}}—{{/if}}</td>
                  {{/each}}
                  <td>{{average_score}}</td>
                  <td></td>
                </tr>
              {{/each}}
              <tr class="section-summary">
                <td><strong>Section Summary</strong></td>
                {{#each ../peer_columns}}<td></td>{{/each}}
                <td>{{average_score}}</td>
                <td>{{standard_deviation}}</td>
              </tr>
            {{/each}}
            <tr class="total-row">
              <td><strong>Total Average (All Sections)</strong></td>
              {{#each peer_columns}}<td></td>{{/each}}
              <td></td>
              <td>{{total_average}}</td>
            </tr>
          </tbody>
        </table>

        <div class="comment-section">
          <h3>Any comments about the faculty being evaluated:</h3>
          {{#if showOpenEndedNotice}}
            <p><em>[Restricted – only DMPCS Chair can view the answer for this open ended question]</em></p>
          {{else}}
            {{#each open_ended_comments}}
              <div class="comment-question">
                <strong>{{question_text}}</strong>
                {{#if comments.length}}
                  {{#each comments}}
                    <p><strong>{{evaluator_name}}:</strong> {{text_response}}</p>
                  {{/each}}
                {{else}}
                  <p><em>No comments available.</em></p>
                {{/if}}
              </div>
            {{/each}}
          {{/if}}
        </div>

        <div class="signatures">
          <span class="signature-label">Prepared by: _________________</span>
          <span class="signature-label">Aid Prepared</span>
          <span class="signature-label">Department Endorsed</span>
          <span class="signature-label">Dean Approved</span>
        </div>
      </body>
      </html>
    `;

    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('isDefined', (value) => value !== null && value !== undefined);
    const compiled = handlebars.compile(template);
    const html = compiled({ ...structure, showOpenEndedNotice: role === UserRole.FACULTY });

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfData = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm' } });
    await browser.close();

    const pdfBuffer = Buffer.from(pdfData);
    await this.summariesService.savePdfDocument(summaryId, pdfBuffer);
    return pdfBuffer;
  }

  create(createPdfServiceDto: CreatePdfServiceDto) {
    return 'This action adds a new pdfService';
  }

  findAll() {
    return `This action returns all pdfServices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pdfService`;
  }

  update(id: number, updatePdfServiceDto: UpdatePdfServiceDto) {
    return `This action updates a #${id} pdfService`;
  }

  remove(id: number) {
    return `This action removes a #${id} pdfService`;
  }
}
