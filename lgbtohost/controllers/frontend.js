const WebData = require('../models/dataSourcing');

exports.submitData = (req, res, next) => {
  const name = req.body.fullname;
  const email = req.body.email;
  const reason = req.body.reason;
  const message = req.body.message;

  const webData = new WebData(name, email, reason, message);
  webData
  .save()
  .then(res => {
    if(res.status === 422) {
      throw new Error("We have a pending request on your name!");
    }
    if (res.status !== 200 && res.status !== 201) {
      console.log('Error!');
      throw new Error('Submitting your request failed!');
    }
    return res.json();
  })
  .then(resu => {
    console.log(resu.message);
    res.redirect(`/#${resu.message}`);
  })
  .catch(err => {
    console.log(err);
    res.redirect(`/#${err}`);
  });
};
    
exports.getPage = (req, res, next) => {
  WebData.fetchAll(webData => {
      res.render('portfolio/index', {
          webData: webData,
          pageTitle: 'LGB | Local Green Book',
          path: '/',
      });
  });
};