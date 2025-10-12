import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ListMoviesDto } from './dto/list-movies.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async getMovies(@Query(ValidationPipe) query: ListMoviesDto) {
    return this.moviesService.getMoviesList(
      query.suggest,
      query.sort,
      query.page,
    );
  }
  
  @Get('genres')
  async getMovieGenres() {
    return this.moviesService.getMovieGenres();
  }

  @Get(':id')
  async getMovieDetails(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieDetails(id);
  }

  @Get(':id/season/:season_number')
  async getMovieSeasonDetails(
    @Param('id', ParseIntPipe) id: number,
    @Param('season_number', ParseIntPipe) seasonNumber: number,
  ) {
    return this.moviesService.getMovieSeasonDetails(id, seasonNumber);
  }

  @Get(':id/recommendations')
  async getMovieRecommendations(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.moviesService.getMovieRecommendations(id, page);
  }

  @Get(':id/similar')
  async getMovieSimilar(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.moviesService.getMovieSimilar(id, page);
  }

  @Get(':id/credits')
  async getMovieCredits(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieCredits(id);
  }
}
