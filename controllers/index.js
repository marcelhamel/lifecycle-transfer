const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.get('/', controller.getList);
router.post('/', controller.transferFlows);

module.exports = router;
