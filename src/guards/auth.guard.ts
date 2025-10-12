import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  Inject,
  forwardRef
} from '@nestjs/common';
import { TcpClientService } from '../tcp/tcp-client.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject(forwardRef(() => TcpClientService))
    private readonly tcpClientService: TcpClientService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn('No authorization header provided');
      throw new UnauthorizedException('Authorization header is required');
    }

    // Extract Bearer token
    const token = this.extractTokenFromHeader(authHeader);
    if (!token) {
      this.logger.warn('Invalid authorization header format');
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      // Verify authentication via TCP
      const authResult = await this.tcpClientService.verifyAuthentication(token);

      if (!authResult.success) {
        this.logger.warn(`Authentication failed: ${authResult.error}`);
        throw new UnauthorizedException(`Authentication failed: ${authResult.error}`);
      }

      // Attach user information to request object
      request.user = {
        id: authResult.userId,
        uid: authResult.userId, // For compatibility with existing code
        token: token
      };

      this.logger.debug(`Authentication successful for user: ${authResult.userId}`);
      return true;

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('Authentication guard error:', error.message);
      throw new UnauthorizedException('Authentication service unavailable');
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
