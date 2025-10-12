import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TMDBService } from '../shared/tmdb.service';
import { CacheService } from '../shared/cache.service';
import { TrendingTimeWindow, TrendingMediaType } from './dto/trending.dto';

@Injectable()
export class TrendingService {
  private readonly logger = new Logger(TrendingService.name);

  constructor(
    private readonly tmdbService: TMDBService,
    private readonly cacheService: CacheService,
  ) {}

  private validateTimeWindow(timeWindow: string): TrendingTimeWindow {
    if (!['day', 'week'].includes(timeWindow)) {
      throw new BadRequestException(
        'Invalid time_window. Must be either "day" or "week"',
      );
    }
    return timeWindow as TrendingTimeWindow;
  }

  async getTrending(
    mediaType: TrendingMediaType,
    timeWindow: string,
    page: number = 1,
  ): Promise<any> {
    const validatedTimeWindow = this.validateTimeWindow(timeWindow);
    const cacheKey = `trending:${mediaType}:${validatedTimeWindow}:${page}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching trending ${mediaType} for ${validatedTimeWindow}, page ${page}`,
        );

        let data;
        switch (mediaType) {
          case 'all':
            data = await this.tmdbService.getTrendingAll(validatedTimeWindow, page);
            break;
          case 'movie':
            data = await this.tmdbService.getTrendingMovies(validatedTimeWindow, page);
            break;
          case 'tv':
            data = await this.tmdbService.getTrendingTV(validatedTimeWindow, page);
            break;
          case 'person':
            data = await this.tmdbService.getTrendingPeople(validatedTimeWindow, page);
            break;
          default:
            throw new BadRequestException('Invalid media type');
        }

        return data;
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }
}
