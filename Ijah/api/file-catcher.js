/* change list : aamilham
1. change var to const
2. add cors, path
3. update directory logic to make the directory if it doesnt exist
4. update all function into arrow function
5. update upload function logic to newest method using cors and multer.diskStorage
6. update app.use function */

/*eslint-disable*/
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const DIR = path.join(__dirname, 'uploads');

// making the directory upload if it doesnt exist
if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const fileName = `${file.fieldname}-${timestamp}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['X-Requested-With', 'Content-Type'],
    credentials: true,
}));

app.get('/api', (req, res) => {
  res.end('file catcher example');
});

app.post('/api', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    console.log(`${req.file.originalname} uploaded to ${req.file.path}`);
    res.send('File is uploaded');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}...`);
});
