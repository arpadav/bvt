var express = require('express');
var router = express.Router();

//display upload page
router.post('/upload', function(req, res, next){
	init.pdflist(req, function(cont){
		if (cont) next();
	});
}, function(req, res){
	PDFList.find({}, function(err, list){
		if (err) throw err;
		res.render('pages/upload', {
			pdfs: list
		});
	});
});

module.exports = router;
