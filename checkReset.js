const awsAmlify = require('aws-amplify');

(async() => {
    const awsconfig = {
        Auth: {
          region: process.env.AWS_REGION,
          userPoolId: process.env.AWS_USER_POOL_ID,
          userPoolWebClientId: process.env.AWS_USER_POOL_WEB_CLIENT,
        },
      };
    awsAmlify.Amplify.configure(awsconfig);

})();