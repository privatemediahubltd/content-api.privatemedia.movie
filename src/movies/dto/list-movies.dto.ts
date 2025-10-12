import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MovieSuggestType, SortOrder } from '../../types/tmdb.types';

export class ListMoviesDto {
  @IsOptional()
  @IsEnum(['popular', 'now-playing', 'upcoming', 'top-rated'])
  suggest?: MovieSuggestType;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort?: SortOrder;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  page?: number = 1;
}
