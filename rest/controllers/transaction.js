const fs = require('fs');
const path = require('path');
const expoSdk = require('../util/expoSdk');
const { validationResult } = require('express-validator/check');

const Category = require('../models/category');
const Post = require('../models/post');
const User = require('../models/user');
const Country = require('../models/country');
const State = require('../models/state');
const Webform = require('../models/webrequest');
const Notifications = require('../models/notify');
const Cocategory = require('../models/commonCategory');
const Shipmentsize = require('../models/shipmentsize');

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(posts => {
      res.status(200).json({
        message: 'Fetched posts successfully.',
        posts: posts,
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

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });
  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Post fetched.', post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post updated!', post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }
      // Check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Deleted post.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createCategory = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const url = req.body.name.replace(/[\/. ,:-]+/g, "").toLowerCase();
  const block = req.body.block;
  const createCategory = new Category({
    name: name,
    url: url,
    block: block 
  });
  createCategory.save()
  .then(result => {
    res.status(201).json({ message: 'New Category Created Succcessfully!', category: result });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.createcountry = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const block = req.body.block;
  const createcountry = new Country({
    name: name,
    block: block 
  });
  createcountry.save()
  .then(result => {
    res.status(201).json({ message: 'New Country Created Succcessfully!', country: result });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.websitereq = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const email = req.body.email;
  const reason = req.body.reason;
  const message = req.body.message;
  
  const submitWebform = new Webform({
    name: name,
    email: email,
    reason: reason,
    mssg: message 
  });
  submitWebform.save()
  .then(result => {
    res.status(201).json({ message: 'Your request submitted succcessfully!', request: result });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.createstate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const countr = req.body.country;
  
  const createstate = new State({
    name: name,
    country: countr,
  });
  createstate.save()
  .then(res => {
      return Country.findById(req.body.country);
  })
  .then(countryexist => {
    countryexist.states.push(createstate);
    return countryexist.save();
  })
  .then(result => {
    res.status(201).json({ 
      message: 'New State Created Succcessfully!',
      state: createstate
    });
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

///Create Common Category
exports.commonCategory = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Category is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const cocat = new Cocategory({
    name: name,
  });
  cocat.save()
    .then(result => {
      res.status(200).json({ message: 'Common Category updated!'});
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// Send Notification
exports.sendNotifications = (req, res, next) => {
  let sentTicketsNum, sentTickets, savedTickets = [];
  const rqUsers = ['5d4df4ca4827741bf97ed037','5d4a136bb39a6b3c2938fa31','5d4df5dd4827741bf97ed038','5d8fa9582918dff18fc1e368'];
  const bodyText = req.body.bodyText || 'New Update Alerts'; 
  const subtitle = req.body.subtitle || "Don't miss out"; 
  const title = req.body.title || 'New Deals!'; 
  const actionData= req.body.actionData || null; 
  const data= req.body.data || 'Get ahead of the game, enjoy new deals and save more...'
  User.find({ _id:{ $in: rqUsers }, blockuser: false })
  .select('notificationtoken displayName')
  .then(pushToken => {
    return expoSdk.pushNotify(pushToken,bodyText,subtitle,title,actionData,data);
  })
  .then(sentTicket => {
    console.log("I'm out successfully");
    console.log(sentTickets);
    sentTicketsNum = sentTicket.tickets.length || 0;
    sentTickets = sentTicket
    rqUsers.map(el =>{
      const notifications = new Notifications({
        user: el,
        bodyText: data,
        subtitle: subtitle,
        title: title,
        actionData:bodyText
      });
      notifications.save()
      .then(result => {
        savedTickets.push(result);
        if(savedTickets.length === rqUsers.length) {
          res.status(200).json({ message: `Notification have been sent to ${sentTicketsNum} users!!!`, tickets: sentTickets.tickets});
        }
      })
      .catch (err => {
        if (!err.statusCode) {
          err.statusCode = 405;
        }
        throw err;
      })
    })
  })
  .catch (err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}

//Create Shipment Sizes
exports.createShipmentSizes = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed!');
    error.statusCode = 422;
    throw error;
  }
  const name = req.body.name;
  const price = req.body.price
  const shipmentSize = new Shipmentsize({
    name: name,
    price: price,
  });
  shipmentSize.save()
  .then(result => {
    res.status(200).json({ message: 'Shipment Size Created!'});
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};


const clearImage = filePath => {    
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};


