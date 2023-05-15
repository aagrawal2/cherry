## Solution To Manage Assests Using Secure Upload Process 
Following are the high level steps to explain the solution. These steps are explained in detail in the below sections. 
- The RN app should upload the images/videos in Cloud services, in our case it's AWS.
- The AWS S3 bucket will provide you the image URL and this URL you should store in the backend database as a referecne or metadata to access the images whenever you need it. 
- For uploading it's better to implement mullti-part uploading and we can leverage dedicated node module for the same like `aws-sdk` which also take care of assembling these parts into the original image out of the box. 
- In the RN app for user to access the images either via Camera or Gallery, it's better if we use some node modules which are specialized in this work. Example: `react-native-image-picker`, `react-native-fast-image`, `react-native-async-storage` & `react-native-fs`. 
- Once the required images are accessed from the user then we can cache these images for users to offline access for a given interval of time. 
- In case the user goes offline or brittle network connection, user should be able to submit these images on demand. In fact it's even better if we build an offline upload & notification solution on top of this solution which will submit these images on behalf of user and notification the user. This will be very effective in case of offline scenario. 

### Secure(Autentication+Authorization) & Upload Object Architecture
![image](UploadArchitecture.png)
- User clicks Submit CTA. 
- Send a HTTP GET request to get preSigned URL.
- Pre-Signed URLs
   *  Instead of directly uploading files to S3 through your API, generate a pre-signed URL. A pre-signed URL is a temporary URL that grants users permission to upload a file to a specific S3 bucket.
- Implement Authenitcation
   * Ensure that only authenticated users can request pre-signed URLs. 
   * AWS API GW sends the request to HTTP API. This API is created in AWS to incorporate OAuth based Authentication via SSO Identity Provider. 
   * If user is signed in successfully (Bearer Token generated successfully) then only request will go further to get pre-signed URL else the request will be failed and return HTTP 401 error response. 
- Lambda Function 
   * The request will trigger getSignedURL Lamda Function and this lambda function gets the SignedURL from S3 bucket. 
   * The retuned HTTP response will contain the Authenticated Token and the PreSignedURL which contains the AWS access key as well. 
- Make the HTTP PUT upload request to the preSignedURL endpoint to API GW.
- API GW will validate the Auth Token in the request and then only forward the request else HTTP 401 error is returned. 
- If Auth Token is valid then the request is forwarded to getUploadURL Lambda function, this ensures only authenticated user can upload objects to S3 bucket. 
- Finally the uploaded S3 buket Image URL is returned in the HTTP response. 
- This URL can be saved in Backend Database as a Metadata to access the object from S3 anytime in the future. 
- Optional and Good to have Feature
   * We can implement Asynchronous Image Processing Lambda Function, which can retrieve the Image from desired S3 bucket and then do the image processing like Crop, Resize etc... and upload back the processed object. 

### Best Practices
- Limit file size
   * To prevent users from uploading extremely large files, set a maximum file size limit when generating the pre-signed URL. This can be done using the `Content-Length` header in the pre-signed URL request.
- Authorization
   * Configure the S3 bucket policies and CORS settings to allow only specific actions (e.g., `s3:PutObject`) from specific domains or users. This helps prevent unauthorized access to your S3 bucket.
- Encrypt data
   * Enable server-side encryption for your S3 bucket to protect the stored data. Amazon S3 supports several encryption options, such as SSE-S3, SSE-KMS, or SSE-C.
- Use short expiration times
   * Set a short expiration time for the pre-signed URLs, such as 5 or 10 minutes. This limits the time window in which an attacker could potentially use the URL.
- Monitor and log activity
   * Use AWS CloudTrail and S3 access logs to monitor and log all activities related to your S3 bucket. This helps you track any unauthorized access or suspicious activities.

