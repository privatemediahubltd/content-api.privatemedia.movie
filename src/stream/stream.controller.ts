import { Controller, Get, Param, ParseIntPipe, Redirect } from '@nestjs/common';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
    constructor(private readonly streamService: StreamService) { }

    @Get('/movie/:id')
    @Redirect()
    async getMovieStreamUrl(
        @Param('id', ParseIntPipe) id: number
    ) {
        const streamUrl = await this.streamService.getStreamUrl({
            type: 'movie',
            id,
        });
        return { url: streamUrl, statusCode: 302 };
    }

    @Get('/tv-series/:id/:seasonNumber/:episodeNumber')
    @Redirect()
    async getTVShowStreamUrl(
        @Param('id', ParseIntPipe) id: number,
        @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
        @Param('episodeNumber', ParseIntPipe) episodeNumber: number
    ) {
        const streamUrl = await this.streamService.getStreamUrl({
            type: 'tv-series',
            id,
            seasonNumber,
            episodeNumber
        });

        return { url: streamUrl, statusCode: 302 };
    }
}
