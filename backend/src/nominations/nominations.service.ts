import { Injectable } from '@nestjs/common';
import { CreateNominationDto } from './dto/create-nomination.dto';
import { UpdateNominationDto } from './dto/update-nomination.dto';

@Injectable()
export class NominationsService {
  create(createNominationDto: CreateNominationDto) {
    return 'This action adds a new nomination';
  }

  findAll() {
    return `This action returns all nominations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nomination`;
  }

  update(id: number, updateNominationDto: UpdateNominationDto) {
    return `This action updates a #${id} nomination`;
  }

  remove(id: number) {
    return `This action removes a #${id} nomination`;
  }
}
