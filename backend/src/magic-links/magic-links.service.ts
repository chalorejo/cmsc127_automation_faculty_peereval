import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { MagicLink } from './entities/magic-link.entity';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';

@Injectable()
export class MagicLinksService {
  private readonly logger = new Logger(MagicLinksService.name);

  constructor(
    @InjectRepository(MagicLink)
    private readonly magicLinkRepo: Repository<MagicLink>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creates a new magic link, saves it to the DB, and returns it.
   * This would be called by other services (e.g., when an evaluation is assigned).
   * @param createDto - The data needed to create the link.
   * @returns The newly created MagicLink entity.
   */
  async createLink(createDto: CreateMagicLinkDto): Promise<MagicLink> {
    const tokenHash = crypto.randomBytes(32).toString('hex');

    const expirationDays = this.configService.get<number>('MAGIC_LINK_EXPIRATION_DAYS', 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    
    const newLink = this.magicLinkRepo.create({
      ...createDto,
      token_hash: tokenHash,
      expires_at: expiresAt,
      is_used: false,
    });

    this.logger.log(`Creating new magic link for user ${createDto.user_id} for purpose ${createDto.purpose}`);
    return this.magicLinkRepo.save(newLink);
  }

  /**
   * Finds a magic link by its token hash and validates it.
   * A valid link must exist, not be used, and not be expired.
   * @param tokenHash - The secure token string from the URL.
   * @returns The MagicLink entity if valid, otherwise null.
   */
  async validateLink(tokenHash: string): Promise<MagicLink | null> {
    const link = await this.magicLinkRepo.findOne({
      where: {
        token_hash: tokenHash,
        is_used: false,
        expires_at: MoreThan(new Date()), // Check that expiration is in the future
      },
    });

    if (!link) {
      this.logger.warn(`Invalid or expired magic link attempt with hash: ${tokenHash}`);
      return null;
    }

    return link;
  }

  async findAll(): Promise<MagicLink[]> {
    return this.magicLinkRepo.find({
      order: { token_id: 'DESC' },
    });
  }

  async findOne(tokenId: number): Promise<MagicLink> {
    const link = await this.magicLinkRepo.findOne({
      where: { token_id: tokenId },
    });

    if (!link) {
      throw new NotFoundException(`Magic link #${tokenId} not found`);
    }

    return link;
  }
  
  /**
   * Marks a specific token as used.
   * This is typically called from within a transaction in another service
   * after the user has successfully completed their task (e.g., submitted a form).
   * @param tokenId - The primary key (ID) of the token to invalidate.
   */
  async invalidateToken(tokenId: number): Promise<void> {
    const result = await this.magicLinkRepo.update(tokenId, { is_used: true });
    if (!result.affected) {
      throw new NotFoundException(`Magic link #${tokenId} not found`);
    }
    this.logger.log(`Magic link with ID ${tokenId} has been used and invalidated.`);
  }

  async markAsUsed(tokenId: number): Promise<void> {
    await this.invalidateToken(tokenId);
  }

  async remove(tokenId: number): Promise<void> {
    const result = await this.magicLinkRepo.delete(tokenId);
    if (!result.affected) {
      throw new NotFoundException(`Magic link #${tokenId} not found`);
    }
    this.logger.log(`Magic link with ID ${tokenId} has been removed.`);
  }
}