### Would you use react query to handle image processing & uploading?
- React Query is an excellent library for fetching, caching & state management. However, it may not be the best choice for handling image processing and uploading, as its primary focus is on data fetching and state management. For image processing and uploading, you can consider using AWS services/libraries that are specifically designed for this purpose. Ex: `aws-sdk` javascript module can upload and manage images in S3. 
- AWS Lambda: AWS Lambda is a serverless compute service that lets you run your code without provisioning or managing servers. You can use Lambda to create a function that processes images (resizing, cropping, etc.) and uploads the processed images to Amazon S3.
- You can still integrate this with React Query for fetching and displaying the images in your application. This way, you can benefit from React Query's caching and state management features while using specialized module for handling image processing and uploading tasks.

### How would you cache and store existing images from existing workflow instance steps for offline access?
Use react-native-fast-image module along with react-native-async-storage or react-native-fs module. react-native-fast-image is used to cache & render the image while react-native-async-storage/async-storage or react-native-fs module can be used to store the image for offline access. 
Here is the code snippet for reference - 
```
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

async function cacheImage(url) {
  try {
    const cacheKey = `cache_${url}`;
    const cachedPath = await AsyncStorage.getItem(cacheKey);

    if (cachedPath) {
      return cachedPath;
    }

    const downloadPath = `${RNFS.CachesDirectoryPath}/${cacheKey}`;
    await RNFS.downloadFile({ fromUrl: url, toFile: downloadPath }).promise;

    await AsyncStorage.setItem(cacheKey, downloadPath);
    return downloadPath;
  } catch (error) {
    console.error('Error caching image:', error);
    return url;
  }
}
Use the cached images:

import React, { useState, useEffect } from 'react';
import FastImage from 'react-native-fast-image';

const CachedImage = ({ source, ...props }) => {
  const [cachedSource, setCachedSource] = useState(null);

  useEffect(() => {
    async function loadCachedImage() {
      const cachedPath = await cacheImage(source.uri);
      setCachedSource({ uri: cachedPath });
    }

    loadCachedImage();
  }, [source]);

  return <FastImage source={cachedSource || source} {...props} />;
};
Use the CachedImage component in the App - 

import React from 'react';
import { View } from 'react-native';
import CachedImage from './CachedImage';

const App = () => {
  return (
    <View>
      <CachedImage
        source={{ uri: 'https://example.com/image.jpg' }}
        style={{ width: 100, height: 100 }}
      />
    </View>
  );
};

export default App;

```

### How would you monitor the upload process for each asset? What are the failure points? How would you handle them?
- Use AWS CloudTrail to monitor upload S3 & S3 Logs access.
- Failure points during upload S3 - There are several potential failure points during S3 upload image.
   * Network connectivity issues: If there are network connectivity issues, the upload process may fail or take longer than expected. 
   * Insufficient permissions: If the user does not have sufficient permissions to upload files to the S3 bucket, the upload process will fail.
   * Incorrect bucket name or region: If the bucket name or region is incorrect, the upload process will fail.
   * File size limitations: If the file size exceeds the maximum allowed size for the S3 bucket, the upload process will fail.
   * Timeouts: If the upload process takes too long to complete, it may time out and fail.
   * Server-side errors: Server-side errors such as internal server errors or service unavailable errors can also cause the upload process to fail.
- Upload Failure Handling
   * Use multipart upload: If you're uploading large files, it's recommended to use multipart upload using built-in multi-upload feature with `aws-sdk`. This allows you to split the file into smaller parts and upload them separately. If one part fails, you can retry just that part instead of starting the entire upload again.
   * Implement retries: You can implement retries in your code to automatically retry the upload if it fails. You can set a maximum number of retries to avoid getting stuck in an infinite loop. 
   * Use exponential backoff: When retrying, you can use exponential backoff to avoid overwhelming the server with too many requests. This means that you start with a small delay between retries and gradually increase it with each retry.
   * Use `AWS SDKs`: If you're using `AWS SDKs`, they come with built-in error handling and retry mechanisms.


