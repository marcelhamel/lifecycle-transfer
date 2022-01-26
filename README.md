# Sailthru Template Transfer

This Node.js app is designed to transfer HTML e-mail templates to a user's Sailthru account from an AWS S3 bucket, FTP directory or a secondary Sailthru account.

### Configuration

Configuration is handled entirely within index.js. 

*Begin by selecting your transfer source:*
* 'FTP' - An FTP directory hosting HTML files.
* 'AWS' - An AWS S3 bucket.
* 'ST'  - A secondary Sailthru account.

*Then enter your service configuration:*

**sailthru_config** contains the credentials for the Sailthru account you will be transferring e-mail templates to. Connection is made using [Sailthru's Node.js client](https://getstarted.sailthru.com/developers/api-client/node-js/)
*Required: api key, secret*

**aws_config** contains the credentials for accessing the AWS S3 bucket to import from. Connection is made via [AWS SDK for Node](https://aws.amazon.com/sdk-for-node-js/)
*Required: AccessKeyId, secretAccessKey, name of S3 bucket*

**ftp_config** contains the info necessary to connect to an FTP server of your choice. Connection is made using the ['FTP' npm package](https://www.npmjs.com/browse/keyword/ftp).
*Required: 'Host'... your FTP hostname, Port (defaults to 21), [Security settings](https://www.npmjs.com/package/ftp#methods), Username, Password, 'Path'... relative path to get templates from*

### To Run

In terminal, navigate to the directory containing the script, and run "node index.js".

