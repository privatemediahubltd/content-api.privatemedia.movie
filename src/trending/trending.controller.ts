import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { TrendingService } from './trending.service';
import { TrendingQueryDto, TrendingMediaType } from './dto/trending.dto';

@Controller('trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get(':mediaType/:timeWindow')
  async getTrending(
    @Param('mediaType') mediaType: TrendingMediaType,
    @Param('timeWindow') timeWindow: string,
    @Query(ValidationPipe) query: TrendingQueryDto,
  ) {
    return this.trendingService.getTrending(mediaType, timeWindow, query.page);
  }
}
