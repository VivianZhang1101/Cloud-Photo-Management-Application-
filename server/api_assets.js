//
// app.get('/assets', async (req, res) => {...});
//
// Return all the assets from the database:
//
const dbConnection = require('./database.js')

exports.get_assets = async (req, res) => {

  console.log("call to /assets...");



  try {

    //
    // TODO: remember we did an example similar to this in class with
    // movielens database (lecture 05 on Thursday 04-13)
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    //

    var sql = 'select * FROM assets ORDER BY assetid;';

    dbConnection.query(sql, function(err, result) {
      if (err) {
        res.status(400).json({
          "message": err.message,
          "data": []
        });
        return;
      };

      // send response in JSON format:
      console.log("sending response");
      res.json({
        "message": "success",
        "data": result
      });
    });

    console.log("about to return");
  }
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}

