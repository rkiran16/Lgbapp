const path = require('path');

const express = require('express');

const frontalController = require('../controllers/frontend');

const router = express.Router();

router.get('/', frontalController.getPage);

router.post('/submit-form', frontalController.submitData);

module.exports = router;
