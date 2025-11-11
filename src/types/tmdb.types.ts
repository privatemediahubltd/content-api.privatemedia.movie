// Common TMDB API response types

export interface TMDBPaginationResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBBaseItem {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
}

// Movie specific types
export interface TMDBMovieListItem extends TMDBBaseItem {
  title: string;
  original_title: string;
  release_date: string;
  video: boolean;
}

export interface TMDBMovieDetails extends TMDBBaseItem {
  belongs_to_collection: any | null;
  budget: number;
  genres: TMDBGenre[];
  homepage: string | null;
  imdb_id: string | null;
  original_title: string;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
}

// TV Show specific types
export interface TMDBTVShowListItem extends TMDBBaseItem {
  name: string;
  original_name: string;
  first_air_date: string;
  origin_country: string[];
}

export interface TMDBTVShowDetails extends TMDBBaseItem {
  created_by: any[];
  episode_run_time: number[];
  first_air_date: string;
  genres: TMDBGenre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: TMDBEpisode | null;
  name: string;
  next_episode_to_air: TMDBEpisode | null;
  networks: any[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  seasons: TMDBSeason[];
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDBSeason {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TMDBEpisode {
  air_date: string;
  episode_number: number;
  episode_type: string;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: any[];
  guest_stars: any[];
}

export interface TMDBSeasonDetails {
  _id: string;
  air_date: string | null;
  episodes: TMDBEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

// Search types
export interface TMDBSearchResult {
  page: number;
  results: (TMDBMovieListItem | TMDBTVShowListItem)[];
  total_pages: number;
  total_results: number;
}

// Query parameter types
export type MovieSuggestType =
  | 'popular'
  | 'now-playing'
  | 'upcoming'
  | 'top-rated';
export type TVShowSuggestType = 'popular' | 'on-air' | 'top-rated';
export type SortOrder = 'asc' | 'desc';
export type SearchType = 'movie' | 'tv' | 'multi';

// Request DTO types
export interface ListQueryParams {
  suggest?: MovieSuggestType | TVShowSuggestType;
  sort?: SortOrder;
  genres?: string;
  page?: number;
  sort_by?: string;
}

export interface SearchQueryParams extends ListQueryParams {
  q: string;
  type?: SearchType;
}
