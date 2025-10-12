import { Injectable, Logger } from '@nestjs/common';
import { TMDBService } from '../shared/tmdb.service';
import { CacheService } from '../shared/cache.service';
import { TMDBSearchResult, SearchType, SortOrder } from '../types/tmdb.types';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly tmdbService: TMDBService,
    private readonly cacheService: CacheService,
  ) {}

  async search(
    query: string,
    type: SearchType = 'multi',
    sort?: SortOrder,
    page: number = 1,
  ): Promise<TMDBSearchResult> {
    const cacheKey = `search:${query}:${type}:${sort || 'desc'}:${page}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Searching: query="${query}", type=${type}, page=${page}`,
        );
        const data = await this.tmdbService.search(query, type, page);

        // Apply sorting if specified
        if (sort === 'asc') {
          data.results.sort((a, b) => a.popularity - b.popularity);
        } else if (sort === 'desc') {
          data.results.sort((a, b) => b.popularity - a.popularity);
        }

        return data;
      },
      { ttl: 1800 }, // 30 minutes cache for search results
    );
  }
}
