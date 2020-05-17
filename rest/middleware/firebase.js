const admin = require('./firebaseConfig');

let uid;
module.exports = (req, res, next) => {
    //console.log(req.body.token);
    const idToken = req.body.token;
    admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
        uid = decodedToken.uid;
        req.userId = uid;
        req.token = idToken;
        next();
    }).catch(function(error) {
        const err = new Error('User Authentication Error!');
        err.statusCode = 422;
        next(err);
    });
}

