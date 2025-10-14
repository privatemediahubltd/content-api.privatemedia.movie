import { Injectable, Logger } from '@nestjs/common';
import { TMDBService } from '../shared/tmdb.service';
import { CacheService } from '../shared/cache.service';
import {
  TMDBMovieListItem,
  TMDBMovieDetails,
  TMDBSeasonDetails,
  TMDBPaginationResponse,
  TMDBGenre,
  MovieSuggestType,
  SortOrder,
  ListQueryParams,
} from '../types/tmdb.types';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly tmdbService: TMDBService,
    private readonly cacheService: CacheService,
  ) {}

  async getMoviesList(
    suggest?: MovieSuggestType,
    sort?: SortOrder,
    query?: ListQueryParams,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBMovieListItem>> {
    const cacheKey = `movies:list:${suggest || 'popular'}:${sort || 'desc'}:${page}:${query?.genres}`;

    console.log(cacheKey)

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching movies list: suggest=${suggest}, page=${page}`,
        );
        const data = await this.tmdbService.getMoviesList(suggest, query, page);

        // Apply sorting if specified
        if (sort === 'asc') {
          data.results.sort((a, b) => a.popularity - b.popularity);
        } else if (sort === 'desc') {
          data.results.sort((a, b) => b.popularity - a.popularity);
        }

        return data;
      },
      { ttl: 1 }, // 1 minute cache
    );
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const cacheKey = `movies:details:${movieId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Fetching movie details: ${movieId}`);
        return this.tmdbService.getMovieDetails(movieId);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getMovieSeasonDetails(
    movieId: number,
    seasonNumber: number,
  ): Promise<TMDBSeasonDetails> {
    const cacheKey = `movies:season:${movieId}:${seasonNumber}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching movie season details: ${movieId}, season ${seasonNumber}`,
        );
        return this.tmdbService.getMovieSeasonDetails(movieId, seasonNumber);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getMovieRecommendations(
    movieId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBMovieListItem>> {
    const cacheKey = `movies:recommendations:${movieId}:${page}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(
          `Fetching movie recommendations: ${movieId}, page ${page}`,
        );
        return this.tmdbService.getMovieRecommendations(movieId, page);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getMovieSimilar(
    movieId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBMovieListItem>> {
    const cacheKey = `movies:similar:${movieId}:${page}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Fetching movie similar: ${movieId}, page ${page}`);
        return this.tmdbService.getMovieSimilar(movieId, page);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getMovieCredits(movieId: number): Promise<any> {
    const cacheKey = `movies:credits:${movieId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug(`Fetching movie credits: ${movieId}`);
        return this.tmdbService.getMovieCredits(movieId);
      },
      { ttl: 3600 }, // 1 hour cache
    );
  }

  async getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
    const cacheKey = `movies:genres`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        this.logger.debug('Fetching movie genres');
        return this.tmdbService.getMovieGenres();
      },
      { ttl: 86400 }, // 24 hours cache (genres don't change often)
    );
  }
}