### How would the product behave without a network connection? With a brittle network connection?
- Inform users - Clearly inform users when the app is operating in offline mode. Display a message or an icon to indicate that the app is not connected to the internet.
- Offline functionality
   * User can still see the Step Instructions as there is no dependency on network.
   * Attach photos/video and add notes/dcoumentation continue work as there is no network dependency. This will also leverage cached & stored images (if any) previously. They will continue show to the user if added already and then device goes offline. 
   * Log an issue modal will continue take all the user inputs. When 'Log issue' or 'Update issue' is clicked then it will show a user friendly error. It can save the entire session and upload it in background when device comes online and notify user. OR This button can be in Disabled state if device is offline (work with XD to align on better user experience)
- Data synchronization: When the network connection is restored, the app should synchronize any changes made during offline mode with the server. This ensures that the user's data is up-to-date and consistent across devices.
- Graceful degradation: Some features may not be available in offline mode, but the app should degrade gracefully. This means that unavailable features should be greyed out or hidden, rather than causing the app to crash or become unresponsive. Ex: We can keep `Log Iusse` or `Update Issue` in Disabled state.
- Error handling: The app should handle network errors and timeouts gracefully. This includes displaying appropriate error messages, providing options to retry or cancel actions, and ensuring the app remains stable and usable. 
- Network detection: The app should be able to detect when the network connection has been restored and automatically switch back to online mode. This can be achieved through network listeners or periodic checks for connectivity.
- Optimize performance: Optimize the app's performance for offline usage by minimizing resource consumption, reducing battery drain, and ensuring fast response times.
- User-friendly design: Design the app's user interface in a way that makes it easy for users to understand and navigate, even when operating in offline mode.
- Progressive enhancement: Implement progressive enhancement techniques, where the app's core functionality is available to all users, regardless of their network connection, while advanced features are progressively added as network conditions improve.

### Based on the figma prototype, how would you define user stores & acceptance criteria?
I will break down the user stories in different buckets.
- Bucket 1: Implementation of UI specific changes include rendering UI components only. AC: Responsive layout - should be rendered in different types of devices as per the figma.
- Bucket 2: Implementation of event handlers of UI components. AC: Required UI state change should happen based on the events which includes UI animation & transition changes.
- Bucket 3: Implementation of repository layer which includes networking calls & business logics. AC: MOCK data/server should be created to functionally test the business & netwroking logic. 
- Bucket 4: Integration of all the screens and Navigation. AC: Forward and Back navigation should work as expected.
- Bucket 5: Testing. AC: Unit & UI tests to ensure the functional testing in positive & negative scenarios. This will also include the end-to-end testing using real endpoints. 
Here are the examples:
- 1.1: Implement 'Workflow Input Screen' ui components only.
- 1.2: Implement 'Step Instruction Manual Screen' ui components only.
- 1.3: Implement 'Additional Documentation Screen' ui components only. This includes sub components as per the figma.
- 1.4: Implement 'Log An Issue Screen' ui components only.
- 1.5: Implement 'Completion Step Success Screen' ui components only. 
- 2.1: Implement event handlers of 'Workflow Input Screen' components.
- 2.2: Implement event handlers of 'Step Instruction Manual Screen' components. 
- 2.3: Implement event handlers of 'Additional Documentation Screen' components. 
- 2.4: Implement event handlers of 'Log An Issue Screen' components. 
- 2.5: Implelment event handlers of 'Completed Step Screen' components. 
- 3.1: Implementation of Networking layer & required business logic.
- 4.1: Integration of all the above ui components and Navigation.
- 5.1: Unit Testing, UI Testing and End-to-End Testing.

### What are ways to test, measure and monitor this new architecture?
- Load testing: Perform load testing to ensure that the new architecture can handle the expected load and traffic. This will help you identify potential bottlenecks and performance issues. 
- Performance testing: Conduct performance testing to measure the response time, throughput, and resource utilization of the new architecture. This will help you identify any performance issues and optimize the system accordingly. 
- Security testing: Perform security testing to identify any vulnerabilities in the new architecture. This will help you ensure that the system is secure and protected against potential threats. 
- Monitoring: Implement monitoring tools to track the performance and availability of the new architecture. This will help you identify any issues in real-time and take appropriate actions to resolve them. 
- Analytics: Use analytics tools to collect and analyze data on the usage and behavior of the new architecture. This will help you identify areas for improvement and optimize the system accordingly.




