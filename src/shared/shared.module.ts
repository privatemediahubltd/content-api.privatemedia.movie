import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { TMDBService } from './tmdb.service';
import { CacheService } from './cache.service';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [TMDBService, CacheService],
  exports: [TMDBService, CacheService],
})
export class SharedModule {}
