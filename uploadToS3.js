const aws = require('aws-sdk');
const ffmpeg = require("fluent-ffmpeg");
const s3 = new aws.S3({ region: process.env.AWS_REGION, accessKeyId:process.env.AWS_SECRET_KEY , secretAccessKey: process.env.AWS_ACCESS_KEY });
// let filename = inputs.fileName;
// // console.log(filename);
// let ext = filename.split('.');
// if(fs.existsSync(filename)){
//   fs.readFile(inputs.sourceFilePath, (error, fileContent) => {
//     // if unable to read file contents, throw exception
//     if (error) { throw error; }
//     // upload file to S3
//     const fileParams = {
//       Bucket: global.secretValueJson.AWS_BUCKET,
//       Key: `${inputs.destinationDir}/${inputs.fileName}`,
//       Body: fileContent,
//       // ACL: 'public-read',
//       // ContentEncoding: '', // required
//       ContentType: inputs.mimeType,
//       region: 'eu-2-west',
//     };
//     // sails.log("File Params",global.secretValueJson.AWS_NAME);
//     try {
//       s3.upload(fileParams, (err, data) => {
//         //handle error
//         if (err) {
//           return err;
//         }
//         //success
//         if (data) {
//           // delete file from local
//           if(fs.existsSync(inputs.sourceFilePath)){
//             fs.unlink(inputs.sourceFilePath, (err) => {
//               if(err) {throw err;}
//             });
//           }
//           return data;
//         }
//       });
//     } catch (err) {
//       return err;
//     }
//   });
// }



// (() => {
//   s3.listObjectsV2(
//     {
//       Bucket: bucketName,
//       Prefix:prefix,
//     },
//     async (err, data) => {
//       if (err) {
//         throw new Error(err.message);
//       }
//       for (let i = 0; i < data.Contents.length; i++) {
//         const element = data.Contents[i];
//         const params = {
//           Bucket: bucketName,
//           Key:element.Key,
//         }
//         const preSignedUrl = s3.getSignedUrl('getObject', params)
//         ffmpeg(preSignedUrl)
//         .toFormat('mpeg')
//         .save(element.Key)
//         .on('end', () => {
//           console.log('Conversion complete');
//           return true
//         })
//         .on('error', (err) => {
//           console.log(err);
//           return false;
//         });
//       }
//     })
// })()


const bucketName = 'plannerpal-secure-bucket';
const prefix = '65b0d6031c7e0bee888c4327_audioFile';

const convertToMpeg = (url, outputKey) => {
  return new Promise((resolve, reject) => {
    ffmpeg(url)
      .toFormat('mpeg')
      .save(outputKey)
      .on('end', () => {
        console.log(`Conversion complete for ${outputKey}`);
        resolve(true);
      })
      .on('error', (err) => {
        console.log(`Error converting ${outputKey}:`, err);
        reject(err);
      });
  });
};

(async () => {
  try {
    const data = await s3.listObjectsV2({ Bucket: bucketName, Prefix: prefix }).promise();
    for (const element of data.Contents) {
      const params = {
        Bucket: bucketName,
        Key: element.Key,
      };
      const preSignedUrl = s3.getSignedUrl('getObject', params);
      try {
        await convertToMpeg(preSignedUrl, element.Key);
      } catch (err) {
        console.log(`Failed to convert ${element.Key}:`, err);
      }
    }
  } catch (err) {
    console.error('Error listing objects:', err);
  }
})();
