import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { SubscriberGuard } from '../guards/subscriber.guard';

@Controller('content')
export class ContentController {
  @Get('public')
  getPublicContent() {
    return {
      message: 'Public content - accessible to everyone',
      timestamp: new Date().toISOString()
    };
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  getProtectedContent() {
    return {
      message: 'Protected content - requires authentication',
      userId: 'user-info-will-be-attached-by-guard',
      timestamp: new Date().toISOString()
    };
  }

  @Get('premium')
  @UseGuards(AuthGuard, SubscriberGuard)
  getPremiumContent() {
    return {
      message: 'Premium subscriber-only content',
      userId: 'authenticated-user-id',
      isSubscriber: true,
      timestamp: new Date().toISOString()
    };
  }

  @Get('user-info')
  @UseGuards(AuthGuard)
  getUserInfo() {
    // The guard attaches user info to the request object
    return {
      message: 'User information from authenticated request',
      user: {
        id: 'user-id-from-guard',
        uid: 'user-uid-for-compatibility',
        token: 'bearer-token'
      },
      timestamp: new Date().toISOString()
    };
  }
}
