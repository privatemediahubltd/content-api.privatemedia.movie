import { Controller, Get, Param } from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('pm-movie/:fileName')
  async getTmdbImage(@Param('fileName') fileName: string) {
    return this.imagesService.uploadMovieSiteImage(fileName);
  }
}
