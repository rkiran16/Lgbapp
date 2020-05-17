const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoConnect = require('./util/database');

const transactionRoutes = require('./routes/transaction');
const mobileRoutes = require('./routes/mobile');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'video/mpg' ||
    file.mimetype === 'video/mpeg' ||
    file.mimetype === 'video/avi' ||
    file.mimetype === 'video/mov'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter, limits: { 
    fileSize: 900 * 1024 * 1024,  // 900 MB upload limit
    files: 4                    // 4 files
}, }).array('imgURL', 4)
);
app.use('/', transactionRoutes)
app.use('/admin', transactionRoutes);
app.use('/m', mobileRoutes);
app.use('/auth', authRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});



app.use((error, req, res, next) => {
  // console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  console.log(message);
  res.status(status).json({ message: message, data: data });
});


mongoose
  .connect(
    mongoConnect.dbskey,{useNewUrlParser: true, autoIndex: false }
  ).then(result => {
    const server = app.listen(3000);
    const io = require('./socket').init(server);
    io.on('connection', socket =>{
      socket.on('disconnect', data =>{
        delete socket;
      });
    })
  }).catch(err => console.log(err));
