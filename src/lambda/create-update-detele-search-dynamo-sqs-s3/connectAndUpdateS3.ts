import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { addCorsHeaders } from '../../utils/cors';

// S3 configuration
export const connectToS3Bucket = async () => {
    return new S3Client({ region: 'ap-northeast-1' });
}
//Create presigned URL for S3
export const createPreUrlUpdateS3 = async (s3Client: any, bucketName: any, nameCsvSaveIntoS3Bucket: any, expiration: any, fileName: any) => {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: nameCsvSaveIntoS3Bucket,
            ContentType: 'text/csv',
        });
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiration });

        // Debug 4
        console.log('4. presignedUrl:', presignedUrl);

        return addCorsHeaders({
            statusCode: 200,
            body: JSON.stringify({
                presignedUrl,
                id: fileName,
            }),
        });
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Đã xảy ra lỗi khi tạo presigned URL' }),
        };
    }
}

// Query Get All Items From CSV and Import To Users Table
export const getAllContentFromS3Uploaded = async (params: any, s3: any) => {
    try {

        // Lấy file csv từ S3 với tên bucket và đường dẫn trong S3
        const command = new GetObjectCommand(params);
        const data = await s3.send(command);

        //Đọc nội dung csv đã lấy được 
        const streamToString = (stream: any) =>
            new Promise((resolve, reject) => {
                const chunksData = [] as any;
                stream.on('data', (chunk: any) => chunksData.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunksData).toString('utf-8')));
            });

        const csvString = await streamToString(data.Body) as any;
        const lines = csvString.split('\n');
        const headers = lines[0].split(',');
        interface CsvRow {
            [key: string]: string | null;
        }

        const jsonData: CsvRow[] = lines.slice(1).map((line: string) => {
            const values: string[] = line.split(',');
            const obj: CsvRow = {};
            for (let i = 0; i < headers.length; i++) {
                obj[headers[i].trim()] = values[i] ? values[i].trim() : null;
            }
            return obj;
        });

        console.log('Doc noi dung thanh cong')
        return jsonData;
    }
    catch (error) {
        console.error("read noi dung csv thanh cong:", error);
        throw error;
    }
}

// Checking if bucket not exits will be create new one 
export const createNewBucketS3 = async (s3: any, bucketDestination: any) => {
    try {
        // Check if bucket exists
        await s3.send(new HeadBucketCommand({ Bucket: bucketDestination }));
        console.log(`Bucket ${bucketDestination} already exists.`);
    } catch (error: any) {
        if (error.$metadata?.httpStatusCode === 404) {
            // Bucket does not exist, create it
            const createBucketParams = {
                Bucket: bucketDestination,
                CreateBucketConfiguration: {
                    LocationConstraint: "ap-northeast-1",
                },
            } as any;
            await s3.send(new CreateBucketCommand(createBucketParams));
            console.log(`Bucket ${bucketDestination} created successfully.`);
        } else {
            console.error("Error creating new bucket S3:", error);
            throw error;
        }
    }
};

//Copy file from one bucket to another
export const copyItemToNewBucket = async (s3: any, newBucket: any, newImageUrl: any, path: any) => {
    try {
        const params = {
            Bucket: newBucket,
            Key: newImageUrl,
            Body: path,
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
        console.log('Upload new image to S3 bucket successfully');

    } catch (error) {
        console.error("Copy file from one bucket to another error:", error);
        throw error;
    }
}
