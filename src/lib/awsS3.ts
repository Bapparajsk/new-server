import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { AWS_S3 } from '../config';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const AWS_BUCKET = process.env.AWS_BUCKET || "your bucket name";

export const getObjectURL = async (key: string, expiresIn = 60 * 60): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
	ResponseCacheControl: 'max-age=86400, public',  // cache for 1 day
    });

    return await getSignedUrl(AWS_S3, command, { expiresIn });  // 1 minutes after expire this url
}

export const putObjectURL = async (key: string, contentType: string): Promise<string> => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET!,
        Key: key,
        ContentType: contentType
    });

    return await getSignedUrl(AWS_S3, command, { expiresIn: 10 * 60 });  // 10 minutes after expire this url
}

export const deleteObject = async (key: string) : Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: AWS_BUCKET,
        Key: key
    });

    try {
        await AWS_S3.send(command);
        console.log(`Successfully deleted object with key ${key}`);
    } catch (error) {
        console.error(`Failed to delete object with key ${key}`, error);
        throw new Error(`Failed to delete object with key ${key}`);
    }
}

export const verifyImageUpload = async (key: string): Promise<boolean> => {
    try {
        const command = new HeadObjectCommand({
            Bucket: AWS_BUCKET,
            Key: key
        });

        await AWS_S3.send(command);
        return true;
    } catch (e) {
        // @ts-ignore
        if (e.name === 'NotFound') {
            return false;
        }
        throw e;
    }
}

export const generateKeyToUrl = async (items: Array<any>, fn: (data: Array<any>) => Promise<any[]> ) => {
    const results = await Promise.allSettled(await fn(items));

    return results.map(result =>
        result.status === "fulfilled" ? result.value : null
    );
}

// export const uploadImageToAWS_S3 = async (url: string, name: string) => {
//
//     const response = await axios.get(url, { responseType: 'arraybuffer' });  // get image from url
//     const file = await sharp(response.data)  // resize image
//         .resize(300, 300)
//         .toBuffer();
//
//     // create file name and content type
//     const fileName = `${name}-${Date.now()}.png`;
//     const contentType = 'image/png';
//
//     // upload image to AWS_S3
//     const command = new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET!,
//         Key: fileName,
//         Body: file,
//         ContentType: contentType
//     });
//
//     try {
//         await AWS_S3.send(command);
//         console.log(`Successfully uploaded object with key ${fileName}`);
//
//         return fileName;
//     } catch (error) {
//         console.error(`Failed to upload object with key ${fileName}`, error);
//         throw new Error(`Failed to upload object with key ${fileName}`);
//     }
// };
