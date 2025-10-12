import { Module, Global } from '@nestjs/common';
import { TcpClientService } from './tcp-client.service';

@Global()
@Module({
  providers: [TcpClientService],
  exports: [TcpClientService],
})
export class TcpModule {}
