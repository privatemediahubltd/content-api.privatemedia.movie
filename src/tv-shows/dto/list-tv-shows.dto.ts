import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TVShowSuggestType, SortOrder } from '../../types/tmdb.types';

export class ListTVShowsDto {
  @IsOptional()
  @IsEnum(['popular', 'on-air', 'top-rated'])
  suggest?: TVShowSuggestType;

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
