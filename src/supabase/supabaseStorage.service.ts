import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

@Injectable()
export class SupabaseStorageService {
    constructor(
        @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    ) { }

    static BUCKETS = {
        movieSiteImages : 'movie-site-images'
    }

    // Upload file
    async uploadFile(bucket: string, filePath: string, fileBuffer: Buffer, contentType: string) {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(filePath, fileBuffer, { upsert: true, contentType: 'image/jpeg' });

        if (error) throw new Error(error.message);
        return data;
    }

    // Get public URL
    getPublicUrl(bucket: string, filePath: string) {
        const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    }

    // Download file
    async downloadFile(bucket: string, filePath: string) {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .download(filePath);

        if (error) throw new Error(error.message);
        return data; // Returns a ReadableStream (Node.js Buffer can be obtained)
    }

    // Delete file
    async deleteFile(bucket: string, filePath: string) {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) throw new Error(error.message);
        return data;
    }

    // List files in a folder
    async listFiles(bucket: string, path: string) {
        const { data, error } = await this.supabase.storage.from(bucket).list(path);
        if (error) throw new Error(error.message);
        return data;
    }
}
