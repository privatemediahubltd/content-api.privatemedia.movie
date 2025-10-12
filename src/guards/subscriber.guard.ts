import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef
} from '@nestjs/common';
import { TcpClientService } from '../tcp/tcp-client.service';

@Injectable()
export class SubscriberGuard implements CanActivate {
  private readonly logger = new Logger(SubscriberGuard.name);

  constructor(
    @Inject(forwardRef(() => TcpClientService))
    private readonly tcpClientService: TcpClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('No authorization header provided for subscriber check');
      throw new ForbiddenException('Authorization header is required');
    }

    // Extract Bearer token
    const token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      this.logger.warn('Invalid authorization header format for subscriber check');
      throw new ForbiddenException('Invalid authorization header format');
    }

    try {
      // Check subscription status via TCP
      const subscriberResult = await this.tcpClientService.checkSubscription(token);

      if (!subscriberResult.success) {
        this.logger.warn(`Subscription check failed: ${subscriberResult.error}`);
        throw new ForbiddenException(`Subscription check failed: ${subscriberResult.error}`);
      }

      if (!subscriberResult.isSubscriber) {
        this.logger.warn('Access denied: User is not a subscriber');
        throw new ForbiddenException('Premium content requires an active subscription');
      }

      // Attach subscriber status to request object
      request.user = {
        ...request.user,
        isSubscriber: true
      };

      this.logger.debug('Subscriber check successful: User has active subscription');
      return true;

    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error('Subscriber guard error:', error.message);
      throw new ForbiddenException('Subscription verification service unavailable');
    }
  }

  private extractTokenFromHeader(authHeader: string): string | null {
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return null;
    }

    return token.trim();
  }
}
