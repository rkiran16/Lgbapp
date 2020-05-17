const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe')('sk_test_wg4rpKsG8Xf5fylrKBBclCV000Wl5idfG4');
const { validationResult } = require('express-validator/check');
const mongoose = require('mongoose');
const admin = require('../middleware/firebaseConfig');
const Category = require('../models/category');
const Post = require('../models/post');
const User = require('../models/user');
const Country = require('../models/country');
const State = require('../models/state');
const Tagging = require('../models/tag'); 
const Saving = require('../models/saved');
const Review = require('../models/review');
const Reward = require('../models/reward');
const Comment = require('../models/comment');
const Cocategory = require('../models/commonCategory');
const Connectionx = require('../models/connections');
const Notifications = require('../models/notify');
const Invitation = require('../models/invites');
const Schedule = require('../models/schedule');
const Orders = require('../models/order');
const Odetails = require('../models/odetails');
const Shipmentsize = require('../models/shipmentsize');
const Message = require('../models/message');
const IO = require('../socket');

//Check Username
exports.checkUser = (req, res, next) => {
  const errors = validationResult(req);
  const idToken = req.idToken;
  if(!idToken) {
    const error = new Error('Not Authorized. Login Again!!');
    error.statusCode = 300;
    throw error;
  }
  if (!errors.isEmpty()) {
    const error = new Error('Username cannot be one letter!');
    error.statusCode = 422;
    throw error;
  }

  User.findOne({ displayName: req.body.displayName })
    .then(user => {
    if (user) {
      const error = new Error('Username already exist!');
      error.statusCode = 300;
      throw error;
    }
    res.status(200).json({ message: 'OK' });
    })
    .catch(e => {
      const err = new Error('Not Authorized!');
      err.statusCode = 300;
      next(err);
    })
};

