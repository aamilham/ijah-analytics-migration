const express = require('express');
const app = express();

const multer = require('multer');
const pool = require('./conn_db');
const uploadFname = 'default_uploadFname.txt';
const cors = require('cors');

require('dotenv').config();
const PORT = process.env.PORT || 9001;
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// var xhr = new XMLHttpRequest();
//
// xhr.withCredentials = false;

app.use(cors({ //allow cross origin requests
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  credentials: true
}));

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}...`);
});

app.get('/api-node/', (req, res) => {
  res.send('Greeting from Ijah Uploader API :)');
});

/** Serving from the same express Server
No cors required */
app.use(express.static('../client'));

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// For Upload files ////////////////////////////////////////////////////////////
var storage = multer.diskStorage({ //multers disk storage settings
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    uploadFname = `ijah_upload_${timestamp}.${file.originalname.split('.').pop()}`;

    cb(null,uploadFname);
  }
});

var upload = multer({ //multer settings
                    storage
                   }).single('file');

/** API path that will upload the files */
app.post('/api-node/upload', (req, res, next) => {
  upload(req,res, (err) => {
    if(err){
        return next(err);
    }
    res.status(200).json({error_code: 0, err_desc: null});
  });
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ error: 'Something Error!'});
});

// For inserting image data ////////////////////////////////////////////////////
// app.post('/api_upload/insert_img_meta', function(req, res) {
//   var data = [req.body.usrID,uploadFname];
//   var query = 'INSERT INTO img (img_usr_id, img_path) VALUES ($1, $2)';
//
//   pool.query(query, data, function(err, result) {
//     res.send(result);
//   });
// });
