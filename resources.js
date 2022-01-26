const express = require('express');
const router = express.Router();

// API routing
router.use('/lifecycle', require('./controllers'));

module.exports = router;
