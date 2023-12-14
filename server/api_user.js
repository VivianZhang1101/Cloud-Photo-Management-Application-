//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//
const dbConnection = require('./database.js')

exports.put_user = async (req, res) => {

  // console.log("call to /user...");

  try {


    const { email, lastname, firstname, bucketfolder } = req.body;
    if (!email || !lastname || !firstname || !bucketfolder) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // First check, if the given email is in user
    var sql = 'SELECT * FROM users WHERE email=?;';
    dbConnection.query(sql, [email], function(err, result) {
      if (err) {
        return res.status(400).json({
          "message": err.message,
          "userid": -1
        });
      }
      // Add the new user
      if (!result.length) {
        var insertSQL = 'INSERT INTO users(email, lastname, firstname, bucketfolder) VALUES(?, ?, ?, ?)';
        dbConnection.query(insertSQL, [email, lastname, firstname, bucketfolder], (err, insertResult) => {
          if (err) {
            return res.status(400).json({
              "message": err.message,
              "userid": -1
            });
          }
          console.log(insertResult.insertId);
          // Double check if the new user is added
          if (insertResult.affectedRows == 1) {
            res.json({
              "message": "inserted",
              "userid": insertResult.insertId
            });
          }
          else {
            res.status(400).json({
              "message": "Insertion failed",
              "userid": -1
            });
          }
        });

      }
      else {
        const updateSQL = 'UPDATE users SET lastname = ?, firstname = ?, bucketfolder = ? WHERE email = ?';
        dbConnection.query(updateSQL, [lastname, firstname, bucketfolder, email], (err, updateResult) => {
          if (err) {
            return res.status(400).json({
              "message": err.message,
              "userid": -1
            });
          }
          // Double check if the new user is added
          if (updateResult.affectedRows == 1) {
            res.json({
              "message": "updated",
              "userid": result[0].userid
            });
          }
          else {
            res.status(400).json({
              "message": "Update failed",
              "userid": -1
            });
          }
        });
      }
    }
    );



  }//try
  catch (err) {
    console.log("**ERROR:", err.message);

    res.status(400).json({
      "message": err.message,
      "userid": -1
    });
  }//catch

}//put
