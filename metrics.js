const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch({ region: process.env.AWS_REGION, accessKeyId:process.env.AWS_SECRET_KEY , secretAccessKey: process.env.AWS_ACCESS_KEY });

 (async() => {
    const clusterName = 'msteams-bot'; // Replace with your cluster name
    const serviceName = 'msteams-test'; // Replace with your service name
  const params = {
    MetricDataQueries: [
      {
        Id: 'cpuUtilization',
        MetricStat: {
          Metric: {
            Namespace: 'AWS/ECS',
            MetricName: 'CPUUtilization',
            Dimensions: [
              { Name: 'ClusterName', Value: clusterName },
              { Name: 'ServiceName', Value: serviceName },
            ],
          },
          Period: 60, // Period in seconds
          Stat: 'Average',
        },
        ReturnData: true,
      },
      {
        Id: 'memoryUtilization',
        MetricStat: {
          Metric: {
            Namespace: 'AWS/ECS',
            MetricName: 'MemoryUtilization',
            Dimensions: [
              { Name: 'ClusterName', Value: clusterName },
              { Name: 'ServiceName', Value: serviceName },
            ],
          },
          Period: 60,
          Stat: 'Average',
        },
        ReturnData: true,
      },
    ],
    StartTime: new Date(new Date().getTime() - 5 * 60 * 1000),
    EndTime: new Date(),
  };

  const data = await cloudwatch.getMetricData(params).promise();
  console.log(data.MetricDataResults);
  console.log({
    cpuUtilization: data.MetricDataResults[0].Values.length,
    memoryUtilization: data.MetricDataResults[1].Values.length,
  });
  return {
    cpuUtilization: data.MetricDataResults[0].Values[0],
    memoryUtilization: data.MetricDataResults[1].Values[0],
  };
})();
