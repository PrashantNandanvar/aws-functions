const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.AWS_REGION, accessKeyId:process.env.AWS_SECRET_KEY , secretAccessKey: process.env.AWS_ACCESS_KEY });



(async() => {
    let Kinesis = new AWS.Kinesis()
    const firehose = new AWS.Firehose();
    // const deliveryStream = await firehose.createDeliveryStream({
    //     DeliveryStreamName: 'PlannerPal-kinesis-2',
    //     InputFormatConfiguration: {
    //       PartitionKey: '${partitionKeyFromQuery:groupId}',
    //       Prefix: `groupId=!{partitionKeyFromQuery:groupId}/`,
    //       BucketARN: 'arn:aws:s3:::plannerpal-secure-bucket',
    //     },
    // }).promise();
    let getResult = await Kinesis.putRecord({
        PartitionKey:'test',
        Data:'Hello Kinesis',
        StreamName:'PlannerPal-kinesis-2',
        // groupId:'65f189465b5a27017a52058e'
    }).promise();
    console.log(getResult);
})()