//Dashboard Prefill
exports.getDashboardFill = async (req, res, next) => {
  const idToken = req.idToken;
  let kommonCat, kategory, totalItems, tagsxx;

  const currentPage = req.body.page || 1;
  const perPage = 15;
  let interest= req.body.interest ? JSON.parse(req.body.interest) : null;
  if (interest.length <= 0) {
    const error = new Error('No Interest Found, Cannot Fetch Data!');
    error.statusCode = 322;
    throw error;
  }
  if (!idToken) {
    const error = new Error('Not Authorized');
    error.statusCode = 322;
    throw error;
  }
  if(currentPage > 1) {
    Post.find({ category:{ $in: interest }, unlisted: false })
      .populate('creator', 'displayName img phonenum')
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
    .then(posts => {
      // console.log(totalItems);
      return res.status(200).json({posts: posts,totalItems: 'N/A',commonCat:'N/A',category: 'N/A',promoPost: 'Good'});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  } else {
    User.findById(idToken)
    .then(users => {
      if(!users) {
        const error = new Error('Not Authorized. Login Again!!');
        error.statusCode = 300;
        throw error;
      }
      return Category.find({block: 'No'})
      .select('name url')
    })
    .then(catg => {
      kategory= catg;
      return Cocategory.find({block: false})
      .select('name')
    })
    .then(reslt => {
      kommonCat = reslt;
      return Tagging.find({block: 'No'}).select('name')
    })
    .then(foundTags => {
      tagsxx = foundTags;
      return Post.find({ category:{ $in: interest }, unlisted: false })
      .countDocuments()
    })
    .then(count => {
      totalItems = count;
      return Post.find({ category:{ $in: interest }, unlisted: false })
        .populate('creator', 'displayName img phonenum')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      return res.status(200).json({posts: posts,totalItems: totalItems,commonCat:kommonCat,category: kategory,promoPost: 'Good', tags:tagsxx});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  }
};


//updatepushtokens
exports.updatePushTokens = (req, res, next) => {
  let pushToken = req.body.pushToken;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Token validation failed');
    error.statusCode = 422;
    throw error;
  }
  if(!req.idToken){
    console.log('error')
    const error = new Error('No user record found');
    error.statusCode = 300;
    throw error;
  }
  User.findById(req.idToken)
    .then(user => {
      if (!user) {
        error = new Error('Login Error..');
        error.statusCode = 304;
        throw error;
      }
      user.notificationtoken = pushToken;
      return user.save();
    })
    .then(reslt => {
      return res.status(200).json({ message: 'Successful!'});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Country Prefill
exports.getCountry = async (req, res, next) => {
  const idToken = req.idToken;
  let kountry, kategory, komonCat, error;

  User.findById(idToken)
  .then(users => {
    if(!users) {
      // console.log('figurative');
      const error = new Error('Not Authorized. Login Again!!');
      error.statusCode = 300;
      throw error;
    }
    return Country.find({block: false})
    .select('name states')
    .populate('states', 'name')
  })
  .then(country => {
    kountry = country;
    return Category.find({block: 'No'})
    .select('name url')
  })
  .then(catg => {
    kategory= catg;
    return Cocategory.find({block: false})
    .select('name')
  })
  .then(cocatg => {
    res.status(200).json({ country: kountry, category: kategory, commonCat: cocatg});
  })
  .catch(e => {
    const err = new Error('Not Authorized!');
    err.statusCode = 300;
    next(err);
  })
};

//CREATE NEW USER
exports.signUp = (req, res, next) => {
  let recData, id, email, ph, displayName, terms, userCountry;
  const uid = req.userId;
  admin.auth().getUser(uid)
    .then(userRecord => {
      if(!userRecord){
        const error = new Error('No user record found');
        error.statusCode = 300;
        throw error;
      }
      return userRecord;
    })
    .then(resp => {
      recData = resp;
      User.findOne({ recid: resp.uid })
      .select('bizname country city address desc displayName sex dob email fname img lname phonenum state zip interest')
      .populate('country', 'name')
      .populate('state', 'name')
      .then(profile => {
        if (!profile) {
          const error = new Error('No user found');
          error.statusCode = 300;
          throw error;
        }
        terms = !profile.displayName || profile.displayName==='' || profile.displayName===null || profile.displayName===undefined ? '5d4df5dd4827':'Good'
        userCountry = profile.country
        const token = jwt.sign(
          {
            recId: req.token,
            _id: profile._id,
            userId: profile.recid
          },
          '5d4df5dd4827741bf97ed038somexqwvysupersecretsecretlgbtwentynineteen'
        );
        return res.status(200).json({ stoken: token, profile:profile, token: req.token, terms:terms, userCountry:userCountry}); 
      })
      .catch(err => {
        id = recData.uid === undefined || '' || null ? null : recData.uid;
        email = recData.email === undefined || '' || null ? null : recData.email;
        ph = recData.phoneNumber === undefined || '' || null ? null : recData.phoneNumber;
        const user = new User({
          recid: id,
          email: email,
          phonenum: ph
        }); 
        user.save()
        .then(reslt => {
          const token = jwt.sign(
            {
              recId: req.token,
              _id: reslt._id,
              userId: id
            },
            '5d4df5dd4827741bf97ed038somexqwvysupersecretsecretlgbtwentynineteen'
          );
          return res.status(200).json({ stoken: token, profile:reslt, token: req.token});
        })
        .catch(function(error) {
            const err = new Error('SignUp Authentication Error');
            err.statusCode = 500;
            next(err);
        })
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
};

//UPDATE DESCRIPTION
exports.updateDescription = (req, res, next) => {
  let usr, tokenx;
  let desc = req.body.desc;
  User.findById(req.idToken)
    .then(user => {
      if (!user) {
        error = new Error('Login Error..');
        error.statusCode = 304;
        throw error;
      }
      user.desc = desc;
      return user.save();
    })
    .then(reslt => {
      usr = reslt;
      const token = jwt.sign(
        {
          recId: req.userToken,
          _id: reslt._id,
          userId: reslt.recid
        },
        '5d4df5dd4827741bf97ed038somexqwvysupersecretsecretlgbtwentynineteen'
      );
      return token;
    })
    .then(tokenx => {
      tokenx = tokenx;
      return Country.findOne({users:req.idToken}).select('name')
    })
    .then(reslt => {
      return res.status(200).json({ stoken: tokenx, profile:usr, 
        terms:'Good', userCountry: reslt});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}

//UPDATE USER PHOTO
exports.updateProfilePhoto = (req, res, next) => {
  if (req.files.length <= 0) {
    const error = new Error('No profile image provided.');
    error.statusCode = 322;
    throw error;
  }
  let uploadUrl = req.files.map(el => el.path);
  User.findById(req.idToken)
    .then(user => {
      if (!user) {
        error = new Error('Login Error..');
        error.statusCode = 304;
        throw error;
      }
      if(user.img && user.img.length > 0) {
        clearImage(user.img);
      }
      user.img = uploadUrl;
      return user.save();
    })
    .then(reslt => {
      return res.status(200).json({ message: 'Successful!' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
}


//UPDATE USERS
exports.updateExistUser = (req, res, next) => {
  let postedResult, userCountry; 
  let imgCheck=[];
  // let error;
  let resCountry, resState;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 322;
    throw error;
  }

  if (req.files.length <= 0) {
    const error = new Error('No profile image provided.');
    error.statusCode = 322;
    throw error;
  }

  let fname = req.body.fname ? req.body.fname : null;
  let lname = req.body.lname ? req.body.lname : null;
  let displayName = req.body.displayName ? req.body.displayName : null;
  let bizname = req.body.bizname ? req.body.bizname : null;
  let dob = req.body.dob ? req.body.dob : null;
  let city = req.body.city ? req.body.city : null;
  let statey = req.body.state ? req.body.state : null;
  let zip = req.body.zip ? req.body.zip : null;
  let countri = req.body.country ? req.body.country : null;
  let interest= req.body.interest ? JSON.parse(req.body.interest) : null;
  let uploadUrl = req.files.map(el => el.path);
  fname = fname !==null ? fname.replace(/[^a-z,A-Z]/g,''): null;
  lname = lname !==null ? lname.replace(/[^a-z,A-Z]/g,'') : null;
  displayName = displayName !== null ? displayName.replace(/[^a-z,A-Z,0-9,-]/g,''):null;
  bizname = bizname !== null ? bizname.replace(/[^a-z,A-Z,0-9,-]/g,''): null;
  city = city !== null ? city.replace(/[^a-z,A-Z,0-9,-]/g,'') : null;
  zip = zip !== null ? zip.replace(/[^0-9,-]/g,'') : null;
  
  User.findById(req.idToken)
    .then(user => {
      if (!user) {
        error = new Error('Login Error..');
        error.statusCode = 304;
        throw error;
      }
      uploadUrl.forEach(e1 => user.img.forEach(e2 => {if(e1 === e2) {imgCheck.push(e1)}}))
      if(imgCheck.length <= 0) {
        clearImage(user.img);
      }
      user.displayName = displayName;
      user.fname = fname;
      user.lname = lname;
      user.bizname = bizname;
      user.dob = dob;
      user.city = city;
      user.state = statey;
      user.zip = zip;
      user.country = countri;
      user.img = uploadUrl;
      user.interest = interest;
      return user.save();
    })
    .then(user => {
      postedResult = user;
      return State.findById(statey);
    })
    .then(rstate => {
      if(rstate.users.length > 0){
        const index = rstate.users.indexOf(postedResult._id);
        if(index > 0) {
          rstate.users.splice(index, 1);
          resState = rstate.users
          resState.push(postedResult);
        }else {
          resState = rstate.users;
          resState.push(postedResult);
        }
      } else {
        const pushState = [];
        pushState.push(postedResult);
        resState = pushState;
      }
      rstate.users = resState;
      return rstate.save();
    })
    .then(reslt => {
      return Country.findById(countri);
    })
    .then(rCountry => {
      if(rCountry.users.length > 0){
        const index = rCountry.users.indexOf(postedResult._id);
        if(index > -1) {
          rCountry.users.splice(index, 1);
          resCountry = rCountry.users
          resCountry.push(postedResult);
        }else {
          resCountry = rCountry.users;
          resCountry.push(postedResult);
        }
      } else {
        const pushCountry = [];
        pushCountry.push(postedResult);
        resCountry = pushCountry;
      }
      rCountry.users=resCountry;
      return rCountry.save();
    })
    .then(result => {
      userCountry = {name: result.name};
      const token = jwt.sign(
        {
          recId: req.userToken,
          _id: postedResult._id,
          userId: postedResult.recid
        },
        '5d4df5dd4827741bf97ed038somexqwvysupersecretsecretlgbtwentynineteen'
      );
      return token;
    })
    .then(tokenx => {
      // console.log(userCountry);
      return res.status(200).json({ stoken: tokenx, profile:postedResult, terms:'Good', userCountry: userCountry});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


// create New Post
exports.createPost = (req, res, next) => {
  let foundUser, post;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (req.files.length <= 0) {
    const error = new Error('No image/video provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.files.map(el => el.path);
  const owner = req.idToken;
  const postID = !req.body.postID ? null : req.body.postID;
  const title = !req.body.title ? null : req.body.title;
  const postType = !req.body.stype ? null : req.body.stype;
  const type = !req.body.kategorization ? null : req.body.kategorization;
  const catego = !req.body.category ? null : req.body.category;
  const shortdesc = !req.body.nshort ? null : req.body.nshort;
  const description = !req.body.nDesc ? null : req.body.nDesc;
  const price = !req.body.nprice ? null : req.body.nprice;
  const discount = !req.body.nDiscount ? null : req.body.nDiscount;
  const nlink = !req.body.nlink ? null : req.body.nlink;
  const nButton = !req.body.nButton ? null : req.body.nButton;
  const nAction = !req.body.nAction ? null : req.body.nAction;
  const tag = !req.body.nTag ? null : JSON.parse(req.body.nTag);
  const regionLong = !req.body.regionLong ? null : req.body.regionLong;
  const regionLat = !req.body.regionLat ? null : req.body.regionLat;

  User.findById(req.idToken)
    .then(user => {
      if (!user) {
        error = new Error('Login Error..');
        error.statusCode = 304;
        throw error;
      }
      foundUser = user;
      return foundUser;
    })
    .then(userResults => {
      // if(!postID) {
      //   Post.findById(postID)
      //     .then(foundPost => {
      //       if(!foundPost) {
      //         error = new Error('Post not found');
      //         error.statusCode = 304;
      //         throw error;
      //       }
      //       uploadUrl.forEach(e1 => user.img.forEach(e2 => {if(e1 === e2) {imgCheck.push(e1)}}))
      //         if(imgCheck.length <= 0) {
      //           clearImage(user.img);
      //         }
      //       foundPost.title = title;
      //       foundPost.shortdesc = shortdesc;
      //       foundPost.description = description;
      //       foundPost.price = price;
      //       foundPost.discount= discount;
      //       foundPost.imageUrl = imageUrl;
      //       foundPost.link = nlink;
      //       foundPost.button = nButton;
      //       foundPost.actiontype = nAction;
      //       foundPost.region = region;
      //       return foundPost.save(); 
      //     })
      //     .then(userPostResult => {
      //       res.status(201).json({
      //         post: userPostResult
      //       });
      //     })
      //     .catch(err => {
      //       if (!err.statusCode) {
      //         err.statusCode = 500;
      //         throw err
      //       }
      //     });
      // }
        post = new Post({
        category: catego,
        creator: owner,
        title: title,
        shortdesc: shortdesc,
        description: description,
        price: price,
        discount: discount,
        imageUrl: imageUrl,
        stype: postType,
        type: type,
        tag: tag,
        link: nlink,
        button: nButton,
        actiontype: nAction,
        regionLong: regionLong,
        regionLat: regionLat,
      });
      return post.save()
    })
    .then(userPost => {
      post = userPost;
      foundUser.posts.push(userPost);
      return foundUser.save();
    })
    .then(userPostResult => {
      if(!catego){
        return;
      }
      return Category.findById(catego);
    })
    .then(category => {
      if(!catego){
        return;
      }
      category.post.push(post);
      return category.save();
    })
    .then(categoryResult => {
      if(!tag || tag.length === 0) {
        return;
      }
      tag.forEach(tagsx => {
        return Tagging.findById(tagsx)
        .then(tagging => {
          if(tagging) {
            tagging.post.push(post);
            tagging.save();
          }
        })
      });
      return post;
    })
    .then(post => {
      res.status(201).json({
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Delete User Post
exports.deleteUserPost = (req, res, next) => {
  let category, tags
  const errors = validationResult(req);
  const idToken = req.idToken;
  if(!idToken) {
    const error = new Error('Not Authorized. Login Again!!');
    error.statusCode = 300;
    throw error;
  }
  const postID = req.body.postID;
  
  Post.findById(postID)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.idToken) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      category = post.category;
      tags = post.tag;
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postID);
    })
    .then(result => {
      return User.findById(req.idToken);
    })
    .then(user => {
      user.posts.pull(postID);
      return user.save();
    })
    .then(result => {
      if(!category) {
        return;
      }
      return Category.findById(category);
    })
    .then(foundCategory => {
      if(!foundCategory){
        return;
      }
      foundCategory.post.pull(postID);
      return foundCategory.save();
    })
    .then(result => {
      if(!tags || tags.length === 0) {
        return;
      }
      tags.forEach(tagsx => {
        return Tagging.findById(tagsx)
        .then(tagging => {
          if(tagging) {
            tagging.post.pull(postID);
            tagging.save();
          }
        })
      });
      return;
    })
    .then(result => {
      // console.log('deleted');
      res.status(200).json({ message: 'Deleted post.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Get User Post
exports.getUserPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  let totalItems, returnedPosts;
  
  Post.find({ creator: req.idToken, unlisted: false })
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find({ creator: req.idToken, unlisted: false })
        // .select('title imageUrl creator category stype type shortdesc description price discount button regionLong regionLat review')
        .populate('creator', 'displayName bizname img phonenum desc')
        .populate('category', 'name url')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      if(!posts){
        returnedPosts = []
      } else {
        returnedPosts = posts
      }
      res.status(200).json({
        message: 'Fetched posts successfully.',
        posts: returnedPosts,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Filter Post
exports.filterPosts = (req, res, next) => {
  console.log(req.body.pager);
  const currentPage = req.body.pager || 1;
  const param = req.body.cat;
  const perPage = 6;
  let totalItems, returnedPosts, filterdParams;
  if(!param){
    res.status(200).json({
      posts: [],
      totalItems: 0
    });
  } else {
    Tagging.findById(param)
    .then(reslt => {
      if(!reslt){
        filterdParams = Post.find({ category: param, unlisted: false })
        .select('title imageUrl creator category stype type shortdesc description price actiontype button review discount')
        .populate('creator', 'displayName bizname img phonenum desc')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      } else {
        filterdParams = Post.find({ tag: param, unlisted: false })
        .select('title imageUrl creator category stype type shortdesc description price actiontype button review discount')
        .populate('creator', 'displayName bizname img phonenum desc')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
      }
      return filterdParams;
    })
    .then(posts => {
      if(!posts){
        returnedPosts = []
      } else {
        returnedPosts = posts
      }
      res.status(200).json({
        posts: returnedPosts,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  }
};

//Search User
exports.searchAllUser = (req, res, next) => {
  const reqData = req.query.find ? req.query.find:null;
  const currentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems,foundUsr;
  if(!reqData || reqData===null) {
    const error = new Error('Empty Search String');
    error.statusCode = 422;
    throw error;
  }
  User.find({$or:[{displayName: reqData }, 
    {fname: reqData }, {lname: reqData },
    {bizname: reqData }], blockuser:false
  })
    .countDocuments()
    .then(count => {
      totalItems = count;
      return User.find({$or:[{displayName: reqData }, 
        {fname: reqData }, 
        {bizname: reqData }], blockuser:false
      })
        .select('displayName fname lname bizname img desc')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(foundUser => {
      if(!foundUser){
        foundUsr = []
      } else {
        foundUsr = foundUser;
      }
      res.status(200).json({
        message: 'Fetched posts successfully.',
        users: foundUsr,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Get Follower Search
exports.listFriendsConnector = (req, res, next) => {
  const reqData = req.query.find;
  const currentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems,foundUsr;
  if(!reqData || reqData===null) {
    const error = new Error('Empty Search String');
    error.statusCode = 422;
    throw error;
  }
  const myCursor = User.find({$or:[{displayName: `/^${reqData}/` }, 
    {fname: `/^${reqData}/` }, {lname:`/^${reqData}/` }], blockuser:false
  }).select('_id');
  Connectionx.find({connector: { $in: myCursor._id }, connection:req.idToken, block: false}) 
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Connectionx.find({connector: { $in: myCursor._id }, connection:req.idToken, block: false})
        .select('connector mutual accepted')
        .populate('connector', 'displayName fname lname bizname img desc') 
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(foundUser => {
      if(!foundUser){
        foundUsr = []
      } else {
        foundUsr = foundUser;
      }
      res.status(200).json({
        users: foundUsr,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Get Following by Search
exports.listFriendsConnections = (req, res, next) => {
  const reqData = req.query.find;
  const currentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems, foundUsr;
  if(!reqData || reqData===null) {
    const error = new Error('Empty Search String');
    error.statusCode = 422;
    throw error;
  }
  const myCursor = User.find({$or:[{displayName: `/^${reqData}/` }, 
    {fname: `/^${reqData}/` }, {lname: `/^${reqData}/` }], blockuser:false
  }).select('_id');

  Connectionx.find({connection: { $in: myCursor._id }, connector:req.idToken, block: false})  
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Connectionx.find({connection: { $in: myCursor._id }, connector:req.idToken, block: false})
        .select('connector mutual accepted')
        .populate('connector', 'displayName fname lname bizname img desc') 
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(foundUser => {
      if(!foundUser){
        foundUsr = []
      } else {
        foundUsr = foundUser;
      }
      res.status(200).json({
        users: foundUsr,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//Get All Connections & Following
exports.getAllConnects = (req, res, next) => {
  let categoryItems;
  const currentPage = req.query.page || 1;
  const perPage = 10;
  let totalConnections; let connectionx; let totalConnected; let connectedx;
  if(!req.idToken){
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  Connectionx.find({connection: req.idToken, block:false})
  .countDocuments()
  .then(counted => {
    totalConnections = counted;
    return Connectionx.find({connection: req.idToken, block:false})
      .select('connector mutual accepted')
      .populate('connector', 'displayName fname lname bizname img desc') 
      .sort({updatedAt: -1})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
  })
  .then(konnections => {
    if(!konnections){
      return connectionx = []
    } else {
      connectionx = konnections;
    }
    return Connectionx.find({connector: req.idToken, accepted:true, block:false})
      .countDocuments()
  })
  .then(konnected => {
    totalConnected = konnected;
    return Connectionx.find({connector: req.idToken, accepted:true, block:false})
      .select('connection mutual accepted')
      .populate('connection', 'displayName fname lname bizname img desc') 
      .sort({updatedAt: -1})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
  })
  .then(konnected => {
    if(!konnected) {
      connectedx = []
    } else {
      connectedx = konnected
    }
    res.status(200).json({
      connection: connectionx,
      connected: connectedx,
      totalConnections:totalConnections,
      totalConnected: totalConnected
    });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

//Get All Friends Connections & Following
exports.getAllFriendsConnects = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const userToFind = req.body.user ? req.body.user : null;
  const perPage = 10;
  let totalConnections, totalConnected, totalItems, returnedPosts;
  if(!req.idToken){
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  if(currentPage > 1) {
   Post.find({ creator: userToFind, unlisted: false })
        .select('title imageUrl creator category stype type shortdesc')
        .populate('creator', 'displayName img phonenum')
        .populate('category', 'name url')
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    .then(posts => {
      if(!posts){
        returnedPosts = []
      } else {
        returnedPosts = posts
      }
      res.status(200).json({
        posts: returnedPosts,
        totalpost: 'N/A',
        totalConnections:'N/A',
        totalConnected: 'N/A'
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  } else {
    Connectionx.find({connection: userToFind, accepted:true})
    .countDocuments()
    .then(counted => {
      totalConnections = counted;
      return Connectionx.find({connector: userToFind, accepted:true}).countDocuments()
    })
    .then(konnected => {
    totalConnected = konnected;
    return Post.find({ creator: userToFind, unlisted: false })
    .countDocuments()
    })
    .then(count => {
      totalItems = count;
      return Post.find({ creator: userToFind, unlisted: false })
        .select('title imageUrl creator category stype type shortdesc')
        .populate('creator', 'displayName img phonenum')
        .populate('category', 'name url')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      if(!posts){
        returnedPosts = []
      } else {
        returnedPosts = posts
      }
      res.status(200).json({
        posts: returnedPosts,
        totalpost: totalItems,
        totalConnections:totalConnections,
        totalConnected: totalConnected
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  }
};

//Get Category & Tag
exports.getCatag = (req, res, next) => {
  let categoryItems;
  if(!req.idToken){
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  Category.find({block: 'No'})
  .select('name url')
  .then(categ => {
    categoryItems = categ;
    return Tagging.find({block: 'No'}).select('name')
  })
  .then(tags => {
    res.status(200).json({
      tags: tags,
      category: categoryItems
    });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-01
//Create Tag
exports.createTag = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const tagging = new Tagging({
    name: name,
  });
  tagging.save()
    .then(result => {
      res.status(200).json({ message: 'Tag updated!'});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// api-02
///Save Post
exports.savePost = (req, res, next) => {
  const name = req.body.post;
  Saving.findOne({user:req.idToken, post:name})
  .then(result => {
    if(result) {
      const error = new Error('Already exist');
      error.statusCode = 422;
      throw error;
    }
    const saving = new Saving({
      user: req.idToken,
      post: name
    });
    return saving.save()
  })
  .then(result => {
    if(!result){
      const error = new Error('Cannot pull data');
      error.statusCode = 422;
      throw error;
    }
    return Saving.findById(result._id).select('post')
    .populate({
      path : 'post', populate : { path : 'creator category',  select: 'displayName bizname img phonenum desc name',
    },
      select: 'title imageUrl creator category stype type shortdesc actiontype link description price actiontype button review discount regionLong regionLat', 
    })  
  })
  .then(result => {
    res.status(200).json({ posts: result});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-03
///Remove Saved Post
exports.removeSavePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Saved item do not exist');
    error.statusCode = 422;
    throw error;
  }
  const savedItem = req.body.item;
  Saving.findByIdAndRemove(savedItem)
  .then(result => {
    res.status(200).json({ message: 'Sucessful!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-04
///Fetch Save Post
exports.fetchSavePost = (req, res, next) => {
  Saving.find({user:req.idToken}).select('post').
  populate({
    path: 'post',
    select: 'title imageUrl creator category stype type shortdesc actiontype link description price actiontype button review discount regionLong regionLat',
    populate: [
    {path:'creator', select:'displayName bizname img phonenum desc'},
    {path:'category', select:'name'},
    ]
  })
  .then(result => {
    res.status(200).json({ posts: result});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-05
///Save Comment
exports.savePostComment = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('No Comment Entered!');
    error.statusCode = 422;
    throw error;
  }
  const text = req.body.text;
  const user = req.idToken;
  const post = req.body.post;
  if(!text){
    const error = new Error('No Comment Entered!');
    error.statusCode = 422;
    throw error;
  }
  const comment = new Comment({
    user: user,
    post: post,
    text: text
  });
  comment.save()
  .then(result => {
    res.status(200).json({ comment: result});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-06
//Fetch Comments
exports.fetchPostComment = (req, res, next) => {
  const currentPage = req.body.pager || 1;
  const perPage = 10;
  let totalItems;
  const post = req.body.cat;
  Comment.find({post:post, block:'No'})
  .countDocuments()
    .then(count => {
      totalItems = count;
      return Comment.find({post:post, block:'No'})
        .select('text user')
        .populate('user', 'displayName img')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
  .then(result => {
    res.status(200).json({ comment: result, totalItems: totalItems});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-07
///Review Post
exports.postReview = (req, res, next) => {
  let sentResult;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('You already reviewed this item!');
    error.statusCode = 422;
    throw error;
  }
  const post = req.body.post;
  const order = req.body.order;
  const text = req.body.text; 
  const rev = req.body.review;

  const reviews = new Review({
    user: req.idToken,
    order: order,
    post: post,
    review: rev,
    text: text
  });
  reviews.save()
  .then(result => {
    const rewards = new Reward({
      user: req.idToken,
      for: post,
      order: order,
      point: 10
    });
    return rewards.save()
  })
  .then(result => {
    sentResult = result;
    return Post.findById(post);
  })
  .then(posts => {
    if(!posts.review){
      console.log('rev1')
      const reviw = {reviews: parseFloat(rev), users: 1}
      posts.review = reviw;
      return posts.save();
    } else {
      const xa = parseFloat(posts.review.reviews) + parseFloat(rev);
      const xb = posts.review.users + 1;
      console.log(`reviews: ${xa}`);
      console.log(`users : ${xb}`)
      posts.review = {reviews: xa, users: xb};
      return posts.save();
    }
  })
  .then(result => {
    return res.status(200).json({mssg:sentResult})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-08
//Fetch Review
exports.fetchReviewComment = (req, res, next) => {
  const currentPage = req.body.pager || 1;
  const perPage = 10;
  let totalItems;
  const post = req.body.cat;
  console.log(post)
  Review.find({post:post, block:false})
  .countDocuments()
    .then(count => {
      console.log(count);
      totalItems = count;
      return Review.find({post:post, block:false})
        .select('text user review')
        .populate('user', 'displayName img')
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({updatedAt: -1})
    })
  .then(result => {
    console.log(result)
    res.status(200).json({ review: result, totalItems: totalItems});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-09
//Fetch Notification
exports.fetchNotifications = (req, res, next) => {
  Notifications.find({user:req.idToken})
    .select('title actionData bodyText updatedAt')
    .sort({updatedAt: -1})
    .limit(100)
  .then(result => {
    res.status(200).json({ notificate: result});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-10
//remove Notification
exports.removeNotifications = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Notification does not exist!');
    error.statusCode = 404;
    throw error;
  }
  const id = req.body.cat
  Notifications.findByIdAndRemove(id)
  .then(result => {
    res.status(200).json({ message:'removed!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-11
//Compare contact
exports.compareContacts = (req, res, next) => {
  const contacts = JSON.parse(req.body.cat);
  User.find({phonenum:{ $in: contacts }, blockuser: false})
    .select('phonenum displayName')
  .then(result => {
    res.status(200).json({ contacts: result});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-12
//Invite Friends
exports.inviteFriends = (req, res, next) => {
  const contacts = JSON.parse(req.body.cat);
  if(!contacts){
    const error = new Error('No contact information!');
    error.statusCode = 422;
    throw error;
  }
  const invitation = new Invitation({
    user:req.idToken,
    invited: contacts,
  })
  invitation.save()
  .then(result => {
    res.status(200).json({ message: 'successful!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-13
//Update Profile
exports.userProfileUpdates = (req, res, next) => {
  let userx;
  let updated;

  let firstName, lastName, sex, dob, phonenumber, address, city, statey, zip, countri, bizname;
  firstName = !req.body.firstName || req.body.firstName === 'null' ? null : req.body.firstName.replace(/[^a-z,A-Z]/g,'');
  lastName = !req.body.lastName || req.body.lastName === 'null' ? null : req.body.lastName.replace(/[^a-z,A-Z]/g,'');
  sex = !req.body.sex || req.body.sex === 'null' ? null : req.body.sex.replace(/[^a-z,A-Z]/g,'');
  dob = !req.body.dob || req.body.dob === 'null' ? null : req.body.dob;
  phonenumber = !req.body.phonenumber || req.body.phonenumber === 'null' ? null : req.body.phonenumber.replace(/[^0-9,-]/g,'');
  address = !req.body.address || req.body.address === 'null' ? null : req.body.address;
  city = !req.body.city || req.body.city === 'null' ? null : req.body.city.replace(/[^a-z,A-Z,0-9,-,\s]/g,'');
  statey = !req.body.statey || req.body.statey === 'null' ? null : req.body.statey;
  zip = !req.body.zip || req.body.zip === 'null' ? null : req.body.zip.replace(/[^0-9,-]/g,'');
  countri = !req.body.country || req.body.country === 'null' ? null : req.body.country;
  bizname = !req.body.bizname || req.body.bizname === 'null' ? null : req.body.bizname;

  User.findById(req.idToken)
  .then(user => {
    if (!user) {
      error = new Error('Login Error..');
      error.statusCode = 304;
      throw error;
    }
    userx = user
    return User.findByIdAndUpdate(req.idToken,{
      fname:firstName,
      lname:lastName,
      bizname:bizname,
      dob:dob,
      city:city,
      state:statey,
      zip:zip,
      sex:sex,
      phonenum:phonenumber,
      address:address,
      country:countri,
    })
  })
  .then(result => {
    updated=result;
    if(statey){
      // console.log(userx.state)
      return State.findById(userx.state)
    }
    return;
  })
  .then(foundState => {
    // console.log(foundState)
    if(statey){
      if(foundState.users.length > 0){
        const index = foundState.users.indexOf(req.idToken);
        if(index > -1){
          foundState.users.splice(index, 1);
          return foundState.save();
        }
      }
      return
    }
    return
  })
  .then(user => {
    if(statey){
      return State.findById(statey);
    }
    return;
  })
  .then(rstate => {
    if(statey){
      rstate.users.push(updated)
      return rstate.save();
    }
    return;
  })
  .then(result => {
    if(countri){
      // console.log(userx.country)
      return Country.findById(userx.country)
    }
    return;
  })
  .then(foundCountry => {
    // console.log(foundCountry)
    if(countri){
      if(foundCountry.users.length > 0){
        const index = foundCountry.users.indexOf(req.idToken);
        if(index > -1){
          foundCountry.users.splice(index, 1);
          return foundCountry.save();
        }
      }
      return
    }
    return
  })
  .then(result => {
    if(statey){
      return Country.findById(countri);
    }
    return;
  })
  .then(rCountry => {
    if(countri){
      rCountry.users.push(updated)
      return rCountry.save();
    }
    return;
  })
  .then(result => {
    return res.status(200).json({ message: 'Successful!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-14
///Save Schedule
exports.saveSchedule = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('No Comment Entered!');
    error.statusCode = 422;
    throw error;
  }
  const text = req.body.date;
  if(!text){
    const error = new Error('No date entered');
    error.statusCode = 422;
    throw error;
  }
  Schedule.find({user:req.idToken, date:text})
  .then(result => {
    if(!result || result.length<=0){
      const schedule = new Schedule({
        user: req.idToken,
        order: null,
        date: text
      });
      return schedule.save()
    } else {
      return 
    }
  })
  .then(result => {
    res.status(200).json({ message: 'Successful!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-15
///Fetch Schedule
exports.fetchSchedule = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Incorrect Data');
    error.statusCode = 422;
    throw error;
  }
  const text = JSON.parse(req.body.date);
  const merchant = JSON.parse(req.body.seller);
  if(!text || !merchant){
    const error = new Error('Data missing');
    error.statusCode = 422;
    throw error;
  }
  Schedule.find({user:merchant, date:{ $gte: text}}).limit(150).sort({date: 1})
  .then(result => {
    res.status(200).json({ sch: result});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-16
///Fetch Orders
exports.fetchOrders = (req, res, next) => {
  const currentPage = req.body.pager || 1;
  const perPage = 10;
  let totalItems;
  Odetails.find({user:req.idToken, status:{$ne:'rejected'}}).lean()
  .countDocuments()
  .then(count => {
    totalItems = count;
    return Odetails.find({user:req.idToken, status:{$ne:'rejected'}}). 
    select('post qty status updatedAt').
    populate({
      path: 'post',
      select: 'title imageUrl creator category stype type shortdesc actiontype link description price actiontype button review discount regionLong regionLat',
      populate: [
      {path:'creator', select:'displayName bizname img phonenum desc'},
      {path:'category', select:'name'},
      ]
    })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .sort({updatedAt: -1})
    // return Odetails.aggregate().match({ user:req.idToken }).pipeline()
  })
  .then(result => {
    console.log(result);
    res.status(200).json({ order: result, total:totalItems});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-17
///Create Connection
exports.createConnection = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('No Comment Entered!');
    error.statusCode = 422;
    throw error;
  }
  const xcon = req.body.xcon;
  const accept = !req.body.accept ? false : true;
  if(xcon==='null' || !xcon){
    const error = new Error('No user connection provided');
    error.statusCode = 422;
    throw error;
  }
  Connectionx.find({$or:[{connector:req.idToken, connection:xcon},{connector:xcon, connection:req.idToken}]})
  .select('id accepted block')
  .then(conn => {
    if(!conn || conn.length<=0){
      const connectionx = new Connectionx({
        connector: req.idToken,
        connection: xcon
      });
      return connectionx.save();
    } else {
      conn[0].block = false;
      return conn[0].save();
    }
  })
  .then(result => {
    const title = !accept ? 'New connection': 'Connection Updated'
    const body = !accept ? 'New connection Alert': "Your friend's connection is updated";
    const action = 'Profile';
    return submitNotification(xcon,title,body,action,null);
    //socket
  })
  .then(result => {
    return talkToSocket(xcon,`NewConnect`, {action:`NewConnect`, data:{title:!accept ? 'New connection': 'Connection Updated', body : !accept ? 'New connection Alert': "Your friend's connection is updated"}})
  })
  .then(result => {
    res.status(200).json({ message: 'Successful!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-18
///Update Connection
exports.updateConnection = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('No Comment Entered!');
    error.statusCode = 422;
    throw error;
  }
  const yg = req.body.yg;
  const users = req.body.user;
  const xcon = req.body.xcon;
  const accept = !req.body.accept || req.body.accept==='false' || req.body.accept==='null' ? false : true;
  const connect = !req.body.connect || req.body.connect==='false' || req.body.connect==='null' ? false : true;
  const block = !req.body.block || req.body.block==='null' || req.body.block==='false' ? false : true;
  if(!xcon || xcon==='null'){
    const error = new Error('No user connection provided');
    error.statusCode = 422;
    throw error;
  }

  Connectionx.findById(xcon)
  .then(result => {
    if(!result || result.length<=0){
      const error = new Error('No connection with this user');
      error.statusCode = 422;
      throw error;
    }
    result.mutual = connect;
    result.accepted = accept;
    result.block = block;
    return result.save();
  })
  .then(result => {
    const title = `${yg}'s Update`;
    const body = !connect ? `${yg} accepted your connection`: `You are now mutually connected with ${yg}`;
    const action = 'Profile';
    return submitNotification(xcon,title,body,action,null);
    //socket
  })
  .then(result => {
    if(block === false){
      return talkToSocket(users,`ConnectUpdate`, {action:`ConnectUpdate`, data:{title:`${yg}'s Update`, body : !connect ? `${yg} accepted your connection`: `You are now mutually connected with ${yg}`}})
    }
    return;
  })
  .then(result => {
    res.status(200).json({ message: 'Successful!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-19
///Check Existing Message
exports.checkExistingMessage = (req, res, next) => {
  let chatt; let status = 'Offline'; let xxa; let xxb;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('No user information provided');
    error.statusCode = 422;
    throw error;
  }
  const xcon = req.body.xcon;
  const cnnUser = req.body.xconn;
  if(xcon==='null' || !xcon){
    const error = new Error('No user information provided');
    error.statusCode = 422;
    throw error;
  }
  if(cnnUser==='null' || !cnnUser || cnnUser==='undefined'){
    const error = new Error('No user information provided');
    error.statusCode = 422;
    throw error;
  }
  Message.find({conn:xcon}, {text:{$slice:-80, $sort:{"text.createdAt": -1}}}).
  select('conn text').
  populate({
    path: 'conn',
    select: '_id connector connection',
    populate:[
      { path: 'connector', select:'userS updatedAt' },
      { path: 'connection', select:'userS updatedAt' },
    ]
    // populate:{ path: 'connection', select:'displayName bizname img userS updatedAt' }
  }).
  slice('text', -80).
  exec().
  then(chat => {
    chatt = chat
    if(chat.length <= 0 || !chat[0].conn){
      return User.findById(cnnUser).select('userS updatedAt')
    }
    return
  })
  .then(result => {
    if(chatt.length <= 0){
      xxa = IO.getIO().sockets.connected[result.userS];
      xxb = result.updatedAt;
    } else {
      if(chatt[0].conn.connector._id !== req.idToken){
        xxa = IO.getIO().sockets.connected[chatt[0].conn.connector.userS];
        xxb = chatt[0].conn.connector.updatedAt
      }
      if(chatt[0].conn.connection._id !== req.idToken){
        xxa = IO.getIO().sockets.connected[chatt[0].conn.connection.userS];
        xxb = chatt[0].conn.connection.updatedAt
      }
    }
    status = !xxa || xxa === undefined || xxa === 'undefined'? xxb : 'Online'
    return status;
  })
  .then(result => {
    res.status(200).json({ chat:chatt, status:status });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-20
///Chat Loader 
exports.confirmConnection = (req, res, next) => {
  const currentPage = req.body.pager || 1;
  const perPage = 10;
  console.log(currentPage);
  Message.find({}, {conn:{"conn.connection":req.idToken,"conn.connector":req.idToken}}).
  select('conn text status updatedAt').
  populate({
    path: 'conn',
    match: {$or:[{connector:req.idToken},{connection:req.idToken}], accepted:true, block:false},
    select: '_id connector connection',
    populate:[
      { path: 'connector', select:'displayName bizname img' },
      { path: 'connection', select:'displayName bizname img' },
    ]
  }).
  slice('text', -1).
  skip((currentPage - 1) * perPage).
  limit(perPage).
  sort({updatedAt: -1}).
  exec().
  then(result => {
    let chat = result.filter(el => el.conn !== null);
    chat = chat.map(el => {
      if(el.conn.connector._id == req.idToken){
        return {status:el.status, _id:el._id, text:el.text, updatedAt:el.updatedAt, conn:{_id:el.conn._id, connection:el.conn.connection}}
      } else {
        return {status:el.status, _id:el._id, text:el.text, updatedAt:el.updatedAt, conn:{_id:el.conn._id, connection:el.conn.connector}}
      }
    })
    return chat;
  })
  .then(chat => {
    res.status(200).json({ chat });
  }).
  catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-21
///Insert Chat Message
exports.insertChatMessage = (req, res, next) => {
  let storedUser; let status;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('No Comment Entered!');
    error.statusCode = 422;
    throw error;
  }
  const xcon = req.body.xcon;
  const text = JSON.parse(req.body.text);
  const user = req.body.user;
  if(xcon==='null' || !xcon){
    const error = new Error('No user connection provided');
    error.statusCode = 422;
    throw error;
  }
  if(text==='null' || !text){
    const error = new Error('...typing');
    error.statusCode = 424;
    throw error;
  }
  if(user==='null' || !user){
    const error = new Error('restart chat...');
    error.statusCode = 424;
    throw error;
  }
  Message.find({conn:xcon})
  .then(result => {
    if(!result || result.length<=0){
      const message = new Message({
        conn: xcon,
        text: text
      });
      return message.save();
    } else {
      result[0].text.push(text);
      result[0].status=true;
      return result[0].save();
    }
  })
  .then(result => {
    return User.findById(req.idToken).select('displayName')
  })
  .then(result => {
    storedUser = result.displayName;
    return talkToSocket(user,'NewMessage', {action:'NewMessage', data:{text:`New message from ${storedUser}`,data:text, conn:xcon}})
  })
  .then(result => {
    status = result === 'sent' ? 'Online': result;
    if(result !== 'sent'){
      const title = 'New Message';
      const body = `You have a new message from ${storedUser}`;
      const action = 'ChatText';
      return submitNotification(xcon,title,body,action,null);
    }
    return;
  })
  .then(reslt => {
    return res.status(200).json({ status: status});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-22
//Update User Socket
exports.updateUserSocket = (req, res, next) => {
  const scheck = req.body.scheck;
  if(scheck==='null' || !scheck || scheck === 'undefined'){
    const error = new Error('SCheck Error');
    error.statusCode = 422;
    throw error;
  }
  User.findById(req.idToken)
  .then(user => {
    if (!user) {
      error = new Error('Login Error..');
      error.statusCode = 304;
      throw error;
    }
    user.userS = scheck;
    user.userStatus = true;
    return user.save();
  })
  .then(reslt => {
    return res.status(200).json({ message:'successful'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}

// api-23
//Compare contact
exports.checkMutual = (req, res, next) => {
  const xcon = req.body.xcon;
  Connectionx.find({$or:[{connector:req.idToken, connection:xcon},{connector:xcon, connection:req.idToken}], block:false})
  .select('mutual accepted') 
  .then(result => {
    res.status(200).json({ result:result });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};


// api-24
//Check is Typing
exports.isTyping = (req, res, next) => {
  let status;
  const xcon = req.body.xcon;
  if(xcon==='null' || !xcon || xcon === 'undefined'){
    const error = new Error('SCheck Error');
    error.statusCode = 422;
    throw error;
  }
  talkToSocket(xcon,'isTyping', {action:'isTyping', data:{user:req.idToken,status:true}})
  .then(reslt => {
    status = reslt === 'sent' ? 'Online': reslt;
    return res.status(200).json({ status: status});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}

// api-25
//Adjust Message Status
exports.adjustMessageStatus = (req, res, next) => {
  let status;
  const xcon = req.body.xcon;
  if(xcon==='null' || !xcon || xcon === 'undefined'){
    const error = new Error('Message connection error');
    error.statusCode = 422;
    throw error;
  }
  Message.find({conn:xcon}).slice('text', -1)
  .then(result => {
    if(!result || result.length<=0){
      return;
    } else {
      if(result[0].text[0].user._id == req.idToken){
        return;
      }else{
        result[0].status = false;
        return result[0].save();
      }
    }
  })
  .then(reslt => {
    return res.status(200).json({ message:'Successful!' });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}

// api-26
///Submit Orders
exports.submitOrders = (req, res, next) => {
  let filledOrders; let stripeResult;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Data Error!');
    error.statusCode = 422;
    throw error;
  }
  const user = req.idToken;
  const address = req.body.address;
  const tdiscount = req.body.tdiscount;
  const shiphandling = req.body.sandh;
  const ordertotal = req.body.odt;
  const reward = req.body.rewardsapply;
  const payTotal = parseFloat(req.body.payTotal);
  const sdate = req.body.date;
  const parsedDate = req.body.parsedDate;
  const orderDetails = JSON.parse(req.body.details);
  const token = JSON.parse(req.body.stripeToken);
  const calculatedReward = !payTotal? 0*10:payTotal*10;
  if(!token){
    const error = new Error('Card Error');
    error.statusCode = 422;
    throw error;
  }
  Stripe.charges.create({
    amount: payTotal*100,
    currency: 'usd',
    description: `Lynkzed Purchases - ${parsedDate}`,
    statement_descriptor: `Lynkzed Purchases`,
    source: token.id,
  })
  .then(result => {
    if(result.status !== 'succeeded'){
      const error = new Error('Card charge error');
      error.statusCode = 422;
      throw error;
    }
    stripeResult = result;
    const orders = new Orders({
      shipaddress:address,
      totaldiscount:tdiscount,
      shiphandling:shiphandling,
      ordertotal:ordertotal,
      rewardsapply:reward,
      paymenttotal:payTotal,
      paymenttype:stripeResult.source.funding
    });
    return orders.save();
  })
  .then(result => {
    filledOrders = result;
    if(sdate === 'n/a'){
      return;
    }else{
      const schedule = new Schedule({
        user: user,
        order: filledOrders._id,
        date: sdate,
      });
      return schedule.save()
    }
  })
  .then(result => {
    if(reward <= 0){
      const rewards = new Reward({
        user: req.idToken,
        order: order,
        point: calculatedReward
      });
      return rewards.save()
    } else {
      const rewards = new Reward({
        user: req.idToken,
        order: order,
        point: calculatedReward,
        usage: reward
      });
      return rewards.save()
    }
  })
  .then(result => {
    if(!orderDetails || orderDetails.length <=0){
      return;
    } else {
      orderDetails.map(async el => {
        const odetails = new Odetails({
          user: user,
          order:filledOrders._id,
          post: el._id,
          qty: el.qty,
          price: el.price,
          discount: el.discount,
          linetotal: el.linetotal,
          status:'Awaiting'
        });
        const result = await odetails.save();
        const socketTalk = talkToSocket(el.merchant, 'NewOrder', { action: 'NewOrder', data: { text: `New order by ${stripeResult.source.name}` } });
        const socketTalk_1 = socketTalk;
        if (socketTalk_1 !== 'sent') {
          const title = 'New Order';
          const body = `New order by ${stripeResult.source.name}`;
          const action = 'Order';
          return submitNotification(el.merchant, title, body, action, null);
        }
        return;
      })
    }
  })
  .then(result => {
    res.status(200).json({ message: 'Successful!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

// api-27
//Fetch Rewards
exports.fetchRewards = (req, res, next) => {
  const currentPage = req.body.pager || 1;
  const perPage = 5;
  let rewardPoints;
  const toObjectId = v => mongoose.Types.ObjectId(v);
  if(currentPage === 1 || currentPage === "1"){
    Reward.aggregate([
      {"$match": {user: toObjectId(req.idToken)}},
      { "$group": {
        "_id": "$user",
        "point": {
          "$sum": {
            "$sum": "$point"
          }
        },
        "usage": {
          "$sum": {
            "$sum": "$usage"
          }
        }
      }},
      { "$project": {
        "available": {"$subtract": ["$point", "$usage"]},
        "_id": 0
      }}
    ])
    .then(rewardSums => {
      if(rewardSums.length > 0){
        rewardPoints = rewardSums[0].available;
      }
      return Reward.find({user:req.idToken})
        .select('for order point usage updatedAt')
        .populate('for', 'imageUrl title')
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({updatedAt: -1})
    })
    .then(result => {
      console.log(rewardPoints);
      console.log(result)
      res.status(200).json({ reward:result, total:rewardPoints});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  } else {
    Reward.find({user:req.idToken})
        .select('for order point usage updatedAt')
        .populate('for', 'imageUrl title')
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    .then(result => {
      res.status(200).json({ reward:result, total:0});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
  }
};


//Remove Image
const clearImage = filePath => {
  filePath.forEach(el => {
    el = path.join(__dirname, '..', el);
    fs.unlink(el, err => console.log(err));
  })
}

const submitNotification = (v,w,x,y,z) => {
  const notifications = new Notifications({
    user: v,
    bodyText: x,
    subtitle: z,
    title: w,
    actionData:y
  });
  notifications.save()
}

const talkToSocket = async(x,y,z) => {
  let ttee; let resultx; let theUser; let datey;
  try{
    theUser = await User.findById(x).select('userS userStatus updatedAt');
    if (!theUser || theUser.length <= 0) {
      error = new Error('User Error');
      error.statusCode = 304;
      throw error;
    }
    if(theUser.userS){
      ttee = await IO.getIO().sockets.connected[theUser.userS];
    }
    if(!ttee || ttee === undefined || ttee === 'undefined' ){
      resultx = 'unavailable';
      theUser.userStatus = false;
      await theUser.save();
      return theUser.updatedAt;
    } else {
      resultx = 'sent';
      await IO.getIO().to(theUser.userS).emit(y, z);
      return resultx;
    }
  }catch(err){
    const error = new Error('Socket Error');
    error.status = 422;
    throw error;
  }
}

