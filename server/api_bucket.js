//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
// import statements
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_bucket = async (req, res) => {

  console.log("call to /bucket...");

  try {
    startafter = ""
    if (req.query.startafter) {
      startafter = req.query.startafter;
    }
    console.log(startafter)
    console.log("Your bucket contains the following objects:\n");
    const command = new ListObjectsV2Command({
      Bucket: s3_bucket_name,
      // The default and maximum number of keys returned is 1000. This limits it to
      // one for demonstration purposes.
      MaxKeys: 12,
      StartAfter: startafter
    });
    const response = await s3.send(command);
    // send response in JSON format:
    console.log("sending response");
    if (response.KeyCount == 0) {
      res.json({
        "message": "success",
        "data": []
      });
    }
    else {
      res.json({
        "message": "success",
        "data": response.Contents
      });
    }


    //
    // TODO: remember, 12 at a time...  Do not try to cache them here, instead 
    // request them 12 at a time from S3
    //
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //


  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
