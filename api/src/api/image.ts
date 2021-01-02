import { Express } from 'express';
import fs from 'fs';
import HttpStatus, { getStatusText } from 'http-status-codes';
import mime from 'mime-types';
import path from 'path';
import { pipeline } from 'stream';
import util from 'util';

import Configuration from '../config';
import Game from '../models/game.model';
import IGDB from '../services/igdb/igdb';

const streamPipeline = util.promisify(pipeline);

export default class ImageController {

    private static readonly imageDir = path.join(Configuration.getCacheDirectory, 'images');

    private constructor(private igdbService: IGDB) { }

    public async get(id: number) {
        // check if the file exists
        const image = path.join(ImageController.imageDir, `${id}.jpg`);
        if(fs.existsSync(image)) {
            return image;
        }

        // find if the game has an IGDB id
        const game = await Game.findOne({
            attributes: [ 'igdbId' ],
            where: {
                gameId: id
            }
        });

        // find if the game has cover art
        if(game?.igdbId) {
            const covers = await this.igdbService.getCover(game.igdbId)
                .fetch();
            const cover = covers?.length > 0 ? covers[0] : null;

            // if there is an image id, download the image
            if(cover?.image_id) {
                if(await this.downloadImage(
                    image, 
                    this.igdbService.getImageUrl('cover', cover?.image_id)
                )) {
                    return image;
                }
            }
        }

        return null;
    }

    private async downloadImage(path: string, url: string) {
        try {
            let response = await globalThis.fetch(url);

            if(response?.status !== HttpStatus.OK) {
                throw new Error(getStatusText(response.status));
            }
            
            await streamPipeline(response.body, fs.createWriteStream(path));
        } catch(e) {
            return false;
        }

        return true;
    }

    public static init(app: Express | null, igdbService: IGDB) {
        // ensure the image directories exist
        if(!fs.existsSync(ImageController.imageDir)) {
            fs.mkdirSync(ImageController.imageDir, { recursive: true });
        }

        const imageApi = new ImageController(igdbService);

        if(app) {
            app.use(
                `${Configuration.getExpress.root}/images/:id`.replace('//', '/'),
                async (request, response) => {
                    const image = await imageApi.get(parseInt(request.params.id));

                    if(image) {
                        response.setHeader('Content-Type', (mime.lookup('jpg') ?? '') as string);
                        response.sendFile(image);
                    } else {
                        response.status(HttpStatus.NOT_FOUND).send();
                    }
                }
            );
        }

        return imageApi;
    }
};
