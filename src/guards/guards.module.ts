import { Module, Global } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SubscriberGuard } from './subscriber.guard';

@Global()
@Module({
  providers: [AuthGuard, SubscriberGuard],
  exports: [AuthGuard, SubscriberGuard],
})
export class GuardsModule {}
