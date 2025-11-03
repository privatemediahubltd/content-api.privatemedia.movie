import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { SupabaseStorageService } from 'src/supabase/supabaseStorage.service';

@Injectable()
export class ImagesService {
    constructor(private readonly supabaseStorageService: SupabaseStorageService) { }

    async getTmdbImage(fileName: string): Promise<Buffer> {
        const response = await axios.get(`https://image.tmdb.org/t/p/original/${fileName}`, {
            responseType: 'arraybuffer', // important
            headers: {
                'content-type': 'image/jpeg'
            }
        });
        return response.data;
    }

    async uploadMovieSiteImage(fileName: string) {
        const fileBuffer = await this.getTmdbImage(fileName);
        const fileData = await this.supabaseStorageService.uploadFile(
            SupabaseStorageService.BUCKETS.movieSiteImages,
            fileName,
            fileBuffer,     
            'image/jpeg'
        );
        return fileData.path;
    }
}
