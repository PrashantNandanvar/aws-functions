const AWS = require('aws-sdk');
const kinesis = new AWS.Kinesis({ region: "us-west-2" });
const s3 = new AWS.S3({ region: "us-west-2" });

const streamName = 'PlannerPal-kinesis-2';

function processRecords(records) {
  for (let record of records) {
    const payload = new Buffer(record.Data, 'base64').toString('utf8');
 
    // Upload data to S3
    const params = {
      Bucket: 'your-s3-bucket-name',
      Key: `kinesis/${Date.now()}.wav`, // Ensure this is unique!
      Body: payload
    };
    
    s3.upload(params, (s3Err, data) => {
      if (s3Err) throw s3Err
      console.log(`File uploaded successfully at ${data.Location}`)
    });
  }
}

function getRecords(shardIterator) {
  kinesis.getRecords({
    ShardIterator: shardIterator
  }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      processRecords(data.Records);
      if (!data.NextShardIterator) {
        console.log('All records processed.');
      } else {
        getRecords(data.NextShardIterator);
      }
    }
  });
}

function getShardIterator(shardId) {
  const params = {
    ShardId: 'shardId-000000000001',
    ShardIteratorType: 'TRIM_HORIZON',
    StreamName: streamName
  };
  kinesis.getShardIterator(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      getRecords(data.ShardIterator);
    }
  });
}

// Get the Open ShardId in the Stream
kinesis.describeStream({
  StreamName: streamName
}, (err, data) => {
  if (err) {
    console.log(err);
  } else {
    const shardId = data.StreamDescription.Shards[0].ShardId;
    getShardIterator(shardId);
  }
});