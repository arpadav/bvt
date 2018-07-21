var express = require('express');
var router = express.Router();

// views current file
// change currentFileProperties() to fetch from MONGODB INSTEAD
router.post('/viewfile', function(req, res){
	database.currentFileProperties(function(fileProperties){
		// perfect example of callback. REFERENCE!!!!!
		// have access to variable INSIDE function
		fs.readFile(fileProperties.path, function (err, data){
			if (err) throw err;
			res.contentType('application/pdf');
			res.send(data);
		});
	});
});

module.exports = router;
