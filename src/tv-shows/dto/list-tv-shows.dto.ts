import { IsOptional, IsEnum, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TVShowSuggestType, SortOrder } from '../../types/tmdb.types';

export class ListTVShowsDto {
  [x: string]: string | undefined;
  @IsOptional()
  @IsEnum(['popular', 'on-air', 'top-rated'])
  suggest?: TVShowSuggestType;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort?: SortOrder;

  @IsOptional()
  @IsString()
  genres?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => String)
  page?: string = '1';
}
