const express = require('express');
const { body } = require('express-validator/check');
const isAuth = require('../middleware/is-auth');

const mobileController = require('../controllers/mobile');
const fAuth = require('../middleware/firebase');

const router = express.Router();
const Review = require('../models/review');
const Saving = require('../models/saved');
const Country = require('../models/country');
const State = require('../models/state');
const Webform = require('../models/webrequest');
const Category = require('../models/category');
const User = require('../models/user');
const Notifications = require('../models/notify');
 
const recentDate = new Date();
recentDate.toDateString("yyyy/mm/dd");

// GET Category
router.post('/catagprefill', isAuth, mobileController.getCatag);

//Country Prefill
router.post('/countryprefill', isAuth, mobileController.getCountry);

//Dashboard Prefill
router.post('/dashboardprefill', isAuth, mobileController.getDashboardFill);

// CREATE NEW USER
router.post('/user', fAuth, mobileController.signUp);

// FindUser
router.get('/finduser', isAuth, mobileController.searchAllUser);

//Get Follower Search
router.get('/getfollower', isAuth, mobileController.listFriendsConnector);

//Get Following Search
router.get('/getfollowing', isAuth, mobileController.listFriendsConnections);

//Prefill friends and follower
router.post('/prefillconnect', isAuth, mobileController.getAllConnects);

//Prefill friends
router.post('/friendprefillconnect', isAuth, mobileController.getAllFriendsConnects);

//Update User Photo
router.post('/updateuserphoto', isAuth, mobileController.updateProfilePhoto);

//Update User Description
router.post('/updateuserdesc', isAuth, 
  [
    body('desc')
    .trim().escape().stripLow(),
  ],
mobileController.updateDescription);

//update push tokens
router.post('/updatepushtokens', isAuth, 
  [
    body('pushToken')
    .trim().escape(),
  ],
mobileController.updatePushTokens);

// APPEND TO EXISTING USER
router.post(
  '/existinguser',
  isAuth, //fAuth,
  [
    body('displayName')
    .isLength({ min: 1 })
    .custom((value, { req }) => {
      return User.findOne({ displayName: value }).then(displayName => {
        if (displayName) {
          return Promise.reject('Username already exists!');
        }
      });
    }),
    body('zipcodes')
    .trim(),
  ],
  mobileController.updateExistUser
);

// POSTING
router.post(
    '/post',
    isAuth,
    [
      body('title')
        .trim().escape()
        .isLength({ min: 5 }),
     
    ],
    mobileController.createPost
);

// check username
router.post(
  '/checkusername',
  isAuth,
  [
    body('displayName')
      .trim()
      .isLength({ min: 2 })
  ],
  mobileController.checkUser
);

// deleteUser Post
router.post(
  '/deleteuserposts',
  isAuth,
  [
    body('postID')
      .trim().escape().isMongoId()
  ],
  mobileController.deleteUserPost
);

//get User Post
router.post('/getuserposts', isAuth, mobileController.getUserPosts);

//Filter Post
router.post('/filterposts', isAuth, mobileController.filterPosts);

// api-02
///Save Post
router.post('/submitsavedpost', isAuth, mobileController.savePost);

// api-03
///Remove Saved Post
router.post('/removesavedpost', isAuth, mobileController.removeSavePost);

// api-04
///Fetch Save Post
router.post('/fetchsavedpost', isAuth, mobileController.fetchSavePost);

// api-05
///Save Comment
router.post('/submitcomments', isAuth, mobileController.savePostComment);
// api-06
//Fetch Comments
router.post('/fetchcomments', isAuth, mobileController.fetchPostComment);

// api-07
///Review Post
router.post(
  '/postreview',
  isAuth,
  [
    body('order')
      .custom((value, { req }) => {
        return Review.findOne({ user: req.idToken, order:value }).then(review => {
          if(review) {
            return Promise.reject('You already reviewed this item!');
          }
        });
      }),
  ],
  mobileController.postReview
);

// api-08
//Fetch Review
router.post('/fetchreviews', isAuth, mobileController.fetchReviewComment);

// api-09
//Fetch Notification
router.post('/fetchnotifications', isAuth, mobileController.fetchNotifications);

// api-10
//remove Notification
router.post('/removenotifications', isAuth,
[
  body('cat')
  .isMongoId()
  .custom((value, { req }) => {
    return Notifications.findById(value).then(notificationID => {
      if(!notificationID) {
        return Promise.reject('Notification does not exist!');
      }
    });
  }),
],
mobileController.removeNotifications);

// api-11
//Compare contact
router.post('/comparecontacts', isAuth, mobileController.compareContacts);

// api-12
//Invite Friends
router.post('/invitefriends', isAuth, mobileController.inviteFriends);

// api-13
//Update Profile
router.post('/userprofileupdate', isAuth, mobileController.userProfileUpdates);

// api-14
///Save Schedule
router.post('/submitschedule', isAuth, mobileController.saveSchedule);

// api-15
///Fetch Schedule
router.post('/confirmschedule', isAuth, mobileController.fetchSchedule);

// api-16
///Fetch Orders
router.post('/fetchorders', isAuth, mobileController.fetchOrders);

// api-17
///Create Connection
router.post('/createconnect', isAuth, mobileController.createConnection);

// api-18
///Update Connection
router.post('/updateconnect', isAuth, mobileController.updateConnection);

// api-19
///Check Existing Message
router.post('/checkexistingmssg', isAuth, mobileController.checkExistingMessage);

// api-20
///Chat Loader 
router.post('/openchat', isAuth, mobileController.confirmConnection);

// api-21
///Insert Chat Message
router.post('/insertchatmssg', isAuth, mobileController.insertChatMessage);

// api-22
//Update User Socket
router.post('/updateusersocket', isAuth, mobileController.updateUserSocket);

// api-23
//Compare contact
router.post('/checkmutual', isAuth, mobileController.checkMutual);

// api-24
//Check is Typing
router.post('/istyping', isAuth, mobileController.isTyping);

// api-25
//Adjust Message Status
router.post('/adjustmessagestatus', isAuth, mobileController.adjustMessageStatus);

// api-26
///Submit Orders
router.post('/submitorders', isAuth, mobileController.submitOrders);

// api-27
//Fetch Rewards
router.post('/fetchrewards', isAuth, mobileController.fetchRewards);

// create new tag
router.post(
    '/newtag',
    // isAuth,
    [
      body('name')
        .trim()
        .isLength({ min: 2 })
    ],
    mobileController.createTag
);

module.exports = router;