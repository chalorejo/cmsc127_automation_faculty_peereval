import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MagicLinksService } from './magic-links.service';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';
import { UpdateMagicLinkDto } from './dto/update-magic-link.dto';

@Controller('magic-links')
export class MagicLinksController {
  constructor(private readonly magicLinksService: MagicLinksService) {}

  @Post()
  create(@Body() createMagicLinkDto: CreateMagicLinkDto) {
    return this.magicLinksService.create(createMagicLinkDto);
  }

  @Get()
  findAll() {
    return this.magicLinksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.magicLinksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMagicLinkDto: UpdateMagicLinkDto) {
    return this.magicLinksService.update(+id, updateMagicLinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.magicLinksService.remove(+id);
  }
}
