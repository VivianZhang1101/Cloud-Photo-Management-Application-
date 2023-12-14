//
// app.post('/image/:userid', async (req, res) => {...});
//
// Uploads an image to the bucket and updates the database,
// returning the asset id assigned to this image.
//
const dbConnection = require('./database.js')
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

const uuid = require('uuid');

exports.post_image = async (req, res) => {

  console.log("call to /image...");

  try {
    const { assetname, data } = req.body;
    var data_bytes = Buffer.from(data, 'base64')
    var userid = req.params.userid;
    var sql = 'SELECT * FROM users WHERE userid=?;';
    dbConnection.query(sql, [userid], async function(err, result) {
      if (err) {
        return res.status(400).json({
          "message": err.message,
          "assetid": -1
        });
      }
      // No such user
      if (!result.length) {

        return res.status(400).json({
          "message": "no such user...",
          "assetid": -1
        });
      }

      try {
        var bucketfolder = result[0].bucketfolder;
        const newUuid = uuid.v4();
        var bucketkey = bucketfolder + "/" + newUuid + ".jpg";
        const command = new PutObjectCommand({
          Body: data_bytes,
          Bucket: s3_bucket_name,
          Key: bucketkey
        });
        const response = await s3.send(command);
        // add to database
      } catch (err) {
        console.log(err.message)
      }
      var insertSQL = 'INSERT INTO assets(userid, assetname, bucketkey) VALUES(?, ?, ?)';
      dbConnection.query(insertSQL, [userid, assetname, bucketkey], function(err, insertresult) {
        if (err) {
          return res.status(400).json({
            "message": err.message,
            "assetid": -1
          });
        }
        console.log("sending response");
        res.json({
          "message": "success",
          "assetid": insertresult.insertId
        });
      });

    });

  }//try
  catch (err) {
    console.log("**ERROR:", err.message);

    res.status(400).json({
      "message": err.message,
      "assetid": -1
    });
  }//catch

}//post
