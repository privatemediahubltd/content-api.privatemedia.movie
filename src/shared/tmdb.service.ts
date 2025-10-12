import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  TMDBMovieListItem,
  TMDBMovieDetails,
  TMDBTVShowListItem,
  TMDBTVShowDetails,
  TMDBSeasonDetails,
  TMDBPaginationResponse,
  TMDBSearchResult,
  TMDBGenre,
  MovieSuggestType,
  TVShowSuggestType,
  SearchType,
} from '../types/tmdb.types';

@Injectable()
export class TMDBService {
  private readonly logger = new Logger(TMDBService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>('TMDB_ACCESS_KEY');
    if (!accessToken) {
      throw new Error('TMDB_ACCESS_KEY is not defined in environment variables');
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      headers : {
        Authorization : `Bearer ${accessToken}`
      },
      timeout: 10000,
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(
          `TMDB API Error: ${error.message}`,
          error.response?.data,
        );
        throw error;
      },
    );
  }

  // Movies endpoints
  async getMoviesList(
    suggest?: MovieSuggestType,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBMovieListItem>> {
    let endpoint = 'movie/popular';

    if (suggest) {
      switch (suggest) {
        case 'now-playing':
          endpoint = 'movie/now_playing';
          break;
        case 'upcoming':
          endpoint = 'movie/upcoming';
          break;
        case 'top-rated':
          endpoint = 'movie/top_rated';
          break;
        case 'popular':
        default:
          endpoint = 'movie/popular';
          break;
      }
    }

    const response = await this.axiosInstance.get(endpoint, {
      params: { page },
    });

    return response.data;
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const response = await this.axiosInstance.get(`movie/${movieId}`);
    return response.data;
  }

  async getMovieSeasonDetails(
    movieId: number,
    seasonNumber: number,
  ): Promise<TMDBSeasonDetails> {
    const response = await this.axiosInstance.get(
      `movie/${movieId}/season/${seasonNumber}`,
    );
    return response.data;
  }

  async getMovieRecommendations(
    movieId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBMovieListItem>> {
    const response = await this.axiosInstance.get(
      `movie/${movieId}/recommendations`,
      {
        params: { page },
      },
    );
    return response.data;
  }

  async getMovieSimilar(
    movieId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBMovieListItem>> {
    const response = await this.axiosInstance.get(`movie/${movieId}/similar`, {
      params: { page },
    });
    return response.data;
  }

  async getMovieCredits(movieId: number): Promise<any> {
    const response = await this.axiosInstance.get(`movie/${movieId}/credits`);
    return response.data;
  }

  // TV Shows endpoints
  async getTVShowsList(
    suggest?: TVShowSuggestType,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBTVShowListItem>> {
    let endpoint = 'tv/popular';

    if (suggest) {
      switch (suggest) {
        case 'on-air':
          endpoint = 'tv/on_the_air';
          break;
        case 'top-rated':
          endpoint = 'tv/top_rated';
          break;
        case 'popular':
        default:
          endpoint = 'tv/popular';
          break;
      }
    }

    const response = await this.axiosInstance.get(endpoint, {
      params: { page },
    });

    return response.data;
  }

  async getTVShowDetails(tvShowId: number): Promise<TMDBTVShowDetails> {
    const response = await this.axiosInstance.get(`tv/${tvShowId}`);
    return response.data;
  }

  async getTVShowSeasonDetails(
    tvShowId: number,
    seasonNumber: number,
  ): Promise<TMDBSeasonDetails> {
    const response = await this.axiosInstance.get(
      `tv/${tvShowId}/season/${seasonNumber}`,
    );
    return response.data;
  }

  async getTVShowRecommendations(
    tvShowId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBTVShowListItem>> {
    const response = await this.axiosInstance.get(
      `tv/${tvShowId}/recommendations`,
      {
        params: { page },
      },
    );
    return response.data;
  }

  async getTVShowSimilar(
    tvShowId: number,
    page: number = 1,
  ): Promise<TMDBPaginationResponse<TMDBTVShowListItem>> {
    const response = await this.axiosInstance.get(`tv/${tvShowId}/similar`, {
      params: { page },
    });
    return response.data;
  }

  async getTVShowCredits(tvShowId: number): Promise<any> {
    const response = await this.axiosInstance.get(`tv/${tvShowId}/credits`);
    return response.data;
  }

  async getTVShowEpisodeCredits(
    tvShowId: number,
    seasonNumber: number,
    episodeNumber: number,
  ): Promise<any> {
    const response = await this.axiosInstance.get(
      `tv/${tvShowId}/season/${seasonNumber}/episode/${episodeNumber}/credits`,
    );
    return response.data;
  }

  // Search endpoint
  async search(
    query: string,
    type: SearchType = 'multi',
    page: number = 1,
  ): Promise<TMDBSearchResult> {
    const response = await this.axiosInstance.get('search/' + type, {
      params: {
        query,
        page,
      },
    });

    return response.data;
  }

  // Genre endpoints
  async getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
    const response = await this.axiosInstance.get('genre/movie/list');
    return response.data;
  }

  async getTVShowGenres(): Promise<{ genres: TMDBGenre[] }> {
    const response = await this.axiosInstance.get('genre/tv/list');
    return response.data;
  }

  // Trending endpoints
  async getTrendingAll(timeWindow: string, page: number = 1): Promise<any> {
    const response = await this.axiosInstance.get(`trending/all/${timeWindow}`, {
      params: { page },
    });
    return response.data;
  }

  async getTrendingMovies(timeWindow: string, page: number = 1): Promise<any> {
    const response = await this.axiosInstance.get(`trending/movie/${timeWindow}`, {
      params: { page },
    });
    return response.data;
  }

  async getTrendingTV(timeWindow: string, page: number = 1): Promise<any> {
    const response = await this.axiosInstance.get(`trending/tv/${timeWindow}`, {
      params: { page },
    });
    return response.data;
  }

  async getTrendingPeople(timeWindow: string, page: number = 1): Promise<any> {
    const response = await this.axiosInstance.get(`trending/person/${timeWindow}`, {
      params: { page },
    });
    return response.data;
  }
}
