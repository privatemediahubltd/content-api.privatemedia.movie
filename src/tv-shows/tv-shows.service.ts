import { Injectable, Logger } from '@nestjs/common';
import { TMDBService } from '../shared/tmdb.service';
import { CacheService } from '../shared/cache.service';
import {
  TMDBTVShowListItem,
  TMDBTVShowDetails,
  TMDBSeasonDetails,
  TMDBPaginationResponse,
  TMDBGenre,
  TVShowSuggestType,
  SortOrder,
  ListQueryParams,
} from '../types/tmdb.types';

@Injectable()
export class TVShowsService {
  private readonly logger = new Logger(TVShowsService.name);

  constructor(
    private readonly tmdbService: TMDBService,
    private readonly cacheService: CacheService,
  ) { }

  async getTVShowsList(
    suggest?: TVShowSuggestType,
    sort?: SortOrder,
    genres?: string,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBTVShowListItem>> {
    const cacheKey = `tv-shows:list:${suggest || 'popular'}:${sort || 'desc'}:${page}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching TV shows list: suggest=${suggest}, page=${page}`,
        );
        const data = await this.tmdbService.getTVShowsList(suggest, {
          genres: genres || undefined,
          sort_by: sort || undefined,
        }, page);

        return data;
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getTVShowDetails(tvShowId: number): Promise<TMDBTVShowDetails> {
    const cacheKey = `tv-shows:details:${tvShowId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Fetching TV show details: ${tvShowId}`);
        return this.tmdbService.getTVShowDetails(tvShowId);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getTVShowSeasonDetails(
    tvShowId: number,
    seasonNumber: number,
  ): Promise<TMDBSeasonDetails> {
    const cacheKey = `tv-shows:season:${tvShowId}:${seasonNumber}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching TV show season details: ${tvShowId}, season ${seasonNumber}`,
        );
        return this.tmdbService.getTVShowSeasonDetails(tvShowId, seasonNumber);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getTVShowRecommendations(
    tvShowId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBTVShowListItem>> {
    const cacheKey = `tv-shows:recommendations:${tvShowId}:${page}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching TV show recommendations: ${tvShowId}, page ${page}`,
        );
        return this.tmdbService.getTVShowRecommendations(tvShowId, page);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getTVShowSimilar(
    tvShowId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBTVShowListItem>> {
    const cacheKey = `tv-shows:similar:${tvShowId}:${page}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Fetching TV show similar: ${tvShowId}, page ${page}`);
        return this.tmdbService.getTVShowSimilar(tvShowId, page);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getTVShowCredits(tvShowId: number): Promise<any> {
    const cacheKey = `tv-shows:credits:${tvShowId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Fetching TV show credits: ${tvShowId}`);
        return this.tmdbService.getTVShowCredits(tvShowId);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getTVShowEpisodeCredits(
    tvShowId: number,
    seasonNumber: number,
    episodeNumber: number,
  ): Promise<any> {
    const cacheKey = `tv-shows:episode-credits:${tvShowId}:${seasonNumber}:${episodeNumber}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching TV show episode credits: ${tvShowId}, S${seasonNumber}E${episodeNumber}`,
        );
        return this.tmdbService.getTVShowEpisodeCredits(
          tvShowId,
          seasonNumber,
          episodeNumber,
        );
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getTVShowGenres(): Promise<{ genres: TMDBGenre[] }> {
    const cacheKey = `tv-shows:genres`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug('Fetching TV show genres');
        return this.tmdbService.getTVShowGenres();
      },
      { ttl: 86400 }, // 24 hours cache (genres don't change often)
    );
  }
}
