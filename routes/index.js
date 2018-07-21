var express = require('express');
var router = express.Router();

//display homepage
router.get('/', function(req, res, next){
	init.pdflist(req, function(cont){
		if (cont) next();
	});
}, function(req, res){
	res.render('pages/index');
});

module.exports = router;
