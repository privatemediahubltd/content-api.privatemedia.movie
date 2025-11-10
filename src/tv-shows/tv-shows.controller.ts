import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { TVShowsService } from './tv-shows.service';
import { ListTVShowsDto } from './dto/list-tv-shows.dto';

@Controller('tv-shows')
export class TVShowsController {
  constructor(private readonly tvShowsService: TVShowsService) {}

  @Get()
  async getTVShows(@Query(ValidationPipe) query: ListTVShowsDto) {
    return this.tvShowsService.getTVShowsList(
      query.suggest,
      query.sort,
      query.genres,
      Number(query.page),
    );
  }

  @Get('genres')
  async getTVShowGenres() {
    return this.tvShowsService.getTVShowGenres();
  }

  @Get(':id')
  async getTVShowDetails(@Param('id', ParseIntPipe) id: number) {
    return this.tvShowsService.getTVShowDetails(id);
  }

  @Get(':id/season/:season_number')
  async getTVShowSeasonDetails(
    @Param('id', ParseIntPipe) id: number,
    @Param('season_number', ParseIntPipe) seasonNumber: number,
  ) {
    return this.tvShowsService.getTVShowSeasonDetails(id, seasonNumber);
  }

  @Get(':id/recommendations')
  async getTVShowRecommendations(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') pageStr: string,
  ) {
    return this.tvShowsService.getTVShowRecommendations(id, Number(pageStr)||1);
  }

  @Get(':id/similar')
  async getTVShowSimilar(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') pageStr: string,
  ) {
    return this.tvShowsService.getTVShowSimilar(id, Number(pageStr)||1);
  }

  @Get(':id/credits')
  async getTVShowCredits(@Param('id', ParseIntPipe) id: number) {
    return this.tvShowsService.getTVShowCredits(id);
  }

  @Get(':id/season/:season_number/episode/:episode_number/credits')
  async getTVShowEpisodeCredits(
    @Param('id', ParseIntPipe) id: number,
    @Param('season_number', ParseIntPipe) seasonNumber: number,
    @Param('episode_number', ParseIntPipe) episodeNumber: number,
  ) {
    return this.tvShowsService.getTVShowEpisodeCredits(
      id,
      seasonNumber,
      episodeNumber,
    );
  }
}
