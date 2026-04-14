import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Nomination } from './entities/nomination.entity';
import { SubmitNominationsDto } from './dto/submit-nominations.dto';
import { EvaluationCycle } from '../evaluation-cycles/entities/evaluation-cycle.entity';
import { MagicLink } from '../magic-links/entities/magic-link.entity';

@Injectable()
export class NominationsService {
  constructor(
    @InjectRepository(Nomination) private nomRepo: Repository<Nomination>,
    private dataSource: DataSource, // Used for Transactions
  ) {}

  async submitNominations(evaluateeId: number, dto: SubmitNominationsDto, tokenId?: number) {
    if (dto.evaluator_ids.includes(evaluateeId)) {
      throw new BadRequestException("You cannot nominate yourself.");
    }

    // 1. Find the active cycle
    const cycle = await this.dataSource.getRepository(EvaluationCycle).findOne({ where: { is_active: true } });
    if (!cycle) throw new BadRequestException("No active evaluation cycle found.");

    // 2. Use a Transaction to ensure all 5 save, or none save
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the Nomination entities
      const nominations = dto.evaluator_ids.map(evaluator_id => {
        return this.nomRepo.create({
          evaluatee_id: evaluateeId,
          evaluator_id: evaluator_id,
          cycle_id: cycle.cycle_id,
          status: 'PENDING' as any, // Using the enum value
        });
      });

      await queryRunner.manager.save(nominations);

      // Mark magic link as used (if provided)
      if (dto.magic_token_id) {
        await queryRunner.manager.update(MagicLink, dto.magic_token_id, { is_used: true });
      }

      if (tokenId) {
        await queryRunner.manager.update(MagicLink, tokenId, { is_used: true });
      }

      await queryRunner.commitTransaction();
      return { message: 'Nominations submitted successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}