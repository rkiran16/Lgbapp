const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const getDataFromFile = (cb) => {
  let p = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'data.json'
  );
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class WebData {
  constructor(name,email,reason,message) {
    this.name = name;
    this.email = email;
    this.reason = reason;
    this.message = message;
  }

  save() {
    return fetch('http://1611917f.ngrok.io/admin/postwebrequest', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({name:this.name, email: this.email, reason: this.reason, message: this.message})
   })
  }

  static fetchAll(cb) {
    getDataFromFile(cb);
  }
};