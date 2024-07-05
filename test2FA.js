// const { authenticator } = require('otplib');
// const qrCode = require('qrcode'); 

// // (async() => {
// //     let secret = authenticator.generateSecret();
// //     console.log(secret)
// //     let qrCodeUrl;
// //     // generate qrcode
// //     qrCodeUrl = await qrCode.toDataURL(authenticator.keyuri( 'prashantn@zignuts.com', 'PlannerPal', secret ));
// //     console.log(qrCodeUrl);
// // })();

// (async() => {
//     let isVerified = authenticator.check('365656', 'HRKDCAD4PUSFAMDC');
//     console.log(isVerified)
// })();

// import { Auth } from 'aws-amplify';
const { Auth } = require('aws-amplify');
// Function to initiate password reset
const awsconfig = {
    Auth: {
      region: 'eu-west-2',
      userPoolId: 'eu-west-2_konZtwOly',
      userPoolWebClientId: '67tf6kgspg3nmdm1lv4djqtr7t',
    },
  };
  console.log(awsconfig)
Auth.configure(awsconfig);
async function resetPassword(email) {
  try {
    let send = await Auth.forgotPassword(email);
    console.log('Password reset instructions sent successfully.',send);
  } catch (error) {
    console.error('Error initiating password reset:', error);
  }
}

// Example usage
const userEmail = 'barutoplannerewe@yopmail.com';
resetPassword(userEmail);
async function confirmPasswordReset(email, code, newPassword) {
  try {
    await Auth.forgotPasswordSubmit(email, code, newPassword);
    console.log('Password reset confirmed successfully.');
  } catch (error) {
    console.error('Error confirming password reset:', error.message);
  }
}
const verificationCode = '300281'; // The OTP sent to the user
const newPassword = 'Hazel@9843'; // The new password
// confirmPasswordReset(userEmail, verificationCode, newPassword);
