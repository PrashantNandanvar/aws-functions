// Configure AWS credentials and region
const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({ region: process.env.AWS_REGION, accessKeyId:process.env.AWS_SECRET_KEY , secretAccessKey: process.env.AWS_ACCESS_KEY });

// Create an S3 object
const s3 = new AWS.S3();

// // Parameters for downloading the file
const params = {
  Bucket: process.env.AWS_BUCKET,
  Key: decodeURIComponent('AudioFiles//custom_66311480a7b87a5ad8f6e908_665f05155cb4e937e263a052_1717573550942.wav'),
  // Expires: 36
};
//https://plannerpal-secure-bucket.s3.eu-west-2.amazonaws.com/Documents//Guided+Scoping+Letter.docx
// https://plannerpal-secure-bucket.s3.eu-west-2.amazonaws.com/AudioFiles//5e2698a5-03ba-4a44-96a6-eed6ebceee89.mp3
async function getFileStream()  {

  const fileStream = await s3.getObject(params).promise();
  console.log(fileStream)
  const bufferData = Buffer.from(fileStream.Body, 'utf-8');

// Get metadata of the buffer
const length = bufferData.length; // Length of the buffer
const byteLength = bufferData.byteLength; // Number of bytes in the buffer
const isBuffer = Buffer.isBuffer(bufferData); // Check if it's a buffer

// Output metadata
console.log('Length of the buffer:', length);
console.log('Number of bytes in the buffer:', byteLength);
console.log('Is it a buffer?', isBuffer);
}

async function getPresignedUrl(){
  const preSignedUrl = s3.getSignedUrl('getObject', params)
  console.log('Pre-signed URL:', preSignedUrl);
}

async function getEcsConfig(){
  try {
    const ecs = new AWS.ECS();
        const clusterName = 'msteams-bot'; // Replace with your cluster name
        const serviceName = 'msteams-test'; // Replace with your service name
        const params = {
          cluster: clusterName,
          services: [serviceName]
        };
        const response = await ecs.describeServices(params).promise();
        console.log(response.services[0].runningCount);
  } catch (error) {
    console.log(error);
  }
}

 async function copyS3Oject(){
  const copyParams = {
    Bucket: process.env.AWS_BUCKET,
    CopySource: 'adviser-copilot/65a780531d79ab37912b64a5_audioFile/test.wav',
    Key: '65a780531d79ab37912b64a5_audioFile/test.wav'
  };
  
  s3.copyObject(copyParams, function(err, data) {
    if (err) {
      console.error("Copy failed:", err);
    } else {
      console.log("Copied successfully:", data);
    }
  });
};
