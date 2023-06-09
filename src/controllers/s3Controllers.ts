import { GetObjectCommand, S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response } from 'express';
import type { Readable } from 'stream'

const client = new S3Client({
    region: 'ap-southeast-2', 
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
    }
})


const s3Controller = {

    async getImage (req: Request, res: Response) {
        const image:string | undefined = await fetchImage(req.params.image)
        if (!image) {
            res.status(500).json("Couldn't fetch the requested image")
            return
        }
        res.send(image)
    },

    async uploadImage(req:Request, res: Response) {
        if (!req.file) {
            return
        }
        const command = new PutObjectCommand({
            Bucket: "yuzu-profile-images",
            Key: req.file.originalname,
            Body: req.file.buffer
        });
        try {
            const uploadImage = await client.send(command)
            
          } catch (err) {
            console.error(err);
            res.status(500).send("Error sending image");
          }
    },

    async handleMultiple (req: Request, res: Response) {
        const posts = req.body.fetchReq
        const tempCachedImages:{[key: number]: string} = {}
        for (let i = 0; i < posts.length; i++ ) {
            if (tempCachedImages[posts[i].user_id]) {
                posts[i].profile_image = tempCachedImages[posts[i].user_id]
            } else {
                const image_data:string | undefined = await fetchImage(posts[i].profile_image_data)
                if (image_data === undefined) {
                    return 
                } 
                posts[i].profile_image_data = image_data
                tempCachedImages[posts[i].user_id] = image_data
            }
        }
        res.json(tempCachedImages)
    }
}
export const fetchImage = async (key: string): Promise<string | undefined> => {
    const command: GetObjectCommand = createGetObjectCommand(key);
    const response = await client.send(command);
    const stream = response.Body as Readable;
    return new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.once('end', () => {
        const imageData = Buffer.concat(chunks);
        const base64 = imageData.toString('base64');
        resolve("data:image/jpeg;base64," + base64);
      });
      stream.once('error', reject);
    });
};
  
const createGetObjectCommand = (key:string):GetObjectCommand => {
    return new GetObjectCommand({
        Bucket: "yuzu-profile-images",
        Key: key
    });
}

export default s3Controller;