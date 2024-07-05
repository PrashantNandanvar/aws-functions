const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK
AWS.config.update({ region: 'us-west-2' }); // Update to your region
const s3 = new AWS.S3({ region: process.env.AWS_REGION, accessKeyId:process.env.AWS_SECRET_KEY , secretAccessKey: process.env.AWS_ACCESS_KEY });

// Function to list all keys in a specific folder (prefix)
const listKeys = async (bucketName, folderName) => {
  const params = {
    Bucket: bucketName,
    Prefix: folderName,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    const keys = data.Contents.map((item) => item.Key);
    return keys;
  } catch (error) {
    console.error(`Error listing keys in folder ${folderName}:`, error);
    throw error;
  }
};

// Function to download a single file
const downloadFile = async (bucketName, key, downloadPath) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const data = await s3.getObject(params).promise();
    const filePath = path.join(downloadPath, key.replace('/', '_')); // Handle folder structure in key
    fs.writeFileSync(filePath, data.Body);
    console.log(`Successfully downloaded ${key}`);
  } catch (error) {
    console.error(`Error downloading ${key}:`, error);
  }
};

// Function to download multiple files in parallel
const downloadFilesInParallel = async (bucketName, keys, downloadPath) => {
  const downloadPromises = keys.map((key) => downloadFile(bucketName, key, downloadPath));
  await Promise.all(downloadPromises);
  console.log('All files downloaded');
};

const concatenateFilesInDirectory = async (directory, outputFile) => {
    try {
      // Read all files in the directory
      const files = await fs.promises.readdir(directory);
      let fileDataArray = [];
  
      for (const file of files) {
        const filePath = path.join(directory, file);
        try {
          const data = await fs.promises.readFile(filePath);
          fileDataArray.push(data);
        } catch (err) {
          console.error(`Error reading file ${filePath}:`, err);
          throw err;
        }
      }
  
      const concatenatedData = Buffer.concat(fileDataArray);
      await fs.promises.writeFile(outputFile, concatenatedData);
      console.log(`Files concatenated successfully into ${outputFile}`);
    } catch (err) {
      console.error('Error concatenating files:', err);
    }
  };

// Example usage
const bucketName = 'plannerpal-secure-bucket';
const folderName = '65b0d6031c7e0bee888c4327_audioFile/';
const downloadPath = './downloads';

const main = async () => {
  try {
    const keys = await listKeys(bucketName, folderName);
    await downloadFilesInParallel(bucketName, keys, downloadPath);
    await concatenateFilesInDirectory(downloadPath,'test.wav')
  } catch (error) {
    console.error('Error in processing:', error);
  }
};

main();
