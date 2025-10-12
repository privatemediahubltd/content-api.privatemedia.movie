import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SearchType, SortOrder } from '../../types/tmdb.types';

export class SearchDto {
  @IsNotEmpty()
  q: string;

  @IsOptional()
  @IsEnum(['movie', 'tv', 'multi'])
  type?: SearchType = 'multi';

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
