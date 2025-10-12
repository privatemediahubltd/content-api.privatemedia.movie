import { Module } from '@nestjs/common';
import { TVShowsController } from './tv-shows.controller';
import { TVShowsService } from './tv-shows.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [TVShowsController],
  providers: [TVShowsService],
})
export class TVShowsModule {}
