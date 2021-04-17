var express = require('express');
var router = express.Router();

let json = {'test':'success'}
let result = JSON.stringify(json)

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(result)
});

router.get('/foo', function(req, res, next) {
  res.send('~~foo');
});

module.exports = router;
