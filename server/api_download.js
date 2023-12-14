//
// app.get('/download/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
const dbConnection = require('./database.js')
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_download = async (req, res) => {

  console.log("call to /download...");
  try {
    assetid = req.params.assetid;
    // If reject, it will go to the catch in Promise
    var rds_response = new Promise((resolve, reject) => {
      try {
        console.log("/stats: calling RDS...");

        var sql = 'select * FROM assets WHERE assetid=?;';
        dbConnection.query(sql, assetid, function(err, result) {

          try {
            if (err) {
              console.log("Error in query");
              res.status(400).json({
                "message": err.message,
                "data": []
              });
              reject(err);
              return;
            }
            console.log(result);
            if (!result.length) {
              res.status(400).json({
                "message": "no such asset...",
                "user_id": -1,
                "asset_name": "?",
                "bucket_key": "?",
                "data": []
              });
              reject(new Error("result is null"));
            }
            resolve(result[0]);
          }
          catch (code_err) {
            // RDS section error
            reject(code_err)
          }
        });

      } catch (err) {
        // Promiss section error
        reject(err);
      }
    });//catch

    // first wait for the RDS response, then await for each s3 response
    rds_response
      .then(async (result) => {
        bucket_key = result.bucketkey;
        user_id = result.userid;
        asset_name = result.assetname;

        const command = new GetObjectCommand({
          Bucket: s3_bucket_name,
          Key: bucket_key
        });
        const s3_response = await s3.send(command);
        var datastr = await s3_response.Body.transformToString("base64");
        res.json({
          "message": "success",
          "user_id": user_id,
          "asset_name": asset_name,
          "bucket_key": bucket_key,
          "data": datastr
        });

      })
      .catch((error) => {
        console.log(error.message)
      });




  }//try
  catch (err) {
    //
    // generally we end up here if we made a 
    // programming error, like undefined variable
    // or function:
    //
    res.status(400).json({
      "message": err.message,
      "user_id": -4,
      "asset_name": "?",
      "bucket_key": "?",
      "data": []
    });
  }//catch

}//get