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
      query,
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

  @Get(':id/recommendations')
  async getMovieRecommendations(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') pageStr: string,
  ) {
    return this.moviesService.getMovieRecommendations(id, Number(pageStr)||1);
  }

  @Get(':id/similar')
  async getMovieSimilar(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') pageStr: string,
  ) {
    return this.moviesService.getMovieSimilar(id, Number(pageStr)||1);
  }

  @Get(':id/credits')
  async getMovieCredits(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieCredits(id);
  }
}
