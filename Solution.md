## Solution To Manage Assests Using Secure Upload Process 
Following are the high level steps to explain the solution. These steps are explained in detail in the below sections. 
- The RN app should upload the images/videos in Cloud services, in our case it's AWS.
- The AWS S3 bucket will provide you the image URL and this URL you should store in the backend database as a referecne or metadata to access the images whenever you need it. 
- For uploading it's better to implement mullti-part uploading and we can leverage dedicated node module for the same like `aws-sdk` which also take care of assembling these parts into the original image out of the box. 
- In the RN app for user to access the images either via Camera or Gallery, it's better if we use some node modules which are specialized in this work. Example: `react-native-image-picker`, `react-native-fast-image`, `react-native-async-storage` & `react-native-fs`. 
- Once the required images are accessed from the user then we can cache these images for users to offline access for a given interval of time. 
- In case the user goes offline or brittle network connection, user should be able to submit these images on demand. In fact it's even better if we build an offline upload & notification solution on top of this solution which will submit these images on behalf of user and notification the user. This will be very effective in case of offline scenario. 

### Secure(Autentication+Authorization) & Upload Object Architecture
[[Images/Solution.png]]
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


