import { Module, Global } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SupabaseStorageService } from './supabaseStorage.service';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () => {
        return createClient(
          process.env.SUPABASE_PROJECT_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key for admin operations
        );
      },
    },
    SupabaseStorageService
  ],
  exports: ['SUPABASE_CLIENT', SupabaseStorageService],
})
export class SupabaseModule { }
