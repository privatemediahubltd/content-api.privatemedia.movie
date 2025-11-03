import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [SupabaseModule],
})
export class ImagesModule {}
