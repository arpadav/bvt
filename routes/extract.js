var express = require('express');
var router = express.Router();

//trying to download CSV using tabula-js
router.post('/extract', function(req, res){
	// var q = url.parse(req.url, true).query;
	console.log(req.query);
	database.addarea({top: req.query.top, left: req.query.left, bottom: req.query.bottom, right: req.query.right}, function(cont){
		database.currentFileProperties(function(fileProperties){
			if (cont) tabula.csvdata(fileProperties.name, fileProperties.path, fileProperties.selections[0], function(data){
				if (data) res.download('./user/csvs/' + fileProperties.name + '.csv');
				else res.render('pages/index');
				// res.render('pages/tableselect', {
				// 	csvdata: data,
				// 	pdfs: list,
				// 	cpath: fileProperties.path
				// });
			});
		});
	});
});

module.exports = router;
