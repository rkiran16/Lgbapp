const express = require('express');
const { body } = require('express-validator/check');

const transactionController = require('../controllers/transaction');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const Country = require('../models/country');
const State = require('../models/state');
const Webform = require('../models/webrequest');
const Category = require('../models/category');
const Shipmentsize = require('../models/shipmentsize');
 
const recentDate = new Date();
recentDate.toDateString("yyyy/mm/dd")

// GET /transaction/posts
//router.get('/posts', isAuth, transactionController.getPosts);
router.get('/posts', transactionController.getPosts);


//Send Notifications
router.post('/notifications', transactionController.sendNotifications);

// POST /transaction/post
router.post(
  '/post',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  transactionController.createPost
);

//Website Request
router.post(
  '/postwebrequest',
  //isAuth,
  [
    body('name')
      .trim().escape()
      .isLength({ min: 2 }),
    body('email')
      .isEmail()
      .custom((value, { req }) => {
        return Webform.findOne({ email: value, response: 'No', requestDate: {$lt: recentDate}}).then(webf => {
          if (webf) {
            return Promise.reject('You recently submitted a query! Please give us 24hrs to respond.');
          }
        });
      }),
    body('message')
    .isLength({ min: 3 }),
  ],
  transactionController.websitereq
);

//Category
router.post(
  '/category',
  //isAuth,
  [
    body('name')
      .isLength({ min: 3 })
      .custom((value, { req }) => {
        return Category.findOne({ name: value }).then(catAvailable => {
          if (catAvailable) {
            return Promise.reject('Category already exists!');
          }
        });
      })
  ],
  transactionController.createCategory
);

//Country
router.post(
  '/postcountry',
  //isAuth,
  [
    body('name')
      .isLength({ min: 2 })
      .custom((value, { req }) => {
        return Country.findOne({ name: value }).then(countryDoc => {
          if (countryDoc) {
            return Promise.reject('Country address already exists!');
          }
        });
      }),
    body('block')
      .isBoolean()
  ],
  transactionController.createcountry
);

//State Entry
router.post(
  '/stateentry',
  //isAuth,
  [
    body('name')
      .isLength({ min: 2 })
      .custom((value, { req }) => {
        return State.findOne({ name: value }).then(stateStatus => {
          if (stateStatus) {
            return Promise.reject('State already exists!');
          }
        });
      }),
    body('country')
      .custom((value, { req }) => {
        return Country.findOne({ _id: value }).then(countryDoc => {
          if (!countryDoc) {
            return Promise.reject('The system does not recognize this Country!');
          }
        });
      })
  ],
  transactionController.createstate
);

router.get('/post/:postId', isAuth, transactionController.getPost);

router.put(
  '/post/:postId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  transactionController.updatePost
);

//Country
router.post(
  '/postcountry',
  //isAuth,
  [
    body('name')
      .isLength({ min: 2 })
      .custom((value, { req }) => {
        return Country.findOne({ name: value }).then(countryDoc => {
          if (countryDoc) {
            return Promise.reject('Country address already exists!');
          }
        });
      }),
    body('block')
      .isBoolean()
  ],
  transactionController.createcountry
);

//Popular Category
router.post(
  '/postcocategory',
  //isAuth,
  [
    body('name')
      .isLength({ min: 6 })
      .custom((value, { req }) => {
        return Category.findOne({ _id: value }).then(categ => {
          if (!categ) {
            return Promise.reject('Category does not exist!');
          }
        });
      })
  ],
  transactionController.commonCategory
);

//Create Shipment Sizes
router.post(
  '/createshipmentsizes',
  //isAuth,
  [
    body('name')
      .isLength({ min: 3 })
      .trim()
      .custom((value, { req }) => {
        return Shipmentsize.findOne({ name: value }).then(size => {
          if (size) {
            return Promise.reject('Shipment Size Already Exist!');
          }
        });
      }),
    body('price').isNumeric().toFloat()
  ],
  transactionController.createShipmentSizes
);

router.delete('/post/:postId', isAuth, transactionController.deletePost);

module.exports = router;
