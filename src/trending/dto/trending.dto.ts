import { IsIn, IsOptional, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class TrendingQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;
}

export type TrendingTimeWindow = 'day' | 'week';
export type TrendingMediaType = 'all' | 'movie' | 'tv' | 'person';
