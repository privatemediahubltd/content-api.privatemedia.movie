import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const redisProviders = [
  {
    provide: 'REDIS_CLIENT',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<Redis> => {
      return new Promise((resolve, reject) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const redis = new Redis(redisUrl);

        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          redis.disconnect();
          reject(new Error('Redis connection timeout after 10 seconds'));
        }, 10000);

        redis.on('connect', () => {
          console.log('✅ Connected to Redis successfully');
          clearTimeout(connectionTimeout);
          resolve(redis);
        });

        redis.on('error', (err) => {
          console.error('❌ Redis connection error:', err.message);
          clearTimeout(connectionTimeout);
          redis.disconnect();
          reject(err);
        });

        redis.on('ready', () => {
          console.log('🚀 Redis client ready and fully connected');
        });
      });
    },
  },
];
