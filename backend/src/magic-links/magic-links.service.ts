import { Injectable } from '@nestjs/common';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';
import { UpdateMagicLinkDto } from './dto/update-magic-link.dto';

@Injectable()
export class MagicLinksService {
  create(createMagicLinkDto: CreateMagicLinkDto) {
    return 'This action adds a new magicLink';
  }

  findAll() {
    return `This action returns all magicLinks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} magicLink`;
  }

  update(id: number, updateMagicLinkDto: UpdateMagicLinkDto) {
    return `This action updates a #${id} magicLink`;
  }

  remove(id: number) {
    return `This action removes a #${id} magicLink`;
  }
}
