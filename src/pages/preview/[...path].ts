import type { APIContext } from "astro";

import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type'
import ffmpeg from 'fluent-ffmpeg';
// import sharp from 'sharp';

const getVideoMetadata = (videoFilePath: string): Promise<ffmpeg.FfprobeData> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoFilePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                resolve(metadata);
            }
        });
    });
};

const getFirstFrameBuffer = async (videoFilePath: string): Promise<Buffer> => {

    // let metadata: ffmpeg.FfprobeData

    // try {
    //     metadata = await getVideoMetadata(videoFilePath)
    // } catch (error) {
    // }

    return new Promise((resolve, reject) => {
        // let width = 300;
        // let height = 300;

        // if (!metadata) {
        //     reject("Metadata not found")
        // }

        // if (metadata.streams[0].width && metadata.streams[0].height) {
        //     if (metadata.streams[0].width > metadata.streams[0].height) {
        //         width = Math.round(metadata.streams[0].width / metadata.streams[0].height * 300)
        //         height = 300
        //     } else {
        //         height = Math.round(metadata.streams[0].height / metadata.streams[0].width * 300)
        //         width = 300
        //     }
        // }

        ffmpeg(videoFilePath)

            .screenshots({
                timestamps: ['0:00'],
                filename: 'thumbnail.png',
                folder: '/tmp',
                // size: `${width}x${height}`,  
            })
            .on('end', async () => {
                console.log("ffmpeg end")
                try {
                    // const buffer = await sharp('/tmp/thumbnail.png').toBuffer();
                    const fileContent = await fs.readFile('/tmp/thumbnail.png')
                    resolve(fileContent);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                console.log("ffmpeg error")
                reject(err);
            });
    });
};

export async function GET(context: APIContext): Promise<Response> {

    if (!context.locals.user) {
        return new Response(
            JSON.stringify({
                error: "User not logged in"
            }),
            {
                status: 401
            }
        );
    }

    try {
        if (!context.params.path) return new Response(
            JSON.stringify({
                error: "File not found"
            }),
            {
                status: 404
            }
        );

        const directoryPath = path.join(context.locals.user.scope, context.params.path)
        const stat = await fs.stat(directoryPath)
        if (stat.isDirectory()) {
            // Handle directory download. Maybe use zip
            return new Response(
                JSON.stringify({
                    error: "Directory download is not avaliable"
                }),
                {
                    status: 501
                }
            );

        } else {
            let fileContent = await fs.readFile(directoryPath)
            let fileType = await fileTypeFromBuffer(fileContent)

            if (fileType?.mime == "video/mp4") {
                fileContent = await getFirstFrameBuffer(directoryPath)
                fileType = { ext: fileType.ext, mime: "image/png" }
            }

            directoryPath.split("/")

            return new Response(fileContent, {
                headers: {
                    'Content-Type': `${fileType?.mime}`, // MIME type of the file
                    'Cache-Control': 'public, max-age=3600', // Prevent caching
                    'Custom-Header': 'CustomHeaderValue', // Example of a custom header
                    'Content-Disposition': 'inline'
                },
            });
        }

    } catch (error) {
        console.log(error)
        return new Response(
            JSON.stringify({
                error: "File not found"
            }),
            {
                status: 404
            }
        );
    }

}