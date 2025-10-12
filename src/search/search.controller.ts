import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query(ValidationPipe) query: SearchDto) {
    return this.searchService.search(
      query.q,
      query.type,
      query.sort,
      query.page,
    );
  }
}
