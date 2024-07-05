const ffmpeg = require('fluent-ffmpeg');
const pathToFfmpeg = require('ffmpeg-static');
const ffprobe = require('ffprobe-static');

const cutVideo = async (sourcePath, outputPath, startTime, duration) => {
  console.log('start cut video');

  await new Promise((resolve, reject) => {
    ffmpeg(sourcePath)
      .setFfmpegPath(pathToFfmpeg)
      .setFfprobePath(ffprobe.path)
      .output(outputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .withVideoCodec('copy')
      .withAudioCodec('copy')
      .on('end', function (err) {
        if (!err) {
          console.log('conversion Done');
          resolve();
        }
      })
      .on('error', function (err) {
        console.log('error: ', err);
        reject(err);
      })
      .run();
  });
};


const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);

// Initialize the S3 client
const s3 = new AWS.S3({ region: process.env.AWS_REGION, accessKeyId:process.env.AWS_SECRET_KEY , secretAccessKey: process.env.AWS_ACCESS_KEY });


/**
 * Lists all files in an S3 folder
 * @param {string} bucketName - The name of the S3 bucket
 * @param {string} folder - The folder path within the S3 bucket
 * @returns {Promise<string[]>} - A promise that resolves to an array of file keys
 */
const listFilesInS3Folder = async (bucketName, folder) => {
  const params = {
    Bucket: bucketName,
    Prefix: folder,
  };

  const data = await s3.listObjectsV2(params).promise();
  return data.Contents.map((item) => item.Key);
};

/**
 * Sorts keys by the numeric part following "minute"
 * @param {string[]} keys - The keys to sort
 * @returns {string[]} - The sorted keys
 */
const sortKeys = (keys) => {
  return keys.sort((a, b) => {
    const aMinute = parseInt(a.match(/minute(\d+)/)[1], 10);
    const bMinute = parseInt(b.match(/minute(\d+)/)[1], 10);
    return aMinute - bMinute;
  });
};

/**
 * Creates a read stream for an S3 object
 * @param {string} bucketName - The name of the S3 bucket
 * @param {string} key - The key of the S3 object
 * @returns {stream.Readable} - The read stream for the S3 object
 */
const getS3ReadStream = (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  return s3.getObject(params).createReadStream();
};

/**
 * Concatenates files and stores the result locally
 * @param {string} bucketName - The name of the S3 bucket
 * @param {string[]} keys - The keys of the files to concatenate
 * @param {string} outputFile - The path to the output file
 */
const concatenateFilesLocally = async (bucketName, keys, outputFile) => {
  const outputWriteStream = fs.createWriteStream(outputFile);

  for (const key of keys) {
    const readStream = getS3ReadStream(bucketName, key);
    await pipeline(readStream, outputWriteStream, { end: false });
  }

  outputWriteStream.end();
};

/**
 * Main function to concatenate S3 files and save the result locally
 * @param {string} bucketName - The name of the S3 bucket
 * @param {string} folder - The folder path within the S3 bucket
 * @param {string} outputFile - The path to the output file
 */
const processS3Files = async (bucketName, folder, outputFile) => {
  console.log('start', new Date());
  try {
    // List files in the S3 folder
    const s3Keys = await listFilesInS3Folder(bucketName, folder);

    // Sort the keys
    const sortedKeys = sortKeys(s3Keys);

    // Concatenate files and store the result locally
    await concatenateFilesLocally(bucketName, sortedKeys, outputFile);

    console.log(`Files concatenated successfully into ${outputFile}`, new Date());
  } catch (err) {
    console.error('Error processing S3 files:', err);
  }
};

// Usage
const bucketName = 'plannerpal-secure-bucket';
const folder = '65f189465b5a27017a52058e_audioFile/';  // Ensure this ends with a /
const outputFile = path.join(__dirname, 'concatenated.wav');

processS3Files(bucketName, folder, outputFile);
