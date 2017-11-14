var express = require('express');
var router = express.Router();

// GET route for reading data
router.get('/', function(req, res, next) {
    console.log('website loaded');
    return res.sendFile(path.join(__dirname + '/public/index.html'));
});

module.exports = router;